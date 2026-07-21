# GHANADA AUTOS — Build Plan

Faithful rebuild of the uploaded homepage, then layer the e-commerce/admin/customer features on top of Lovable Cloud.

## Phase 1 — Homepage (faithful rebuild)

Port the uploaded HTML into React + Tailwind v4 with matching structure, colors, typography, spacing, and shadows.

**Design system in `src/styles.css`** (`@theme`):
- Colors: `green #0F8A5F`, `dark-green #065F46`, `emerald #10B981`, `orange #F97316`, `bg #F8FAFC`, `text #1E293B`, `muted #64748B`.
- Fonts: Manrope (headings) + Inter (body) — loaded via `<link>` in `__root.tsx` head.
- Radius `18px`, pill buttons `100px`, three shadow tokens (`sm/md/lg`).

**Route structure**: single `/` route (rewrites `src/routes/index.tsx`), composed of section components under `src/components/home/`:

```text
Header  →  Hero  →  QuickServices  →  FeaturedVehicles  →  SpareParts
Rentals →  Repairs → BookRepair → ImportFromCanada → ClearingForwarding
WhyChooseUs → HowItWorks → Finance → Testimonials → Blog
PartnerBrands → Contact → Footer
```

Each section matches the uploaded HTML's DOM, copy, CTA count, and grid. Images use `generate_image` where placeholders exist (hero car, vehicle cards, parts, technicians, Canada import, etc.). Head metadata (title/description/OG) set to the GHANADA AUTOS copy.

## Phase 2 — Lovable Cloud backend

Enable Cloud, then build:

**Auth**
- Email/password + Google sign-in.
- `profiles` table (name, phone, avatar) auto-created via trigger.
- Separate `user_roles` table with `app_role` enum (`admin`, `customer`) and `has_role()` security-definer function.

**Product/e-commerce schema** (Postgres, all with RLS + GRANTs):
- `vehicles` (make, model, year, price, mileage, condition, images[], status)
- `parts` (name, sku, category, price, stock, images[], compatible_models[])
- `rentals` (vehicle_id, daily_rate, availability)
- `bookings` (customer_id, type: repair/rental/test-drive, date, status, notes)
- `orders` + `order_items` (customer_id, total, status)
- `import_requests` (customer_id, vehicle_spec, budget, status)
- `blog_posts` (title, slug, cover, body, published_at)
- Public `SELECT` policies for anon on catalog tables; owner-scoped policies for customer data; admin-only writes via `has_role`.

**Storage buckets**: `vehicle-images`, `part-images`, `blog-covers` (public read, admin write).

## Phase 3 — Admin panel (`/admin`, gated by `admin` role)
- Dashboard: orders, bookings, import requests counters.
- CRUD for vehicles, parts, rentals, blog posts.
- Manage bookings, orders, import requests (status updates).
- Image upload to storage.

## Phase 4 — Customer dashboard (`/dashboard`, `_authenticated`)
- Profile settings.
- My orders + order status tracking.
- My bookings (repair/rental/test-drive).
- My import requests.
- Saved vehicles / wishlist.

## Phase 5 — Storefront routes
- `/vehicles`, `/vehicles/$id`
- `/parts`, `/parts/$id`
- `/rentals`
- `/repairs` (book form)
- `/import` (request form)
- `/blog`, `/blog/$slug`
- `/cart`, `/checkout` (payment integration deferred until you pick a provider — Stripe/Paddle/local)

## Order of execution

I'll build **Phase 1 first** (homepage) so you can share it with the client, then move to Phases 2–5 in follow-up turns once the design is signed off. Payment provider choice we'll settle when we reach checkout.

## Technical notes
- All data reads via `createServerFn` (authed) or publishable client (public catalog).
- Route-level `head()` per page for SEO.
- No hardcoded colors in components — all via design tokens.
- Images generated to `src/assets/` and imported.
