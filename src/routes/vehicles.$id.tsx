import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/vehicles/$id")({
  head: () => ({
    meta: [
      { title: "Vehicle for Sale — Ghanada Autos" },
      { name: "description", content: "Reserve or request financing for this vehicle at Ghanada Autos." },
      { property: "og:title", content: "Vehicle for Sale — Ghanada Autos" },
      { property: "og:description", content: "Reserve or finance quality vehicles cleared and ready in Ghana." },
      { property: "og:type", content: "product" },
    ],
  }),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<"reserve" | "finance" | "inquiry">("reserve");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("vehicles").select("*").eq("id", id).eq("active", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const submit = async () => {
    if (!name || !email || !phone) { toast.error("Fill name, email and phone"); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const payload: any = {
      vehicle_id: id,
      user_id: u.user?.id ?? null,
      guest_name: name, guest_email: email, guest_phone: phone,
      intent,
      preferred_date: preferredDate || null,
      notes,
    };
    const { data, error } = await (supabase as any).from("vehicle_reservations").insert(payload).select("reservation_number").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Reservation ${data.reservation_number} received — we'll contact you shortly.`);
    navigate({ to: "/" });
  };

  if (isLoading) return <div className="ga-app-main"><p className="ga-muted">Loading…</p></div>;
  if (!vehicle) return (
    <div className="ga-app-main">
      <h1>Vehicle not found</h1>
      <Link to="/" className="ga-btn-primary">Back home</Link>
    </div>
  );

  const gallery: string[] = Array.isArray(vehicle.images) && vehicle.images.length ? vehicle.images : [vehicle.image_url].filter(Boolean);
  const features: string[] = Array.isArray(vehicle.features) ? vehicle.features : [];

  return (
    <div className="ga-detail">
      <div className="ga-detail-nav"><Link to="/">← Back to vehicles</Link></div>
      <div className="ga-detail-grid">
        <div className="ga-detail-media">
          <img src={vehicle.image_url || "/favicon.ico"} alt={vehicle.name} />
          {gallery.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {gallery.slice(0, 6).map((u) => <img key={u} src={u} alt="" style={{ height: 60, borderRadius: 6, border: "1px solid #ddd" }} />)}
            </div>
          )}
        </div>
        <div className="ga-detail-body">
          <div className="ga-detail-eyebrow">{vehicle.body_type || "Vehicle"} · {vehicle.brand || ""}</div>
          <h1>{vehicle.name}</h1>
          <div className="ga-detail-price">GHS {Number(vehicle.price).toLocaleString()}</div>
          <div className="ga-detail-meta" style={{ marginTop: 8 }}>
            {vehicle.year && <div>📅 {vehicle.year}</div>}
            {vehicle.mileage_km ? <div>🛣️ {Number(vehicle.mileage_km).toLocaleString()} km</div> : null}
            {vehicle.fuel && <div>⛽ {vehicle.fuel}</div>}
            {vehicle.transmission && <div>⚙️ {vehicle.transmission}</div>}
            {vehicle.seats && <div>👤 {vehicle.seats} seats</div>}
            {vehicle.color && <div>🎨 {vehicle.color}</div>}
          </div>
          <p className="ga-detail-desc">{vehicle.description || "Quality vehicle sourced by Ghanada Autos."}</p>

          {features.length > 0 && (
            <div style={{ margin: "12px 0" }}>
              <strong>Features</strong>
              <ul style={{ margin: "6px 0 0 18px" }}>
                {features.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          )}

          <div className="ga-booking-form">
            <h3>Reserve this vehicle</h3>
            <div className="ga-form-grid">
              <label className="ga-form-full">I want to
                <select value={intent} onChange={e => setIntent(e.target.value as any)}>
                  <option value="reserve">Reserve — pay deposit and hold</option>
                  {vehicle.finance_available && <option value="finance">Request financing</option>}
                  <option value="inquiry">Ask a question / test drive</option>
                </select>
              </label>
              <label>Your name<input value={name} onChange={e => setName(e.target.value)} /></label>
              <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
              <label>Phone<input value={phone} onChange={e => setPhone(e.target.value)} /></label>
              <label>Preferred date<input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} /></label>
              <label className="ga-form-full">Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything we should know?" /></label>
            </div>
            <button className="ga-btn-primary" onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit request"}</button>
            <p className="ga-muted ga-small">Our team confirms by email / WhatsApp. Deposits payable via bank transfer or Paystack.</p>
          </div>
        </div>
      </div>
    </div>
  );
}