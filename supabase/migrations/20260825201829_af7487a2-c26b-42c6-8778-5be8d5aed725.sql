-- =======================
-- 1. Super admin + permissions
-- =======================
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

UPDATE public.user_roles SET is_super_admin = true WHERE role = 'admin';

CREATE TABLE public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, section)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_permissions TO authenticated;
GRANT ALL ON public.admin_permissions TO service_role;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin' AND is_super_admin);
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _section text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin') AND (
    public.is_super_admin(_user_id)
    OR EXISTS (SELECT 1 FROM public.admin_permissions p WHERE p.user_id = _user_id AND p.section = _section)
  );
$$;

CREATE POLICY "Admins read permissions" ON public.admin_permissions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins insert permissions" ON public.admin_permissions
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins update permissions" ON public.admin_permissions
  FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins delete permissions" ON public.admin_permissions
  FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));

-- allow super admins to manage roles rows (grant/revoke staff)
DROP POLICY IF EXISTS "Super admins manage roles" ON public.user_roles;
CREATE POLICY "Super admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- =======================
-- 2. Repair requests
-- =======================
CREATE TABLE public.repair_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text NOT NULL UNIQUE DEFAULT 'RR-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  vehicle_type text NOT NULL DEFAULT 'Sedan',
  make text,
  model text,
  year integer,
  part text NOT NULL,
  service text,
  preferred_date date,
  preferred_time text,
  location text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  quote_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_requests TO authenticated;
GRANT ALL ON public.repair_requests TO service_role;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own repair requests" ON public.repair_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_permission(auth.uid(), 'repairs'));
CREATE POLICY "Users create own repair requests" ON public.repair_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff update repair requests" ON public.repair_requests
  FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'repairs'));
CREATE POLICY "Staff delete repair requests" ON public.repair_requests
  FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'repairs'));

CREATE TRIGGER trg_repair_requests_updated BEFORE UPDATE ON public.repair_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE FUNCTION public.create_repair_request(_req jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.repair_requests;
BEGIN
  IF COALESCE(trim(_req->>'customer_name'),'') = '' OR COALESCE(trim(_req->>'customer_phone'),'') = ''
     OR COALESCE(trim(_req->>'part'),'') = '' THEN
    RAISE EXCEPTION 'Name, phone and the part to repair are required';
  END IF;

  INSERT INTO public.repair_requests (
    user_id, customer_name, customer_phone, customer_email, vehicle_type,
    make, model, year, part, service, preferred_date, preferred_time, location, notes
  ) VALUES (
    auth.uid(),
    left(trim(_req->>'customer_name'),120),
    left(trim(_req->>'customer_phone'),40),
    left(NULLIF(trim(COALESCE(_req->>'customer_email','')),''),200),
    left(COALESCE(NULLIF(trim(COALESCE(_req->>'vehicle_type','')),''),'Sedan'),40),
    left(COALESCE(_req->>'make',''),80),
    left(COALESCE(_req->>'model',''),80),
    NULLIF(_req->>'year','')::int,
    left(trim(_req->>'part'),160),
    left(COALESCE(_req->>'service',''),120),
    NULLIF(_req->>'preferred_date','')::date,
    left(COALESCE(_req->>'preferred_time',''),20),
    left(COALESCE(_req->>'location',''),200),
    left(COALESCE(_req->>'notes',''),2000)
  ) RETURNING * INTO _row;

  RETURN _row.request_number;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_repair_request(jsonb) TO anon, authenticated;

-- =======================
-- 3. Site content (CMS)
-- =======================
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff write site content" ON public.site_content
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'content'))
  WITH CHECK (public.has_permission(auth.uid(), 'content'));
CREATE TRIGGER trg_site_content_updated BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =======================
-- 4. Announcements (site banner)
-- =======================
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  link_url text,
  link_label text,
  style text NOT NULL DEFAULT 'info',
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active announcements" ON public.announcements
  FOR SELECT TO anon, authenticated USING (active OR public.has_permission(auth.uid(), 'notifications'));
