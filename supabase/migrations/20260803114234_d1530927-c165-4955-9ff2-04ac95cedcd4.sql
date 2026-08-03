
-- 1) Guest booking PII: replace open anon read with token-gated lookup
ALTER TABLE public.rental_bookings
  ADD COLUMN IF NOT EXISTS access_token uuid NOT NULL DEFAULT gen_random_uuid();

DROP POLICY IF EXISTS "Guest bookings readable" ON public.rental_bookings;

CREATE OR REPLACE FUNCTION public.get_guest_booking(_booking_number text, _access_token uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_jsonb(b) - 'access_token' || jsonb_build_object(
           'rental', jsonb_build_object('name', r.name, 'image_url', r.image_url))
  FROM public.rental_bookings b
  LEFT JOIN public.rentals r ON r.id = b.rental_id
  WHERE b.booking_number = _booking_number
    AND b.access_token = _access_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_guest_booking(text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_guest_booking(text, uuid) TO anon, authenticated, service_role;

-- 2) user_roles: role assignment restricted to admins / service role only
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 3) product-images readable by storefront visitors (bucket stays private, no writes for anon)
DROP POLICY IF EXISTS "Product images: authenticated read" ON storage.objects;
CREATE POLICY "Product images: public read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');
