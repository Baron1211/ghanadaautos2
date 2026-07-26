import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import SiteHeader from "@/components/SiteHeader";

export const Route = createFileRoute("/parts")({
  head: () => ({
    meta: [
      { title: "Spare Parts — Ghanada Autos" },
      { name: "description", content: "Shop genuine automotive spare parts — engine, brakes, tyres, batteries and more. Fast delivery across Ghana." },
      { property: "og:title", content: "Spare Parts — Ghanada Autos" },
      { property: "og:description", content: "Shop genuine automotive spare parts — engine, brakes, tyres, batteries and more. Fast delivery across Ghana." },
    ],
  }),
  component: PartsPage,
});

function PartsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["parts-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parts").select("*").eq("active", true);
      if (error) throw error;
      return data || [];
    },
  });

  const uniq = (arr: any[]) => Array.from(new Set(arr.filter((x) => !!x && String(x).trim() !== ""))).sort() as string[];
  const cats = useMemo(() => uniq(parts.map((p: any) => p.category)), [parts]);
  const brands = useMemo(() => uniq(parts.map((p: any) => p.brand)), [parts]);
  const priceBuckets = [
    { label: "Under GHS 200", value: "0-200" },
    { label: "GHS 200 – 500", value: "200-500" },
    { label: "GHS 500 – 1,000", value: "500-1000" },
    { label: "Above GHS 1,000", value: "1000-999999" },
  ];

  const filtered = parts.filter((p: any) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat && p.category !== cat) return false;
    if (brand && p.brand !== brand) return false;
    if (price) {
      const [lo, hi] = price.split("-").map(Number);
      const v = Number(p.price);
      if (v < lo || v > hi) return false;
    }
    return true;
  });

  const reset = () => { setQ(""); setCat(""); setBrand(""); setPrice(""); };

  const quickAdd = async (p: any, buyNow: boolean) => {
    const { data: vars } = await supabase.from("part_variations").select("id").eq("part_id", p.id).eq("active", true).limit(1);
    if (vars && vars.length > 0) { navigate({ to: "/parts/$id", params: { id: p.id } }); return; }
    try {
      await addToCart({ item_type: "part", part_id: p.id, quantity: 1, name: p.name, unit_price: Number(p.price), image_url: p.image_url });
      toast.success(buyNow ? "Proceeding to checkout" : "Added to cart");
      if (buyNow) navigate({ to: "/checkout" });
    } catch (e: any) { toast.error(e.message || "Could not add to cart"); }
  };

  return (
    <div className="ga">
      <SiteHeader />
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Ghanada Parts Store</div>
            <h1>Spare Parts</h1>
            <p>Genuine parts, guaranteed fit. Search or filter by category, brand, and price.</p>
          </div>

          <div className="ga-search-bar" style={{ marginBottom: 32 }}>
            <div className="ga-search-fields">
              <label className="ga-search-field"><span>Search</span>
                <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. brake pads" style={{ background: "transparent", border: "none", outline: "none", color: "inherit", font: "inherit", padding: 0 }} />
              </label>
              <label className="ga-search-field"><span>Category</span>
                <select value={cat} onChange={(e) => setCat(e.target.value)}>
                  <option value="">Any</option>
                  {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="ga-search-field"><span>Brand</span>
                <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                  <option value="">Any</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
              <label className="ga-search-field"><span>Price</span>
                <select value={price} onChange={(e) => setPrice(e.target.value)}>
                  <option value="">Any price</option>
                  {priceBuckets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
            </div>
            <div className="ga-search-summary">
              <span>{filtered.length} matching {filtered.length === 1 ? "part" : "parts"}</span>
              {(q || cat || brand || price) && <button className="ga-search-reset" onClick={reset}>Clear filters</button>}
            </div>
          </div>

          <div className="parts-grid">
            {isLoading && <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>Loading parts…</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>No parts match your filters.</p>
            )}
            {filtered.map((p: any) => (
              <div key={p.id} className="part-card">
                <Link to="/parts/$id" params={{ id: p.id }} className="pimg"><img src={p.image_url || "/favicon.ico"} alt={p.name} /></Link>
                <div className="part-body">
                  <h5 className="part-title"><Link to="/parts/$id" params={{ id: p.id }} className="ga-link-plain">{p.name}</Link></h5>
                  <div className="stars">★★★★★</div>
                  <div className="part-price">GHS {Number(p.price).toFixed(2)}</div>
                  <div className="part-actions">
                    <button className="part-add" onClick={() => quickAdd(p, false)} aria-label="Add to cart">🛒</button>
                    <button className="add-cart" onClick={() => quickAdd(p, true)}>Buy Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}