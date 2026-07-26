import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { normalizeImages } from "@/lib/images";
import SiteHeader from "@/components/SiteHeader";

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
  const [tab, setTab] = useState<"packages" | "equipment" | "specs">("packages");

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("vehicles").select("*").eq("id", id).eq("active", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: similar } = useQuery({
    queryKey: ["vehicles-similar", id, (vehicle as any)?.body_type, (vehicle as any)?.brand],
    enabled: !!vehicle,
    queryFn: async () => {
      const v: any = vehicle;
      const { data } = await (supabase as any)
        .from("vehicles")
        .select("id,name,brand,body_type,year,price,image_url,images,mileage_km,fuel")
        .eq("active", true)
        .neq("id", id)
        .or(`body_type.eq.${v?.body_type ?? ""},brand.eq.${v?.brand ?? ""}`)
        .limit(4);
      return data || [];
    },
  });

  if (isLoading) return <div className="ga"><SiteHeader /><div className="ga-app-main"><p className="ga-muted">Loading…</p></div></div>;
  if (!vehicle) return (
    <div className="ga"><SiteHeader />
      <div className="ga-app-main">
        <h1>Vehicle not found</h1>
        <Link to="/" className="ga-btn-primary">Back home</Link>
      </div>
    </div>
  );

  const gallery = normalizeImages(vehicle.images, vehicle.image_url);
  const features: string[] = Array.isArray(vehicle.features) ? vehicle.features : [];
  const active = gallery[activeIdx] || gallery[0] || { url: vehicle.image_url || "/favicon.ico", caption: "" };

  const toList = (v: any): string[] => {
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === "string") return v.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    return [];
  };
  const packageOptions = toList(vehicle.package_options);
  const standardEquipment = toList(vehicle.standard_equipment);
  const technicalSpecs = toList(vehicle.technical_specs);

  const detailBoxes: Array<{ label: string; value: any; icon: string }> = [
    { label: "Body Style", value: vehicle.body_type, icon: "🚙" },
    { label: "Engine", value: vehicle.engine, icon: "⚙️" },
    { label: "Exterior Colour", value: vehicle.color, icon: "🎨" },
    { label: "Interior Colour", value: vehicle.interior_color, icon: "🪑" },
    { label: "Transmission", value: vehicle.transmission, icon: "🔧" },
    { label: "Drivetrain", value: vehicle.drivetrain, icon: "🛞" },
    { label: "VIN", value: vehicle.vin, icon: "🆔" },
    { label: "Stock #", value: vehicle.stock_number, icon: "📦" },
    { label: "Fuel Type", value: vehicle.fuel, icon: "⛽" },
  ];

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
    <div className="ga">
      <SiteHeader />
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
              {gallery.slice(0, 10).map((img, i) => (
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
          <div className="ga-shop-eyebrow">
            <span className={`ga-cond-pill ${vehicle.condition === "new" ? "is-new" : "is-used"}`}>{(vehicle.condition || "used").toUpperCase()}</span>
            <span>{vehicle.body_type || "Vehicle"} · {vehicle.brand || ""}</span>
          </div>
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
        <section className="ga-vd-section">
          <h2>Vehicle Details</h2>
          <div className="ga-vd-grid">
            {detailBoxes.map((b) => (
              <div key={b.label} className="ga-vd-box">
                <div className="ga-vd-box-icon">{b.icon}</div>
                <div className="ga-vd-box-body">
                  <div className="ga-vd-box-label">{b.label}</div>
                  <div className="ga-vd-box-value">{b.value ? String(b.value) : "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ga-vd-section">
          <div className="ga-vd-tabs" role="tablist">
            <button role="tab" aria-selected={tab === "packages"} className={`ga-vd-tab ${tab === "packages" ? "active" : ""}`} onClick={() => setTab("packages")}>Packages &amp; Options</button>
            <button role="tab" aria-selected={tab === "equipment"} className={`ga-vd-tab ${tab === "equipment" ? "active" : ""}`} onClick={() => setTab("equipment")}>Standard Equipment</button>
            <button role="tab" aria-selected={tab === "specs"} className={`ga-vd-tab ${tab === "specs" ? "active" : ""}`} onClick={() => setTab("specs")}>Technical Specifications</button>
          </div>
          <div className="ga-vd-tab-panel">
            {tab === "packages" && (
              packageOptions.length ? (
                <ul className="ga-vd-list">{packageOptions.map((v) => <li key={v}>{v}</li>)}</ul>
              ) : <p className="ga-muted">No packages or options listed for this vehicle.</p>
            )}
            {tab === "equipment" && (
              standardEquipment.length ? (
                <ul className="ga-vd-list">{standardEquipment.map((v) => <li key={v}>{v}</li>)}</ul>
              ) : (features.length ? (
                <ul className="ga-vd-list">{features.map((v) => <li key={v}>{v}</li>)}</ul>
              ) : <p className="ga-muted">No standard equipment listed for this vehicle.</p>)
            )}
            {tab === "specs" && (
              technicalSpecs.length ? (
                <ul className="ga-vd-list">{technicalSpecs.map((v) => <li key={v}>{v}</li>)}</ul>
              ) : (
                <div className="ga-shop-specs">
                  {specs.filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => (
                    <div key={k} className="ga-shop-spec-row">
                      <span>{k}</span>
                      <strong>{String(v)}</strong>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </section>

        {vehicle.description && (
          <section className="ga-vd-section">
            <h2>Overview</h2>
            <p className="ga-shop-desc">{vehicle.description}</p>
          </section>
        )}

        {similar && (similar as any[]).length > 0 && (
          <section className="ga-vd-section">
            <h2>You may also like</h2>
            <div className="ga-vd-similar">
              {(similar as any[]).map((s) => (
                <Link key={s.id} to="/vehicles/$id" params={{ id: s.id }} className="ga-vd-similar-card">
                  <div className="ga-vd-similar-img">
                    <img src={s.image_url || "/favicon.ico"} alt={s.name} />
                  </div>
                  <div className="ga-vd-similar-body">
                    <div className="ga-vd-similar-eyebrow">{s.body_type || "Vehicle"} · {s.year || ""}</div>
                    <div className="ga-vd-similar-name">{s.name}</div>
                    <div className="ga-vd-similar-price">GHS {Number(s.price).toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
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
    </div>
  );
}