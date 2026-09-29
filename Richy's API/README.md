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
