DROP POLICY IF EXISTS "Anyone can create booking" ON public.rental_bookings;
CREATE POLICY "Guests and users create bookings" ON public.rental_bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users view own bookings" ON public.rental_bookings;
CREATE POLICY "Users view own bookings" ON public.rental_bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Guest bookings readable" ON public.rental_bookings
  FOR SELECT TO anon
  USING (user_id IS NULL);

GRANT SELECT, INSERT ON public.rental_bookings TO anon;
GRANT SELECT, INSERT ON public.rental_bookings TO authenticated;
GRANT ALL ON public.rental_bookings TO service_role;