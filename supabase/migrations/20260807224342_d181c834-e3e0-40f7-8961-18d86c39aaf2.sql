ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS price_cad numeric;
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS price_cad numeric;
ALTER TABLE public.part_variations ADD COLUMN IF NOT EXISTS price_cad numeric;
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS daily_rate_cad numeric;