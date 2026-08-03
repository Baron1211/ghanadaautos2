
CREATE OR REPLACE FUNCTION public.create_rental_booking(_booking jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.rental_bookings;
  _rate numeric;
  _driver_fee numeric;
  _days int;
BEGIN
  SELECT daily_rate INTO _rate FROM public.rentals WHERE id = (_booking->>'rental_id')::uuid AND active IS NOT FALSE;
  IF _rate IS NULL THEN RAISE EXCEPTION 'Rental not available'; END IF;

  _days := GREATEST(1, LEAST(365, COALESCE((_booking->>'days')::int, 1)));
  _driver_fee := CASE WHEN COALESCE((_booking->>'with_driver')::boolean, false)
    THEN COALESCE((SELECT (value->>'amount')::numeric FROM public.site_settings WHERE key = 'driver_daily_fee'), 40)
    ELSE 0 END;

  IF COALESCE(trim(_booking->>'guest_name'),'') = ''
     OR COALESCE(trim(_booking->>'guest_email'),'') = ''
     OR COALESCE(trim(_booking->>'guest_phone'),'') = '' THEN
    RAISE EXCEPTION 'Name, email and phone are required';
  END IF;
  IF (_booking->>'guest_email') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  INSERT INTO public.rental_bookings (
    rental_id, user_id, guest_name, guest_email, guest_phone,
    pickup_date, return_date, days, destination, with_driver,
    daily_rate, driver_daily_fee, subtotal, total, notes
  ) VALUES (
    (_booking->>'rental_id')::uuid,
    auth.uid(),
    left(trim(_booking->>'guest_name'), 120),
    left(trim(_booking->>'guest_email'), 200),
    left(trim(_booking->>'guest_phone'), 40),
    (_booking->>'pickup_date')::date,
    (_booking->>'return_date')::date,
    _days,
    left(COALESCE(_booking->>'destination',''), 300),
    COALESCE((_booking->>'with_driver')::boolean, false),
    _rate, _driver_fee,
    _rate * _days,
    (_rate + _driver_fee) * _days,
    left(COALESCE(_booking->>'notes',''), 1000)
  ) RETURNING * INTO _row;

  RETURN jsonb_build_object('booking_number', _row.booking_number, 'access_token', _row.access_token);
END;
$$;

REVOKE ALL ON FUNCTION public.create_rental_booking(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_rental_booking(jsonb) TO anon, authenticated, service_role;
