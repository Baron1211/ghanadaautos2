-- Automated delivery location & pricing
-- 1) order columns  2) server-issued quotes  3) pricing function  4) tamper-proof trigger  5) default settings

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_distance_km numeric,
  ADD COLUMN IF NOT EXISTS delivery_place_id text,
  ADD COLUMN IF NOT EXISTS delivery_lat double precision,
  ADD COLUMN IF NOT EXISTS delivery_lng double precision,
  ADD COLUMN IF NOT EXISTS delivery_quote_id uuid;

-- Quotes are written only by the server (service role). No client policies on purpose.
CREATE TABLE IF NOT EXISTS public.delivery_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text NOT NULL,
  address text NOT NULL,
  lat double precision,
  lng double precision,
  distance_km numeric NOT NULL CHECK (distance_km >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '2 hours'
);
ALTER TABLE public.delivery_quotes ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.delivery_quotes TO service_role;

-- Single source of truth for delivery pricing (used by the quote preview AND the order trigger).
CREATE OR REPLACE FUNCTION public.compute_delivery_fee(_distance_km numeric, _subtotal numeric)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg jsonb;
  base numeric;
  per_km numeric;
  free_at numeric;
  zone jsonb;
  fee numeric;
BEGIN
  SELECT value INTO cfg FROM public.site_settings WHERE key = 'delivery';
  IF cfg IS NULL THEN RETURN 0; END IF;

  base    := COALESCE((cfg->>'base_fee')::numeric, 0);
  per_km  := COALESCE((cfg->>'per_km')::numeric, 0);
  free_at := COALESCE((cfg->>'free_threshold')::numeric, 0);

  IF free_at > 0 AND _subtotal >= free_at THEN RETURN 0; END IF;

  -- Optional flat-fee zones, e.g. [{"max_km":5,"fee":30},{"max_km":15,"fee":60}]; first match wins.
  FOR zone IN
    SELECT z FROM jsonb_array_elements(COALESCE(cfg->'zones', '[]'::jsonb)) z
    ORDER BY (z->>'max_km')::numeric
  LOOP
    IF _distance_km <= (zone->>'max_km')::numeric THEN
      RETURN round((zone->>'fee')::numeric, 2);
    END IF;
  END LOOP;

  fee := base + per_km * _distance_km;
  RETURN round(GREATEST(fee, 0), 2);
END;
$$;
REVOKE ALL ON FUNCTION public.compute_delivery_fee(numeric, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_delivery_fee(numeric, numeric) TO service_role;

-- Overrides whatever delivery fee / total the browser sends.
CREATE OR REPLACE FUNCTION public.apply_delivery_quote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg jsonb;
  q public.delivery_quotes%ROWTYPE;
BEGIN
  SELECT value INTO cfg FROM public.site_settings WHERE key = 'delivery';

  IF COALESCE((cfg->>'enabled')::boolean, false) = false THEN
    -- Feature off: behave exactly as before, but never trust a client-sent fee.
    NEW.delivery_fee := 0;
    NEW.delivery_quote_id := NULL;
    RETURN NEW;
  END IF;

  IF NEW.delivery_quote_id IS NULL THEN
    RAISE EXCEPTION 'Please choose your delivery address so we can calculate delivery.';
  END IF;

  SELECT * INTO q FROM public.delivery_quotes WHERE id = NEW.delivery_quote_id;
  IF NOT FOUND OR q.expires_at < now() THEN
    RAISE EXCEPTION 'Your delivery quote expired. Please re-select your delivery address.';
  END IF;

  NEW.delivery_distance_km := q.distance_km;
  NEW.delivery_place_id := q.place_id;
  NEW.delivery_lat := q.lat;
  NEW.delivery_lng := q.lng;
  NEW.delivery_fee := public.compute_delivery_fee(q.distance_km, COALESCE(NEW.subtotal, 0));
  NEW.total := COALESCE(NEW.subtotal, 0) + NEW.delivery_fee;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_apply_delivery_quote ON public.orders;
CREATE TRIGGER orders_apply_delivery_quote
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.apply_delivery_quote();

-- Defaults. Disabled until the Google Maps key is added and an admin switches it on.
INSERT INTO public.site_settings (key, value) VALUES (
  'delivery',
  '{
    "enabled": false,
    "warehouse_address": "Accra, Ghana",
    "warehouse_lat": null,
    "warehouse_lng": null,
    "base_fee": 20,
    "per_km": 4,
    "free_threshold": 0,
    "max_distance_km": 0,
    "zones": []
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;
