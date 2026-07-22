import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Ghanada Autos" },
      { name: "description", content: "Complete your Ghanada Autos order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type LineItem = {
  key: string;
  item_type: "part" | "rental";
  part_id?: string | null;
  rental_id?: string | null;
  variation_id?: string | null;
  name: string;
  unit_price: number;
  quantity: number;
  rental_days?: number | null;
  rental_start?: string | null;
};

function Checkout() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"paystack" | "cod">("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        setEmail(data.user!.email || "");
        const [{ data: cart }, { data: profile }] = await Promise.all([
          supabase.from("cart_items")
            .select("*, part:parts(name, price), variation:part_variations(label, price), rental:rentals(name, daily_rate)")
            .eq("user_id", uid),
          supabase.from("profiles").select("full_name, phone, address").eq("id", uid).maybeSingle(),
        ]);
        if (profile) { setName(profile.full_name || ""); setPhone(profile.phone || ""); setAddress(profile.address || ""); }
        setItems((cart || []).map((c: any) => {
          const isPart = c.item_type === "part";
          const unit = isPart ? Number(c.variation?.price ?? c.part?.price ?? 0) : Number(c.rental?.daily_rate ?? 0);
          return {
            key: c.id,
            item_type: c.item_type,
            part_id: c.part_id, rental_id: c.rental_id, variation_id: c.variation_id,
            name: isPart
              ? (c.variation ? `${c.part?.name} — ${c.variation.label}` : c.part?.name || "Part")
              : c.rental?.name || "Rental",
            unit_price: unit,
            quantity: c.quantity,
            rental_days: c.rental_days,
            rental_start: c.rental_start,
          };
        }));
      } else {
        const guest = JSON.parse(localStorage.getItem("guest_cart") || "[]") as any[];
        setItems(guest.map((g, i) => ({ ...g, key: `g${i}`, unit_price: Number(g.unit_price) })));
      }
      setLoading(false);
    })();
  }, []);

  const subtotal = items.reduce((s, i) => s + i.unit_price * (i.item_type === "part" ? i.quantity : (i.rental_days || 1)), 0);

  const removeItem = (key: string) => setItems(items.filter(i => i.key !== key));

  const place = async () => {
    if (!items.length) return;
    if (!name || !email || !phone || !address) { toast.error("Please fill all required fields"); return; }
    setPlacing(true);
    try {
      const orderPayload: any = {
        user_id: userId, subtotal, total: subtotal,
        shipping_address: address, phone, notes,
        payment_method: payment,
        payment_status: "unpaid",
      };
      if (!userId) { orderPayload.guest_name = name; orderPayload.guest_email = email; }
      const { data: order, error } = await supabase.from("orders").insert(orderPayload).select().single();
      if (error) throw error;

      const rows = items.map(i => {
        const qtyForTotal = i.item_type === "part" ? i.quantity : (i.rental_days || 1);
        return {
          order_id: order.id,
          item_type: i.item_type,
          part_id: i.part_id || null,
          rental_id: i.rental_id || null,
          variation_id: i.variation_id || null,
          name: i.name,
          unit_price: i.unit_price,
          quantity: i.quantity,
          rental_days: i.rental_days || null,
          rental_start: i.rental_start || null,
          line_total: i.unit_price * qtyForTotal,
        };
      });
      const { error: itErr } = await supabase.from("order_items").insert(rows);
      if (itErr) throw itErr;

      if (userId) await supabase.from("cart_items").delete().eq("user_id", userId);
      else localStorage.removeItem("guest_cart");

      if (payment === "paystack") {
        toast.info("Paystack integration coming soon — we'll contact you to complete payment.");
      }
      navigate({ to: "/orders/$number", params: { number: order.order_number } });
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="ga-app-main"><p className="ga-muted">Loading checkout…</p></div>;

  if (!items.length) return (
    <div className="ga-app-main ga-empty">
      <h1>Your cart is empty</h1>
      <Link to="/" className="ga-btn-primary">Continue shopping</Link>
    </div>
  );

  return (
    <div className="ga-detail">
      <div className="ga-detail-nav"><Link to="/">← Continue shopping</Link></div>
      <h1>Checkout</h1>
      <div className="ga-checkout-grid">
        <div>
          <h3>Your details</h3>
          {!userId && <p className="ga-muted ga-small">Checking out as guest. <Link to="/auth">Sign in</Link> to save your order to your account.</p>}
          <div className="ga-form-grid">
            <label>Full name<input value={name} onChange={e => setName(e.target.value)} /></label>
            <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
            <label>Phone<input value={phone} onChange={e => setPhone(e.target.value)} /></label>
            <label className="ga-form-full">Shipping address<textarea value={address} onChange={e => setAddress(e.target.value)} /></label>
            <label className="ga-form-full">Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} /></label>
          </div>

          <h3 style={{ marginTop: 24 }}>Payment method</h3>
          <div className="ga-payment-options">
            <label className={`ga-payment-opt ${payment === "paystack" ? "selected" : ""}`}>
              <input type="radio" checked={payment === "paystack"} onChange={() => setPayment("paystack")} />
              <div>
                <strong>Paystack</strong>
                <small>Pay by card / mobile money (coming soon — we'll email a payment link)</small>
              </div>
            </label>
            <label className={`ga-payment-opt ${payment === "cod" ? "selected" : ""}`}>
              <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
              <div>
                <strong>Cash / Bank transfer</strong>
                <small>Our team contacts you with bank details or cash-on-delivery arrangement</small>
              </div>
            </label>
          </div>
        </div>

        <div className="ga-checkout-summary">
          <h3>Order summary</h3>
          {items.map(i => {
            const qtyForTotal = i.item_type === "part" ? i.quantity : (i.rental_days || 1);
            return (
              <div key={i.key} className="ga-summary-row">
                <div>
                  <strong>{i.name}</strong>
                  <small>{i.item_type === "part" ? `Qty: ${i.quantity}` : `${i.rental_days} days`} · CAD {i.unit_price.toFixed(2)} {i.item_type === "rental" ? "/ day" : "each"}</small>
                </div>
                <div>
                  <span>CAD {(i.unit_price * qtyForTotal).toFixed(2)}</span>
                  <button className="ga-cart-remove" onClick={() => removeItem(i.key)}>×</button>
                </div>
              </div>
            );
          })}
          <div className="ga-summary-total"><span>Total</span><strong>CAD {subtotal.toFixed(2)}</strong></div>
          <button className="ga-btn-primary" onClick={place} disabled={placing}>
            {placing ? "Placing order…" : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
}