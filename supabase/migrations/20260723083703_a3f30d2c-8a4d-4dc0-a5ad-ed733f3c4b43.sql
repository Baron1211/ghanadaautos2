DROP POLICY IF EXISTS "Anyone can create reservation" ON public.vehicle_reservations;
CREATE POLICY "Anyone can create reservation"
ON public.vehicle_reservations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (
    auth.uid() IS NULL
    AND user_id IS NULL
    AND guest_name IS NOT NULL
    AND length(btrim(guest_name)) > 0
    AND guest_email IS NOT NULL
    AND length(btrim(guest_email)) > 0
    AND guest_phone IS NOT NULL
    AND length(btrim(guest_phone)) > 0
  )
  OR
  (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  )
);