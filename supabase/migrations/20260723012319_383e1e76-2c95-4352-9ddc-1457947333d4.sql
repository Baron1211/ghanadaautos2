
-- Vehicles for sale
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  model text,
  year int,
  body_type text,
  price numeric NOT NULL DEFAULT 0,
  mileage_km int DEFAULT 0,
  fuel text,
  transmission text,
  seats int,
  color text,
  description text,
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  finance_available boolean DEFAULT false,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active vehicles" ON public.vehicles
  FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage vehicles" ON public.vehicles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Vehicle reservations / inquiries
CREATE TABLE public.vehicle_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number text UNIQUE NOT NULL DEFAULT ('RES-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id uuid,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  intent text NOT NULL DEFAULT 'reserve', -- reserve | finance | inquiry
  preferred_date date,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.vehicle_reservations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_reservations TO authenticated;
GRANT ALL ON public.vehicle_reservations TO service_role;

ALTER TABLE public.vehicle_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create reservation" ON public.vehicle_reservations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own reservations" ON public.vehicle_reservations
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage reservations" ON public.vehicle_reservations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER vehicle_reservations_updated_at BEFORE UPDATE ON public.vehicle_reservations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
