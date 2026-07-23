CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Public can view active vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins manage vehicles" ON public.vehicles;
CREATE POLICY "Public can view active vehicles"
ON public.vehicles
FOR SELECT
TO anon, authenticated
USING (active = true);
CREATE POLICY "Admins view all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert vehicles"
ON public.vehicles
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update vehicles"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete vehicles"
ON public.vehicles
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone views active parts" ON public.parts;
DROP POLICY IF EXISTS "Admins insert parts" ON public.parts;
DROP POLICY IF EXISTS "Admins update parts" ON public.parts;
DROP POLICY IF EXISTS "Admins delete parts" ON public.parts;
CREATE POLICY "Anyone views active parts"
ON public.parts
FOR SELECT
TO anon, authenticated
USING (active = true);
CREATE POLICY "Admins view all parts"
ON public.parts
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert parts"
ON public.parts
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update parts"
ON public.parts
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete parts"
ON public.parts
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone can view active variations" ON public.part_variations;
DROP POLICY IF EXISTS "Admins manage variations" ON public.part_variations;
CREATE POLICY "Anyone can view active variations"
ON public.part_variations
FOR SELECT
TO anon, authenticated
USING (active = true);
CREATE POLICY "Admins view all variations"
ON public.part_variations
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert variations"
ON public.part_variations
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update variations"
ON public.part_variations
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete variations"
ON public.part_variations
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone views active rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins insert rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins update rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins delete rentals" ON public.rentals;
CREATE POLICY "Anyone views active rentals"
ON public.rentals
FOR SELECT
TO anon, authenticated
USING (active = true);
CREATE POLICY "Admins view all rentals"
ON public.rentals
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert rentals"
ON public.rentals
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update rentals"
ON public.rentals
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete rentals"
ON public.rentals
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users view own bookings" ON public.rental_bookings;
DROP POLICY IF EXISTS "Admins update bookings" ON public.rental_bookings;
DROP POLICY IF EXISTS "Admins delete bookings" ON public.rental_bookings;
CREATE POLICY "Users view own bookings"
ON public.rental_bookings
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update bookings"
ON public.rental_bookings
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete bookings"
ON public.rental_bookings
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users view own reservations" ON public.vehicle_reservations;
DROP POLICY IF EXISTS "Admins manage reservations" ON public.vehicle_reservations;
CREATE POLICY "Users view own reservations"
ON public.vehicle_reservations
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins view all reservations"
ON public.vehicle_reservations
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update reservations"
ON public.vehicle_reservations
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete reservations"
ON public.vehicle_reservations
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));