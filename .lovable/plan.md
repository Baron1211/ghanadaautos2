## What we're building

A complete e-commerce + rental system on top of the existing homepage.

### 1. Database changes (one migration)

- `part_variations` — per-part SKUs with own price, stock, image, attributes (e.g. "Size: 205/55R16", "Fits: Toyota Corolla 2015").
- `rental_bookings` — separate from parts orders. Fields: rental_id, user_id (nullable for guest), guest_name/email/phone, pickup_date, return_date, destination, with_driver (bool), daily_rate, driver_daily_fee, days, total, status.
- `orders` — add: guest_name, guest_email, payment_method ('paystack'|'cod'), payment_status, payment_ref. Make `user_id` nullable for guest checkout.
- `cart_items` — add `variation_id` (nullable).
- `site_settings` — key/value JSON store for banners, driver fee, contact info, service descriptions.
- Add GRANT SELECT to `anon` on `parts`, `part_variations`, `rentals` so guests can browse.
- All admin-write RLS uses existing `has_role(auth.uid(),'admin')`.

### 2. Public product & rental pages

- `/parts/$id` — hero image, description, variation selector, stock, quantity, Add to Cart, Buy Now (guest checkout).
- `/rentals/$id` — car details, date pickers, destination input, self-drive vs with-driver toggle (shows extra $/day from `site_settings.driver_daily_fee`), computed total, "Book Now".
- Wire homepage cards + parts/rentals lists to link into these pages.

### 3. Checkout

- `/checkout` — supports both authenticated and guest. Collects name, email, phone, address.
- Payment method radio: **Paystack** (placeholder button — real integration comes next when you provide the Paystack keys) and **Cash on delivery / bank transfer**.
- On submit: creates `orders` + `order_items`, clears cart, redirects to `/orders/$orderNumber` confirmation page (works for guests via order_number lookup).
- Rental bookings go through `/rentals/$id/book` → creates `rental_bookings` row, confirmation page.

### 4. Customer dashboard (extend existing `/dashboard`)

- Tabs: **My Orders**, **My Rentals**, **Profile**.
- Each order/rental expandable to show items, status, receipt/print view.

### 5. Admin panel (extend existing `/admin`)

Existing: index (stats), parts, rentals, orders, users. Add / upgrade:

- **Parts admin**: create/edit/delete + image upload to `product-images` bucket + manage variations inline (add/remove/edit each variation's price/stock/attributes).
- **Rentals admin**: create/edit/delete + image upload + set daily_rate; global driver fee configured in Site Settings.
- **Orders admin**: filter by status, update status (pending → confirmed → shipped → delivered → cancelled), view customer details, mark paid.
- **Rental bookings admin** (new page): view all bookings, confirm/cancel, contact customer.
- **Users admin**: existing list + toggle admin role.
- **Site Settings** (new page): edit driver daily fee, contact phones, WhatsApp number, addresses, hero tagline. Homepage reads from `site_settings` with sensible fallbacks.

### 6. Paystack

Placeholder now. When you're ready, share the Paystack public + secret keys and we'll wire the inline checkout + server-side verification webhook in a follow-up.

### Technical notes

- Server functions for order/booking creation (they must run under `requireSupabaseAuth` for signed-in users, and via a public `/api/public/*` route for guests to avoid the auth gate).
- Image upload via `supabase.storage.from('product-images')` from the admin UI.
- All new tables get GRANT + RLS + `updated_at` trigger following the standard pattern.
- Route file for guest order lookup uses `order_number` + email as a light auth check.

Proceed?