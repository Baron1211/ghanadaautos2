GRANT SELECT ON public.vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;

GRANT SELECT ON public.parts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.parts TO authenticated;
GRANT ALL ON public.parts TO service_role;

GRANT SELECT ON public.part_variations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.part_variations TO authenticated;
GRANT ALL ON public.part_variations TO service_role;

GRANT SELECT ON public.rentals TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rentals TO authenticated;
GRANT ALL ON public.rentals TO service_role;