CREATE POLICY "Staff write announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'notifications'))
  WITH CHECK (public.has_permission(auth.uid(), 'notifications'));
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =======================
-- 5. Notifications
-- =======================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'info',
  link_url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user ON public.notifications (user_id, created_at DESC);

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_permission(auth.uid(), 'notifications'));
CREATE POLICY "Staff send notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'notifications') OR public.has_permission(auth.uid(), 'tracking') OR public.has_permission(auth.uid(), 'orders'));
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff delete notifications" ON public.notifications
  FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'notifications'));

CREATE OR REPLACE FUNCTION public.broadcast_notification(_title text, _body text, _kind text DEFAULT 'info', _link text DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _count integer;
BEGIN
  IF NOT public.has_permission(auth.uid(), 'notifications') THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  INSERT INTO public.notifications (user_id, title, body, kind, link_url)
  SELECT p.id, _title, _body, COALESCE(_kind,'info'), _link FROM public.profiles p;
  SELECT count(*) INTO _count FROM public.profiles;
  RETURN _count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.broadcast_notification(text, text, text, text) TO authenticated;

-- =======================
-- 6. Shipments & tracking
-- =======================
CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text NOT NULL UNIQUE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text,
  customer_email text,
  description text,
  carrier text,
  status text NOT NULL DEFAULT 'pending',
  current_location text,
  eta date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own shipments" ON public.shipments
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_permission(auth.uid(), 'tracking'));
CREATE POLICY "Staff write shipments" ON public.shipments
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'tracking'))
  WITH CHECK (public.has_permission(auth.uid(), 'tracking'));
CREATE TRIGGER trg_shipments_updated BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text,
  message text,
  happened_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipment_events TO authenticated;
GRANT ALL ON public.shipment_events TO service_role;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_shipment_events_shipment ON public.shipment_events (shipment_id, happened_at DESC);

CREATE POLICY "Owners read own shipment events" ON public.shipment_events
  FOR SELECT TO authenticated USING (
    public.has_permission(auth.uid(), 'tracking')
    OR EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Staff write shipment events" ON public.shipment_events
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'tracking'))
  WITH CHECK (public.has_permission(auth.uid(), 'tracking'));

-- keep shipment header in sync and notify the customer
CREATE OR REPLACE FUNCTION public.tg_shipment_event_applied()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s public.shipments;
BEGIN
  UPDATE public.shipments
     SET status = NEW.status,
         current_location = COALESCE(NULLIF(NEW.location,''), current_location)
   WHERE id = NEW.shipment_id
  RETURNING * INTO _s;

  IF _s.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, kind, link_url)
    VALUES (
      _s.user_id,
      'Shipment update: ' || _s.tracking_number,
      COALESCE(NEW.message, 'Status is now ' || NEW.status) ||
        CASE WHEN COALESCE(NEW.location,'') <> '' THEN ' (' || NEW.location || ')' ELSE '' END,
      'shipping',
      '/track?number=' || _s.tracking_number
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_shipment_event_applied AFTER INSERT ON public.shipment_events
  FOR EACH ROW EXECUTE FUNCTION public.tg_shipment_event_applied();

-- public lookup: shipping info only, no personal data
CREATE OR REPLACE FUNCTION public.track_shipment(_tracking_number text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'tracking_number', s.tracking_number,
    'description', s.description,
    'carrier', s.carrier,
    'status', s.status,
    'current_location', s.current_location,
    'eta', s.eta,
    'created_at', s.created_at,
    'events', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'status', e.status, 'location', e.location, 'message', e.message, 'happened_at', e.happened_at
      ) ORDER BY e.happened_at DESC)
      FROM public.shipment_events e WHERE e.shipment_id = s.id
    ), '[]'::jsonb)
  )
  FROM public.shipments s
  WHERE upper(s.tracking_number) = upper(trim(_tracking_number))
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.track_shipment(text) TO anon, authenticated;

-- =======================
-- 7. Exchange rate default
-- =======================
INSERT INTO public.site_settings (key, value)
VALUES ('fx_rate', jsonb_build_object('cad_to_ghs', 8.5))
ON CONFLICT (key) DO NOTHING;