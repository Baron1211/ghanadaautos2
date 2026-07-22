import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/parts/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Spare Part — Ghanada Autos` },
      { name: "description", content: "Genuine automotive spare part from Ghanada Autos." },
      { property: "og:title", content: "Spare Part — Ghanada Autos" },
      { property: "og:description", content: "Genuine automotive spare part from Ghanada Autos." },
      { property: "og:type", content: "product" },
    ],
  }),
  component: PartDetail,
});

function PartDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [variationId, setVariationId] = useState<string | null>(null);

  const { data: part, isLoading } = useQuery({
    queryKey: ["part", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("parts").select("*").eq("id", id).eq("active", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: variations } = useQuery({
    queryKey: ["part-variations", id],
    queryFn: async () => {
      const { data } = await supabase.from("part_variations").select("*").eq("part_id", id).eq("active", true).order("sort_order");
      return data || [];
    },
  });

  const chosen = variations?.find((v: any) => v.id === variationId);
  const displayPrice = chosen ? Number(chosen.price) : part ? Number(part.price) : 0;
  const displayStock = chosen ? chosen.stock : part?.stock ?? 0;
  const displayImage = chosen?.image_url || part?.image_url;

  const addToCart = async () => {
    if (variations && variations.length > 0 && !variationId) { toast.error("Choose a variation"); return; }
    if (qty < 1 || qty > displayStock) { toast.error("Invalid quantity"); return; }
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      // guest — buy now flow
      const cart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      cart.push({ item_type: "part", part_id: id, variation_id: variationId, quantity: qty, name: (chosen ? `${part!.name} — ${chosen.label}` : part!.name), unit_price: displayPrice });
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      toast.success("Added to cart");
      navigate({ to: "/checkout" });
      return;
    }
    const { error } = await supabase.from("cart_items").insert({
      user_id: u.user.id, item_type: "part", part_id: id, variation_id: variationId, quantity: qty,
    });
    if (error) return toast.error(error.message);
    toast.success("Added to cart");
  };

  if (isLoading) return <div className="ga-app-main"><p className="ga-muted">Loading…</p></div>;
  if (!part) return (
    <div className="ga-app-main">
      <h1>Part not found</h1>
      <Link to="/" className="ga-btn-primary">Back home</Link>
    </div>
  );

  return (
    <div className="ga-detail">
      <div className="ga-detail-nav">
        <Link to="/">← Back to shop</Link>
      </div>
      <div className="ga-detail-grid">
        <div className="ga-detail-media">
          <img src={displayImage || "/favicon.ico"} alt={part.name} />
        </div>
        <div className="ga-detail-body">
          <div className="ga-detail-eyebrow">{part.brand || "Spare Part"} · {part.category || "Genuine"}</div>
          <h1>{part.name}</h1>
          <div className="ga-detail-price">CAD {displayPrice.toFixed(2)}</div>
          <p className="ga-detail-desc">{part.description || "Quality automotive part sourced by Ghanada Autos."}</p>

          {variations && variations.length > 0 && (
            <div className="ga-detail-variations">
              <label>Choose an option</label>
              <div className="ga-variation-list">
                {variations.map((v: any) => (
                  <button
                    key={v.id}
                    className={`ga-variation ${variationId === v.id ? "selected" : ""}`}
                    onClick={() => { setVariationId(v.id); setQty(1); }}
                    disabled={v.stock < 1}
                  >
                    <strong>{v.label}</strong>
                    <span>CAD {Number(v.price).toFixed(2)}</span>
                    <small>{v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ga-detail-qty">
            <label>Quantity</label>
            <div className="ga-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(displayStock, q + 1))}>+</button>
            </div>
            <span className="ga-muted">{displayStock} available</span>
          </div>

          <div className="ga-detail-actions">
            <button className="ga-btn-primary" onClick={addToCart} disabled={displayStock < 1}>
              {displayStock < 1 ? "Out of stock" : "Add to Cart"}
            </button>
            <Link to="/checkout" className="ga-btn-ghost">Go to checkout</Link>
          </div>

          <div className="ga-detail-meta">
            <div>✅ Genuine parts</div>
            <div>🚚 Ships from Toronto & Takoradi</div>
            <div>💬 WhatsApp support: +1 437 436 4357</div>
          </div>
        </div>
      </div>
    </div>
  );
}