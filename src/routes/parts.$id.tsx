import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import DualPrice from "@/components/DualPrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { normalizeImages } from "@/lib/images";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
  const [activeIdx, setActiveIdx] = useState(0);

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
  const gallery = normalizeImages(part?.images, chosen?.image_url || part?.image_url);
  const active = gallery[activeIdx] || gallery[0] || { url: "/favicon.ico", caption: "" };
  const displayImage = active.url;

  const handleAdd = async (goToCheckout: boolean) => {
    if (variations && variations.length > 0 && !variationId) { toast.error("Choose an option"); return; }
    if (qty < 1 || qty > displayStock) { toast.error("Invalid quantity"); return; }
    try {
      await addToCart({
        item_type: "part",
        part_id: id,
        variation_id: variationId || null,
        quantity: qty,
        name: chosen ? `${part!.name} — ${chosen.label}` : part!.name,
        unit_price: displayPrice,
        image_url: displayImage || null,
      });
      toast.success("Added to cart");
      if (goToCheckout) navigate({ to: "/checkout" });
    } catch (e: any) {
      toast.error(e.message || "Could not add to cart");
    }
  };

  if (isLoading) return <div className="ga"><SiteHeader /><div className="ga-app-main"><p className="ga-muted">Loading…</p></div></div>;
  if (!part) return (
    <div className="ga"><SiteHeader />
      <div className="ga-app-main">
        <h1>Part not found</h1>
        <Link to="/" className="ga-btn-primary">Back home</Link>
      </div>
    </div>
  );

  return (
    <div className="ga">
      <SiteHeader />
      <div className="ga-detail">
      <div className="ga-detail-nav">
        <Link to="/">← Back to shop</Link>
      </div>
      <div className="ga-detail-grid">
        <div className="ga-detail-media">
          <img src={displayImage} alt={active.caption || part.name} />
          {active.caption && <div className="ga-shop-caption ga-shop-caption-static">{active.caption}</div>}
          {gallery.length > 1 && (
            <div className="ga-shop-thumbs" style={{ marginTop: 10 }}>
              {gallery.slice(0, 20).map((img, i) => (
                <button
                  key={img.url + i}
                  className={`ga-shop-thumb ${activeIdx === i ? "active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                  title={img.caption || ""}
                >
                  <img src={img.url} alt={img.caption || ""} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ga-detail-body">
          <div className="ga-detail-eyebrow">{part.brand || "Spare Part"} · {part.category || "Genuine"}</div>
          <h1>{part.name}</h1>
          <div className="ga-detail-price">GHS {displayPrice.toFixed(2)}</div>
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
                    <span>GHS {Number(v.price).toFixed(2)}</span>
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
            <button className="ga-btn-primary" onClick={() => handleAdd(true)} disabled={displayStock < 1}>
              {displayStock < 1 ? "Out of stock" : "Buy Now"}
            </button>
            <button className="ga-btn-ghost" onClick={() => handleAdd(false)} disabled={displayStock < 1}>
              Add to Cart
            </button>
          </div>

          <div className="ga-detail-meta">
            <div>✅ Genuine parts</div>
            <div>🚚 Ships from Toronto & Takoradi</div>
            <div>💬 WhatsApp support: +1 437 436 4357</div>
          </div>
        </div>
      </div>
      </div>
    <SiteFooter />
    </div>
  );
}
