import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/rentals/$id")({
  head: () => ({
    meta: [
      { title: "Rent a Car — Ghanada Autos" },
      { name: "description", content: "Book a rental car with Ghanada Autos — self-drive or with a professional driver." },
      { property: "og:title", content: "Rent a Car — Ghanada Autos" },
      { property: "og:description", content: "Self-drive or request a driver — flexible car rentals in Ghana and Canada." },
      { property: "og:type", content: "product" },
    ],
  }),
  component: RentalDetail,
});

function daysBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(d));
}

function RentalDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [pickup, setPickup] = useState(today);
  const [ret, setRet] = useState(tomorrow);
  const [destination, setDestination] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: rental, isLoading } = useQuery({
    queryKey: ["rental", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("rentals").select("*").eq("id", id).eq("active", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: settings } = useQuery({
    queryKey: ["settings", "driver_daily_fee"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "driver_daily_fee").maybeSingle();
      return data?.value as { amount: number; currency: string } | undefined;
    },
  });

  const driverFee = settings?.amount ?? 40;
  const days = useMemo(() => daysBetween(pickup, ret), [pickup, ret]);
  const rate = rental ? Number(rental.daily_rate) : 0;
  const subtotal = rate * days;
  const driverCost = withDriver ? driverFee * days : 0;
  const total = subtotal + driverCost;

  const book = async () => {
    if (!name || !email || !phone) { toast.error("Fill name, email and phone"); return; }
    if (days < 1) { toast.error("Return date must be after pickup"); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const payload = {
      rental_id: id,
      user_id: u.user?.id ?? null,
      guest_name: name, guest_email: email, guest_phone: phone,
      pickup_date: pickup, return_date: ret, days,
      destination, with_driver: withDriver,
      daily_rate: rate, driver_daily_fee: withDriver ? driverFee : 0,
      subtotal, total,
      notes,
    };
    const { data, error } = await supabase.from("rental_bookings").insert(payload).select("booking_number").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Booking ${data.booking_number} received`);
    navigate({ to: "/bookings/$number", params: { number: data.booking_number } });
  };

  if (isLoading) return <div className="ga-app-main"><p className="ga-muted">Loading…</p></div>;
  if (!rental) return (
    <div className="ga-app-main">
      <h1>Rental not found</h1>
      <Link to="/" className="ga-btn-primary">Back home</Link>
    </div>
  );

  return (
    <div className="ga-detail">
      <div className="ga-detail-nav"><Link to="/">← Back to rentals</Link></div>
      <div className="ga-detail-grid">
        <div className="ga-detail-media">
          <img src={rental.image_url || "/favicon.ico"} alt={rental.name} />
        </div>
        <div className="ga-detail-body">
          <div className="ga-detail-eyebrow">{rental.vehicle_type || "Rental"}</div>
          <h1>{rental.name}</h1>
          <div className="ga-detail-price">GHS {rate.toFixed(2)} / day</div>
          <p className="ga-detail-desc">{rental.description || "Ready for pickup at Toronto or Takoradi."}</p>

          {(rental.seats || rental.transmission || rental.fuel) && (
            <div className="ga-shop-specs" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, margin: "16px 0" }}>
              {rental.seats && <div><small>Seats</small><strong>👤 {rental.seats}</strong></div>}
              {rental.transmission && <div><small>Transmission</small><strong>⚙️ {rental.transmission}</strong></div>}
              {rental.fuel && <div><small>Fuel</small><strong>⛽ {rental.fuel}</strong></div>}
            </div>
          )}
          {Array.isArray(rental.features) && rental.features.length > 0 && (
            <div>
              <h3 style={{ marginTop: 8 }}>Features</h3>
              <div className="ga-shop-features">
                {rental.features.map((f: string) => <span key={f} className="ga-shop-feature">✓ {f}</span>)}
              </div>
            </div>
          )}

          <div className="ga-booking-form">
            <h3>Book this vehicle</h3>
            <div className="ga-form-grid">
              <label>Pickup date<input type="date" value={pickup} min={today} onChange={e => setPickup(e.target.value)} /></label>
              <label>Return date<input type="date" value={ret} min={pickup} onChange={e => setRet(e.target.value)} /></label>
              <label className="ga-form-full">Destination / Trip purpose<input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Accra → Kumasi, or Airport transfer" /></label>
              <label className="ga-form-full ga-driver-toggle">
                <input type="checkbox" checked={withDriver} onChange={e => setWithDriver(e.target.checked)} />
                <span>
                  <strong>Request a driver</strong>
                  <small>+ GHS {driverFee.toFixed(2)} / day — professional chauffeur included</small>
                </span>
              </label>
              <label>Your name<input value={name} onChange={e => setName(e.target.value)} /></label>
              <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
              <label>Phone<input value={phone} onChange={e => setPhone(e.target.value)} /></label>
              <label className="ga-form-full">Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} /></label>
            </div>

            <div className="ga-booking-summary">
              <div><span>Daily rate × {days} day(s)</span><strong>GHS {subtotal.toFixed(2)}</strong></div>
              {withDriver && <div><span>Driver × {days} day(s)</span><strong>GHS {driverCost.toFixed(2)}</strong></div>}
              <div className="ga-booking-total"><span>Total</span><strong>GHS {total.toFixed(2)}</strong></div>
            </div>

            <button className="ga-btn-primary" onClick={book} disabled={busy}>{busy ? "Submitting…" : "Confirm booking"}</button>
            <p className="ga-muted ga-small">Our team confirms your booking by email/WhatsApp. Payment via Paystack or bank transfer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}