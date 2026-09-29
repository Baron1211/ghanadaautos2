-- Rebrand: Canada -> China, new contact details, Takoradi -> Accra, GHS-only.
UPDATE public.site_settings
SET value = jsonb_build_object(
  'email', 'netwekusa@gmail.com',
  'phone_ca', '+233 592 495 787',
  'phone_gh', '+233 592 495 787',
  'whatsapp', '+233 592 495 787',
  'address_ca', 'Guangzhou, China',
  'address_gh', 'Accra, Ghana'
), updated_at = now()
WHERE key = 'contact';

UPDATE public.site_settings
SET value = jsonb_set(value, '{subtitle}', to_jsonb(replace(value->>'subtitle', 'Import From Canada', 'Import From China'))),
    updated_at = now()
WHERE key = 'hero' AND value->>'subtitle' LIKE '%Canada%';

UPDATE public.site_settings
SET value = jsonb_set(value, '{currency}', '"GHS"'), updated_at = now()
WHERE key = 'driver_daily_fee';

UPDATE public.vehicles
SET description = replace(description, 'Toronto import', 'Guangzhou import')
WHERE description LIKE '%Toronto import%';
