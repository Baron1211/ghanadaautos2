DELETE FROM public.rental_bookings WHERE guest_email = 't@t.com';
ALTER TABLE public.rental_bookings ALTER COLUMN currency SET DEFAULT 'GHS';
UPDATE public.rental_bookings SET currency = 'GHS' WHERE currency = 'CAD';