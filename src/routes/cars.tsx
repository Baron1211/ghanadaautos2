import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { vehicleSlug } from "@/lib/slug";

export const Route = createFileRoute("/cars")({
  head: () => ({
    meta: [
      { title: "Cars for Sale — Ghanada Autos" },
      { name: "description", content: "Browse all cars for sale at Ghanada Autos. Filter by make, model, body style, and price." },
      { property: "og:title", content: "Cars for Sale — Ghanada Autos" },
      { property: "og:description", content: "Browse all cars for sale at Ghanada Autos. Filter by make, model, body style, and price." },
    ],
  }),
  component: CarsPage,
});

function CarsPage() {
  const navigate = useNavigate();
  const [condition, setCondition] = useState<"all" | "new" | "used">("all");
  const [fMake, setFMake] = useState("");
  const [fModel, setFModel] = useState("");
  const [fBody, setFBody] = useState("");
  const [fPrice, setFPrice] = useState("");

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["cars-all"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("vehicles").select("*").eq("active", true).order("featured", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const uniq = (arr: any[]) => Array.from(new Set(arr.filter((x) => !!x && String(x).trim() !== ""))).sort() as string[];
  const makes = useMemo(() => uniq(vehicles.map((v: any) => v.brand)), [vehicles]);
  const models = useMemo(() => uniq(vehicles.filter((v: any) => !fMake || v.brand === fMake).map((v: any) => v.model)), [vehicles, fMake]);
  const bodyTypes = useMemo(() => uniq(vehicles.map((v: any) => v.body_type)), [vehicles]);
  const priceBuckets = [
    { label: "Under GHS 200,000", value: "0-200000" },
    { label: "GHS 200,000 – 400,000", value: "200000-400000" },
    { label: "GHS 400,000 – 700,000", value: "400000-700000" },
    { label: "GHS 700,000 – 1,000,000", value: "700000-1000000" },
    { label: "Above GHS 1,000,000", value: "1000000-99999999" },
  ];

  const filtered = vehicles.filter((v: any) => {
    if (condition !== "all" && (v.condition || "used") !== condition) return false;
    if (fMake && v.brand !== fMake) return false;
    if (fModel && v.model !== fModel) return false;
    if (fBody && v.body_type !== fBody) return false;
    if (fPrice) {
      const [lo, hi] = fPrice.split("-").map(Number);
      const p = Number(v.price);
      if (p < lo || p > hi) return false;
    }
    return true;
  });

  const reset = () => { setCondition("all"); setFMake(""); setFModel(""); setFBody(""); setFPrice(""); };

  const quickAdd = async (v: any, buyNow: boolean) => {
    try {
      await addToCart({ item_type: "vehicle", vehicle_id: v.id, quantity: 1, name: v.name, unit_price: Number(v.price), image_url: v.image_url });
      toast.success(buyNow ? "Proceeding to checkout" : "Added to cart");
      if (buyNow) navigate({ to: "/checkout" });
    } catch (e: any) { toast.error(e.message || "Could not add to cart"); }
  };

  return (
    <div className="ga">
      <SiteHeader />
      <section className="cars-hero">
        <div className="cars-hero-bg" aria-hidden />
        <div className="container cars-hero-inner">
          <div className="cars-hero-eyebrow">
            <span className="cars-hero-line" />
            Ghanada Autos Marketplace
          </div>
          <h1 className="cars-hero-title">
            Find your next <em>drive.</em>
          </h1>
          <p className="cars-hero-sub">
            A curated inventory of new and pre-owned vehicles — inspected, financed, and delivered across Ghana.
          </p>
          <div className="cars-hero-stats">
            <div className="cars-hero-stat"><strong>{vehicles.length}</strong><span>Vehicles in stock</span></div>
            <div className="cars-hero-stat"><strong>Finance</strong><span>Flexible plans available</span></div>
            <div className="cars-hero-stat"><strong>Verified</strong><span>Fully inspected units</span></div>
          </div>
        </div>
      </section>
      <section className="section cars-listing">
        <div className="container">
          <div className="ga-search-bar ga-search-light cars-search-float">
            <div className="ga-search-conditions" role="tablist">
              {(["all", "new", "used"] as const).map((c) => (
                <button key={c} role="tab" aria-selected={condition === c} className={`ga-cond ${condition === c ? "active" : ""}`} onClick={() => setCondition(c)}>
                  <span className="ga-cond-dot" />
                  {c === "all" ? "All" : c === "new" ? "New" : "Used"}
                </button>
              ))}
            </div>
            <div className="ga-search-fields">
              <label className="ga-search-field"><span>Make</span>
                <select value={fMake} onChange={(e) => { setFMake(e.target.value); setFModel(""); }}>
                  <option value="">Any make</option>
                  {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="ga-search-field"><span>Model</span>
                <select value={fModel} onChange={(e) => setFModel(e.target.value)}>
                  <option value="">Any model</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="ga-search-field"><span>Body Style</span>
                <select value={fBody} onChange={(e) => setFBody(e.target.value)}>
                  <option value="">Any body</option>
                  {bodyTypes.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
              <label className="ga-search-field"><span>Price Range</span>
                <select value={fPrice} onChange={(e) => setFPrice(e.target.value)}>
                  <option value="">Any price</option>
                  {priceBuckets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <button className="ga-search-btn" onClick={() => {}}>
                <span>Search</span>
              </button>
            </div>
            <div className="ga-search-summary">
              <span>{filtered.length} matching {filtered.length === 1 ? "car" : "cars"}</span>
              {(condition !== "all" || fMake || fModel || fBody || fPrice) && <button className="ga-search-reset" onClick={reset}>Clear filters</button>}
            </div>
          </div>

          <div className="vehicle-grid">
            {isLoading && <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>Loading cars…</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                No cars match your search. <button onClick={reset} className="ga-link-plain" style={{ textDecoration: "underline", background: "none", border: 0, cursor: "pointer" }}>Clear filters</button>
              </p>
            )}
            {filtered.map((v: any) => (
              <div key={v.id} className="vcard">
                <Link to="/vehicles/$id" params={{ id: vehicleSlug(v) }} className="vimg">
                  {v.finance_available && <span className="finance-tag">Finance Available</span>}
                  {v.condition === "new" && <span className="condition-tag">New</span>}
                  <img src={v.image_url || "/favicon.ico"} alt={v.name} />
                </Link>
                <div className="vbody">
                  <h4><Link to="/vehicles/$id" params={{ id: vehicleSlug(v) }} className="ga-link-plain">{v.name}</Link></h4>
                  <div className="vprice"><DualPrice ghs={v.price} cad={v.price_cad} size="md" /></div>
                  <div className="vmeta">
                    {v.year && <span>📅 {v.year}</span>}
                    {v.mileage_km ? <span>🛣️ {Number(v.mileage_km).toLocaleString()} km</span> : null}
                    {v.fuel && <span>⛽ {v.fuel}</span>}
                    {v.transmission && <span>⚙️ {v.transmission}</span>}
                  </div>
                  <div className="vactions">
                    <button className="btn btn-ghost" onClick={() => quickAdd(v, false)}>🛒 Add</button>
                    <button className="btn btn-primary" onClick={() => quickAdd(v, true)}>Buy Now</button>
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
