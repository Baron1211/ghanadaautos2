ALTER TABLE public.rentals
  ADD COLUMN IF NOT EXISTS seats integer,
  ADD COLUMN IF NOT EXISTS transmission text,
  ADD COLUMN IF NOT EXISTS fuel text,
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb;