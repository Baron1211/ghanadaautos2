
-- ============ PART VARIATIONS ============
CREATE TABLE public.part_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  label text NOT NULL,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  price numeric NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.part_variations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.part_variations TO authenticated;
GRANT ALL ON public.part_variations TO service_role;
ALTER TABLE public.part_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active variations" ON public.part_variations FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage variations" ON public.part_variations FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_part_variations_updated BEFORE UPDATE ON public.part_variations FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

GRANT SELECT ON public.parts TO anon;
GRANT SELECT ON public.rentals TO anon;

-- ============ RENTAL BOOKINGS ============
CREATE TABLE public.rental_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text NOT NULL UNIQUE DEFAULT ('RB-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  rental_id uuid NOT NULL REFERENCES public.rentals(id) ON DELETE RESTRICT,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name text,
  guest_email text,
  guest_phone text,
  pickup_date date NOT NULL,
  return_date date NOT NULL,
  days integer NOT NULL,
  destination text,
  with_driver boolean NOT NULL DEFAULT false,
  daily_rate numeric NOT NULL,
  driver_daily_fee numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL,
  total numeric NOT NULL,
  currency text NOT NULL DEFAULT 'CAD',
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_ref text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.rental_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_bookings TO authenticated;
GRANT ALL ON public.rental_bookings TO service_role;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON public.rental_bookings FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create booking" ON public.rental_bookings FOR INSERT WITH CHECK (
  (user_id IS NULL AND auth.uid() IS NULL) OR (user_id = auth.uid())
);
CREATE POLICY "Admins update bookings" ON public.rental_bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings" ON public.rental_bookings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_rental_bookings_updated BEFORE UPDATE ON public.rental_bookings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ ORDERS — GUEST SUPPORT ============
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_ref text;

GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT ON public.order_items TO anon;

DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Read own or admin orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Insert own or guest orders" ON public.orders FOR INSERT WITH CHECK (
  (user_id IS NULL AND auth.uid() IS NULL) OR (user_id = auth.uid())
);
CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users insert own order items" ON public.order_items;
CREATE POLICY "Read items via order" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Insert items with order" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
    (o.user_id IS NULL AND auth.uid() IS NULL) OR o.user_id = auth.uid()
  ))
);

-- ============ CART VARIATION ============
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS variation_id uuid REFERENCES public.part_variations(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variation_id uuid;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variation_label text;

-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins write settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('driver_daily_fee', '{"amount": 40, "currency": "CAD"}'::jsonb),
  ('contact', '{"phone_ca":"+1 437 436 4357","phone_gh":"+233 547 464 093","whatsapp":"+1 437 436 4357","address_ca":"Toronto, Canada","address_gh":"Takoradi, Ghana","email":"info@ghanadaautos.com"}'::jsonb),
  ('hero', '{"eyebrow":"Ghana''s Complete Automotive Company","title":"Your Complete Automotive Partner","subtitle":"Buy Cars, Rent Cars, Repair Vehicles, Genuine Spare Parts, Import From Canada, Clearing & Forwarding"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
