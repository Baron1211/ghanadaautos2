
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS engine text,
  ADD COLUMN IF NOT EXISTS interior_color text,
  ADD COLUMN IF NOT EXISTS drivetrain text,
  ADD COLUMN IF NOT EXISTS vin text,
  ADD COLUMN IF NOT EXISTS stock_number text,
  ADD COLUMN IF NOT EXISTS package_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS standard_equipment jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS technical_specs jsonb NOT NULL DEFAULT '[]'::jsonb;
