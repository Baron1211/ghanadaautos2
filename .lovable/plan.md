# Admin platform upgrade: repairs, staff roles, CMS, notifications, FX rate, tracking

Six connected features, built on the existing admin console and customer dashboard.

## 1. Repair requests

Customer side (`/repairs`): the existing booking form becomes a real request form with car type (SUV/Sedan/Pickup/Van/Motorcycle), make, model, year, the body part / area to repair, plus name, phone, email, preferred date, location and a description. Works for guests and signed-in users.

Admin side: new "Repair Requests" page listing every request with vehicle details, contact info, status (new → contacted → scheduled → in progress → completed → cancelled), an internal note field, and a quote amount. Count of new requests shows on the admin overview.

## 2. Super admin + staff permissions

- The current admin accounts become **super admins**.
- Super admins can invite/onboard staff by email and toggle access per admin section: Vehicles, Parts, Rentals, Catalog, Orders, Bookings, Repair Requests, Users, CMS/Content, Notifications, Tracking, Settings.
- The admin sidebar only shows sections a staff member is allowed to see, and each page blocks access if the permission is off. Database rules enforce it too, not just the UI.
- Only super admins can manage staff, permissions, and the exchange rate.

## 3. CMS for site text and images

New "Content" section in the admin panel with tabs for each part of the site: homepage hero and carousel slides, service cards, testimonials, section headings, about/contact blocks, footer text, and contact details. Every field is editable text, and image fields use the existing uploader with previews. Changes appear on the public site immediately, with the current wording kept as fallback so nothing ever renders blank.

Editing UI is a clean two-column layout on desktop that collapses to stacked cards with sticky save on mobile.

## 4. Site-wide notification banner

Admin creates a banner: message, optional link, style (info / promo / warning), and an on/off switch. When on, it shows at the top of every public page; visitors can dismiss it, and it stays hidden for them until the message changes. Turning it off removes it instantly.

## 5. Personal notifications to signed-in users

Admin can send a notification to one user, to all customers, or to everyone attached to a specific order — for shipping updates, payment confirmations, or general messages. Users get a bell with an unread count in the header and a Notifications tab in their dashboard, with read/unread state. In-app only, no emails.

Order status changes and tracking updates automatically generate a notification for the customer.

## 6. Currency rate (CAD ↔ GHS)

Super admin sets one exchange rate in settings. Every CAD price on the site is calculated from the product's GHS price using that rate — product cards, detail pages, cart and checkout. The per-product CAD fields are removed from the admin forms, and existing stored CAD values stop being used. The rate change takes effect everywhere at once, and the settings page shows a live example ("GH₵ 100,000 = CAD $X") before saving.

## 7. Tracking system

- Admin can add tracking to an order, or create a standalone shipment record for imports that never went through the website checkout.
- Each tracking record has a tracking number, current status (pending → received → in transit → at port → clearing → ready for pickup → delivered), current location, estimated arrival, and a timeline of updates where each entry has a status, location, date and an admin message.
- Customers see tracking in their dashboard order view; anyone can look up a shipment on a new public `/track` page using the tracking number. The timeline renders as a vertical stepper on desktop and a compact list on mobile.
- Adding a timeline entry notifies the linked customer automatically.

## Technical notes

- One migration adds: `repair_requests`, `admin_permissions` (per-user section flags) plus an `is_super_admin` marker on roles, `site_content` (key/value, reusing the existing `site_settings` pattern), `announcements`, `notifications`, `shipments` and `shipment_events`. All get GRANTs, RLS, and `updated_at` triggers.
- Public write paths (guest repair requests, public tracking lookup by number) go through security-definer functions so no table is exposed to anonymous reads beyond what's needed; tracking lookup returns no personal data.
- Permission checks use a `has_permission(user_id, section)` security-definer function used both in RLS policies and in the admin UI guard.
- `DualPrice` switches to deriving CAD from the GHS amount and the rate loaded from settings via a small shared hook, so the component API stays the same across all existing call sites.
- The exchange rate and content keys are cached client-side per session to avoid refetching on every page.
- New routes: `/track`, `/admin/repairs`, `/admin/staff`, `/admin/content`, `/admin/notifications`, `/admin/tracking`, and a Notifications tab in the customer dashboard.
