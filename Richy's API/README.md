# Richy's API — Automated Delivery Location & Pricing

Customer flow: **enter address → pick suggestion → road distance calculated → delivery fee calculated → added to checkout → order placed.**

## Where the live code is
The app imports these from `src/`, so that is where they run. `source/` here is a reference copy for hand-over.

| Piece | Live file |
|---|---|
| Autocomplete + distance/quote server functions (Google Places & Routes) | `src/lib/delivery.functions.ts` |
| Address typeahead component | `src/components/AddressAutocomplete.tsx` |
| Checkout integration | `src/routes/checkout.tsx` |
| Admin pricing settings | `src/routes/_authenticated/admin.settings.tsx` ("Delivery pricing") |
| Database: quotes table, fee function, tamper-proof trigger | `supabase/migrations/20260929150000_delivery_pricing.sql` |

## Go-live checklist
1. **Run the migration** (`supabase/migrations/20260929150000_delivery_pricing.sql`). Lovable applies it on sync.
2. **Google Cloud**: create a project, enable billing, enable **Places API (New)** and **Routes API**, create an API key restricted to those two APIs (server key, no HTTP-referrer restriction).
3. **Add the secret** `GOOGLE_MAPS_API_KEY` to the server environment (Lovable Cloud secrets / hosting env vars). Never put it in a `VITE_` variable.
4. **Admin → Site Settings → Delivery pricing**: set the warehouse address, rates, then switch **Automatic delivery pricing** to **On** and save.
5. Place a test order at checkout.

Until step 4, checkout behaves exactly as before (manual address, no delivery fee).

## Pricing rules (all editable in admin)
- Fee = **base fee + price per km × road distance** (distance rounded up to 0.1 km).
  Example: GH₵20 + 10 km × GH₵4 = **GH₵60**. Products GH₵350 + delivery GH₵60 = **GH₵410**.
- **Flat-fee zones** (optional), e.g. `5:30, 15:60`: within 5 km = GH₵30, within 15 km = GH₵60; beyond the last zone the base + per-km rate applies.
- **Free delivery** from a chosen order total (0 = off).
- **Maximum delivery distance** (0 = no limit); farther addresses are refused with a clear message.

## Security
- The Google key is only read on the server.
- The server stores a short-lived (2 h) *quote* holding the measured distance. The database trigger on `orders` recomputes the fee from that distance and the pricing rules and forces `total = subtotal + fee`, so a customer cannot edit the delivery charge from the browser.
- If delivery pricing is On, an order without a valid quote is rejected.
- Autocomplete/quote endpoints are rate-limited per IP.

## Costs
Google Maps Platform usage is billed to the client's Google account (the planned USD 50 credit package), separate from the development fee.

## New platform database (Supabase project `hemqetzpjbfnsrguvyub`)
The complete schema was replayed from `supabase/migrations/` into a fresh Supabase project: orders/order_items, parts, variations, rentals & bookings, vehicles & reservations, categories, brands, repair requests, CMS content, announcements, notifications, shipments & tracking, staff permissions, storage buckets (`avatars`, `product-images`) and delivery pricing (`delivery_quotes`, fee function, tamper-proof order trigger). Function permissions were hardened afterwards.

Verified in that database: a tampered order fee is overwritten (10 km → GH₵60, GH₵350 order → GH₵410), free-delivery threshold, flat zones, orders rejected without a quote when pricing is On, and unchanged behaviour when Off.

**Not migrated:** data (orders, customers, products, images, user accounts) from the old Lovable database.

### Cut-over checklist
1. Site env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` → the new project (Supabase → Project Settings → API). Locally these live in the gitignored `.env.local`.
2. Server secrets (never commit): `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_MAPS_API_KEY`.
3. Supabase → Authentication → URL Configuration: set the Site URL and redirect URLs to the live domain. Configure email/Google sign-in providers.
4. Sign up once on the site, then in the SQL editor make yourself admin:
   `insert into user_roles (user_id, role, is_super_admin) select id, 'admin', true from auth.users where email = 'YOUR_EMAIL' on conflict (user_id, role) do update set is_super_admin = true;`
5. Re-enter products, vehicles and rentals in Admin (or import data from the old project).
