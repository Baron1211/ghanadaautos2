import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import DualPrice from "@/components/DualPrice";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const Route = createFileRoute("/rentals/")({
  head: () => ({
    meta: [
      { title: "Car Rentals — Ghanada Autos" },
      { name: "description", content: "Rent a car in Ghana — economy, SUV, luxury, pickup and van fleets with self-drive or driver on request." },
      { property: "og:title", content: "Car Rentals — Ghanada Autos" },
      { property: "og:description", content: "Rent a car in Ghana — economy, SUV, luxury, pickup and van fleets with self-drive or driver on request." },
    ],
  }),
  component: RentalsPage,
});

function RentalsPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [seats, setSeats] = useState("");
  const [trans, setTrans] = useState("");
  const [price, setPrice] = useState("");

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ["rentals-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rentals").select("*").eq("active", true);
      if (error) throw error;
      return data || [];
    },
  });

  const uniq = (arr: any[]) => Array.from(new Set(arr.filter((x) => !!x && String(x).trim() !== ""))).sort() as string[];
  const types = useMemo(() => uniq(rentals.map((r: any) => r.vehicle_type)), [rentals]);
  const transList = useMemo(() => uniq(rentals.map((r: any) => r.transmission)), [rentals]);
  const seatOpts = useMemo(() => uniq(rentals.map((r: any) => r.seats ? String(r.seats) : "")), [rentals]);
  const priceBuckets = [
    { label: "Under GHS 500 / day", value: "0-500" },
    { label: "GHS 500 – 1,000 / day", value: "500-1000" },
    { label: "GHS 1,000 – 2,000 / day", value: "1000-2000" },
    { label: "Above GHS 2,000 / day", value: "2000-999999" },
  ];

  const filtered = rentals.filter((r: any) => {
    if (type && r.vehicle_type !== type) return false;
    if (trans && r.transmission !== trans) return false;
    if (seats && String(r.seats) !== seats) return false;
    if (price) {
      const [lo, hi] = price.split("-").map(Number);
      const p = Number(r.daily_rate);
      if (p < lo || p > hi) return false;
    }
    return true;
  });

  const reset = () => { setType(""); setSeats(""); setTrans(""); setPrice(""); };

  return (
    <div className="ga">
      <SiteHeader />
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Ghanada Car Rentals</div>
            <h1>Rent a Car in Ghana</h1>
            <p>Choose self-drive or driver on request. Airport pickup, business travel, and weekend getaways.</p>
          </div>

          <div className="ga-search-bar" style={{ marginBottom: 32 }}>
            <div className="ga-search-fields">
              <label className="ga-search-field"><span>Vehicle Type</span>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Any type</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="ga-search-field"><span>Seats</span>
                <select value={seats} onChange={(e) => setSeats(e.target.value)}>
                  <option value="">Any</option>
                  {seatOpts.map((s) => <option key={s} value={s}>{s} seats</option>)}
                </select>
              </label>
              <label className="ga-search-field"><span>Transmission</span>
                <select value={trans} onChange={(e) => setTrans(e.target.value)}>
                  <option value="">Any</option>
                  {transList.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="ga-search-field"><span>Daily Rate</span>
                <select value={price} onChange={(e) => setPrice(e.target.value)}>
                  <option value="">Any price</option>
                  {priceBuckets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
            </div>
            <div className="ga-search-summary">
              <span>{filtered.length} matching {filtered.length === 1 ? "car" : "cars"}</span>
              {(type || seats || trans || price) && <button className="ga-search-reset" onClick={reset}>Clear filters</button>}
            </div>
          </div>

          <div className="vehicle-grid rental-grid">
            {isLoading && <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>Loading rentals…</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>No rentals match your filters.</p>
            )}
            {filtered.map((r: any) => (
              <div key={r.id} className="vcard rental-card">
                <Link to="/rentals/$id" params={{ id: r.id }} className="vimg rental-image-link">
                  <img src={r.image_url || "/favicon.ico"} alt={r.name} />
                </Link>
                <div className="vbody">
                  <div className="rental-card-head">
                    {r.vehicle_type && <span className="rental-type-pill">{r.vehicle_type}</span>}
                    <h4 className="rental-title">
                      <Link to="/rentals/$id" params={{ id: r.id }} className="rental-title-link">{r.name}</Link>
                    </h4>
                  </div>
                  <div className="rental-rate">
                    <span>Daily rental</span>
                    <DualPrice ghs={r.daily_rate} cad={(r as any).daily_rate_cad} size="sm" decimals={2} suffix="/ day" />
                  </div>
                  <div className="vmeta">
                    {r.seats && <span>👤 {r.seats} seats</span>}
                    {r.transmission && <span>⚙️ {r.transmission}</span>}
                    {r.fuel && <span>⛽ {r.fuel}</span>}
                  </div>
                  <div className="vactions">
                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate({ to: "/rentals/$id", params: { id: r.id }, hash: "book" })}>Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    <SiteFooter />
    </div>
  );
}
