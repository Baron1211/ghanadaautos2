import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { normalizeImages } from "@/lib/images";

export const Route = createFileRoute("/vehicles/$id")({
  head: () => ({
    meta: [
      { title: "Vehicle for Sale — Ghanada Autos" },
      { name: "description", content: "Buy this quality vehicle from Ghanada Autos — inspected, cleared, and ready to drive." },
      { property: "og:title", content: "Vehicle for Sale — Ghanada Autos" },
      { property: "og:description", content: "Buy this quality vehicle from Ghanada Autos — inspected, cleared, and ready to drive." },
      { property: "og:type", content: "product" },
    ],
  }),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [showReserve, setShowReserve] = useState(false);
  const [intent, setIntent] = useState<"finance" | "inquiry">("finance");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("vehicles").select("*").eq("id", id).eq("active", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="ga-app-main"><p className="ga-muted">Loading…</p></div>;
  if (!vehicle) return (
    <div className="ga-app-main">
      <h1>Vehicle not found</h1>
      <Link to="/" className="ga-btn-primary">Back home</Link>
    </div>
  );

  const gallery = normalizeImages(vehicle.images, vehicle.image_url);
  const features: string[] = Array.isArray(vehicle.features) ? vehicle.features : [];
  const active = gallery[activeIdx] || gallery[0] || { url: vehicle.image_url || "/favicon.ico", caption: "" };

  const handleAdd = async (goToCheckout: boolean) => {
    try {
      await addToCart({
        item_type: "vehicle",
        vehicle_id: id,
        quantity: 1,
        name: vehicle.name,
        unit_price: Number(vehicle.price),
        image_url: vehicle.image_url,
      });
      toast.success(goToCheckout ? "Great choice — proceeding to checkout" : "Added to cart");
      if (goToCheckout) navigate({ to: "/checkout" });
    } catch (e: any) {
      toast.error(e.message || "Could not add to cart");
    }
  };

  const submitReserve = async () => {
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
    toast.success(`Request ${data.reservation_number} received — we'll contact you shortly.`);
    setShowReserve(false);
  };

  const specs: Array<[string, string | number | null | undefined]> = [
    ["Year", vehicle.year],
    ["Body", vehicle.body_type],
    ["Brand", vehicle.brand],
    ["Mileage", vehicle.mileage_km ? `${Number(vehicle.mileage_km).toLocaleString()} km` : null],
    ["Fuel", vehicle.fuel],
    ["Transmission", vehicle.transmission],
    ["Seats", vehicle.seats],
    ["Colour", vehicle.color],
  ];

  return (
    <div className="ga-shop-page">
      <div className="ga-shop-nav">
        <Link to="/">← Back to cars</Link>
      </div>

      <div className="ga-shop-grid">
        <div className="ga-shop-gallery">
          <div className="ga-shop-hero-img">
            <img src={active.url} alt={active.caption || vehicle.name} />
            {vehicle.finance_available && <span className="ga-shop-badge">Financing Available</span>}
            {active.caption && <span className="ga-shop-caption">{active.caption}</span>}
          </div>
          {gallery.length > 1 && (
            <div className="ga-shop-thumbs">
              {gallery.slice(0, 20).map((img, i) => (
                <button
                  key={img.url + i}
                  className={`ga-shop-thumb ${activeIdx === i ? "active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                  aria-label={img.caption || "View image"}
                  title={img.caption || ""}
                >
                  <img src={img.url} alt={img.caption || ""} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ga-shop-info">
          <div className="ga-shop-eyebrow">{vehicle.body_type || "Vehicle"} · {vehicle.brand || ""}</div>
          <h1 className="ga-shop-title">{vehicle.name}</h1>
          <div className="ga-shop-price">GHS {Number(vehicle.price).toLocaleString()}</div>

          <div className="ga-shop-quick-specs">
            {vehicle.year && <span>📅 {vehicle.year}</span>}
            {vehicle.mileage_km ? <span>🛣️ {Number(vehicle.mileage_km).toLocaleString()} km</span> : null}
            {vehicle.fuel && <span>⛽ {vehicle.fuel}</span>}
            {vehicle.transmission && <span>⚙️ {vehicle.transmission}</span>}
            {vehicle.seats && <span>👤 {vehicle.seats} seats</span>}
          </div>

          <div className="ga-shop-buybox">
            <button className="ga-btn-primary ga-shop-buy" onClick={() => handleAdd(true)}>
              Buy Now
            </button>
            <button className="ga-btn-ghost ga-shop-add" onClick={() => handleAdd(false)}>
              Add to Cart
            </button>
            {vehicle.finance_available && (
              <button className="ga-shop-secondary" onClick={() => { setIntent("finance"); setShowReserve(true); }}>
                Request Financing
              </button>
            )}
            <button className="ga-shop-secondary" onClick={() => { setIntent("inquiry"); setShowReserve(true); }}>
              Ask a Question / Test Drive
            </button>
          </div>

          <ul className="ga-shop-trust">
            <li>✅ Inspected, cleared & ready to drive</li>
            <li>🚚 Delivery available across Ghana</li>
            <li>💬 WhatsApp support: +1 437 436 4357</li>
            <li>🔒 Secure checkout — our team confirms every order</li>
          </ul>
        </div>
      </div>

      <div className="ga-shop-details">
        <div>
          <h2>Overview</h2>
          <p className="ga-shop-desc">{vehicle.description || "This vehicle has been carefully sourced by Ghanada Autos, inspected, cleared and prepared for the road."}</p>
        </div>

        <div>
          <h2>Specifications</h2>
          <div className="ga-shop-specs">
            {specs.filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => (
              <div key={k} className="ga-shop-spec-row">
                <span>{k}</span>
                <strong>{String(v)}</strong>
              </div>
            ))}
          </div>
        </div>

        {features.length > 0 && (
          <div>
            <h2>Features & Equipment</h2>
            <div className="ga-shop-features">
              {features.map((f) => <span key={f} className="ga-shop-feature">✓ {f}</span>)}
            </div>
          </div>
        )}
      </div>

      {showReserve && (
        <div className="ga-modal-overlay" onClick={() => setShowReserve(false)}>
          <div className="ga-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ga-modal-close" onClick={() => setShowReserve(false)} aria-label="Close">×</button>
            <h3>{intent === "finance" ? "Request Financing" : "Ask a Question / Test Drive"}</h3>
            <p className="ga-muted ga-small">Our team will contact you within 24 hours.</p>
            <div className="ga-form-grid">
              <label>Your name<input value={name} onChange={e => setName(e.target.value)} /></label>
              <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
              <label>Phone<input value={phone} onChange={e => setPhone(e.target.value)} /></label>
              <label>Preferred date<input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} /></label>
              <label className="ga-form-full">Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything we should know?" /></label>
            </div>
            <button className="ga-btn-primary" onClick={submitReserve} disabled={busy}>
              {busy ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}