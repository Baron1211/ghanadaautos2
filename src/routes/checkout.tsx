import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Mail, ShieldCheck, UserRound, LogIn } from "lucide-react";

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
  item_type: "part" | "rental" | "vehicle";
  part_id?: string | null;
  rental_id?: string | null;
  variation_id?: string | null;
  vehicle_id?: string | null;
  name: string;
  image_url?: string | null;
  unit_price: number;
  unit_price_cad?: number | null;
  quantity: number;
  rental_days?: number | null;
  rental_start?: string | null;
};

function Checkout() {
  return <CheckoutInner />;
}

async function withCadPrices(rows: LineItem[]): Promise<LineItem[]> {
  const partIds = rows.filter(r => r.part_id && !r.variation_id).map(r => r.part_id!) as string[];
  const varIds = rows.filter(r => r.variation_id).map(r => r.variation_id!) as string[];
  const rentalIds = rows.filter(r => r.rental_id).map(r => r.rental_id!) as string[];
  const vehicleIds = rows.filter(r => r.vehicle_id).map(r => r.vehicle_id!) as string[];
  const [parts, vars, rentals, vehicles] = await Promise.all([
    partIds.length ? (supabase as any).from("parts").select("id, price_cad").in("id", partIds) : { data: [] },
    varIds.length ? (supabase as any).from("part_variations").select("id, price_cad").in("id", varIds) : { data: [] },
    rentalIds.length ? (supabase as any).from("rentals").select("id, daily_rate_cad").in("id", rentalIds) : { data: [] },
    vehicleIds.length ? (supabase as any).from("vehicles").select("id, price_cad").in("id", vehicleIds) : { data: [] },
  ]);
  const m = new Map<string, number>();
  (parts.data || []).forEach((r: any) => m.set(`p${r.id}`, Number(r.price_cad || 0)));
  (vars.data || []).forEach((r: any) => m.set(`v${r.id}`, Number(r.price_cad || 0)));
  (rentals.data || []).forEach((r: any) => m.set(`r${r.id}`, Number(r.daily_rate_cad || 0)));
  (vehicles.data || []).forEach((r: any) => m.set(`c${r.id}`, Number(r.price_cad || 0)));
  return rows.map(r => ({
    ...r,
    unit_price_cad:
      (r.variation_id ? m.get(`v${r.variation_id}`) : undefined) ??
      (r.part_id ? m.get(`p${r.part_id}`) : undefined) ??
      (r.rental_id ? m.get(`r${r.rental_id}`) : undefined) ??
      (r.vehicle_id ? m.get(`c${r.vehicle_id}`) : undefined) ?? 0,
  }));
}

function CheckoutInner() {
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
  const [cur, setCur] = useState<"GHS" | "CAD">("GHS");
  const [placing, setPlacing] = useState(false);
  const [guestMode, setGuestMode] = useState<"choose" | "guest">("choose");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        setEmail(data.user!.email || "");
        const [{ data: cart }, { data: profile }] = await Promise.all([
          (supabase as any).from("cart_items")
            .select("*, part:parts(name, price, image_url), variation:part_variations(label, price), rental:rentals(name, daily_rate, image_url), vehicle:vehicles(name, price, image_url)")
            .eq("user_id", uid),
          supabase.from("profiles").select("full_name, phone, address").eq("id", uid).maybeSingle(),
        ]);
        if (profile) { setName(profile.full_name || ""); setPhone(profile.phone || ""); setAddress(profile.address || ""); }
        const mapped = (cart || []).map((c: any) => {
          const isPart = c.item_type === "part";
          const isVehicle = c.item_type === "vehicle";
          const unit = isPart
            ? Number(c.variation?.price ?? c.part?.price ?? 0)
            : isVehicle
              ? Number(c.vehicle?.price ?? 0)
              : Number(c.rental?.daily_rate ?? 0);
          return {
            key: c.id,
            item_type: c.item_type,
            part_id: c.part_id, rental_id: c.rental_id, variation_id: c.variation_id, vehicle_id: c.vehicle_id,
            name: isPart
              ? (c.variation ? `${c.part?.name} — ${c.variation.label}` : c.part?.name || "Part")
              : isVehicle
                ? c.vehicle?.name || "Vehicle"
                : c.rental?.name || "Rental",
            image_url: isPart ? c.part?.image_url : isVehicle ? c.vehicle?.image_url : c.rental?.image_url,
            unit_price: unit,
            quantity: c.quantity,
            rental_days: c.rental_days,
            rental_start: c.rental_start,
          } as LineItem;
        });
        setItems(await withCadPrices(mapped));
      } else {
        const guest = JSON.parse(localStorage.getItem("guest_cart") || "[]") as any[];
        setItems(await withCadPrices(guest.map((g, i) => ({ ...g, key: `g${i}`, unit_price: Number(g.unit_price) }))));
      }
      setLoading(false);
    })();
  }, []);

  const lineUnits = (i: LineItem) =>
    i.item_type === "rental" ? (i.rental_days || 1) : i.quantity;
  const subtotalGhs = items.reduce((s, i) => s + i.unit_price * lineUnits(i), 0);
  const cadAvailable = items.length > 0 && items.every(i => Number(i.unit_price_cad || 0) > 0);
  const subtotalCad = items.reduce((s, i) => s + Number(i.unit_price_cad || 0) * lineUnits(i), 0);
  const activeCad = cur === "CAD" && cadAvailable;
  const subtotal = activeCad ? subtotalCad : subtotalGhs;
  const unitOf = (i: LineItem) => (activeCad ? Number(i.unit_price_cad || 0) : i.unit_price);
  const money = (n: number) => (activeCad ? `CA$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `GH₵${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);

  const removeItem = async (key: string) => {
    setItems(items.filter(i => i.key !== key));
    if (userId && !key.startsWith("g")) {
      await supabase.from("cart_items").delete().eq("id", key);
    } else if (!userId) {
      const idx = Number(key.replace(/^g/, ""));
      const cart = JSON.parse(localStorage.getItem("guest_cart") || "[]") as any[];
      cart.splice(idx, 1);
      localStorage.setItem("guest_cart", JSON.stringify(cart));
    }
    window.dispatchEvent(new Event("cart:changed"));
  };

  const place = async () => {
    if (!items.length) return;
    if (!name || !email || !phone || !address) { toast.error("Please fill all required fields"); return; }
    setPlacing(true);
    try {
      const orderPayload: any = {
        user_id: userId, subtotal, total: subtotal, currency: activeCad ? "CAD" : "GHS",
        shipping_address: address, phone, notes,
        payment_method: payment,
        payment_status: "unpaid",
      };
      if (!userId) { orderPayload.guest_name = name; orderPayload.guest_email = email; }
      const { data: order, error } = await supabase.from("orders").insert(orderPayload).select().single();
      if (error) throw error;

      const rows = items.map(i => {
        const qtyForTotal = lineUnits(i);
        return {
          order_id: order.id,
          item_type: i.item_type,
          part_id: i.part_id || null,
          rental_id: i.rental_id || null,
          variation_id: i.variation_id || null,
          vehicle_id: i.vehicle_id || null,
          name: i.name,
          unit_price: unitOf(i),
          quantity: i.quantity,
          rental_days: i.rental_days || null,
          rental_start: i.rental_start || null,
          line_total: unitOf(i) * qtyForTotal,
        };
      });
      const { error: itErr } = await supabase.from("order_items").insert(rows);
      if (itErr) throw itErr;

      if (userId) await supabase.from("cart_items").delete().eq("user_id", userId);
      else localStorage.removeItem("guest_cart");
      window.dispatchEvent(new Event("cart:changed"));

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

  // Guest choice screen: pick guest checkout or sign in
  if (!userId && guestMode === "choose") {
    return (
      <div className="ga-detail">
        <div className="ga-detail-nav"><Link to="/">← Continue shopping</Link></div>
        <h1>Checkout</h1>
        <p className="ga-muted">How would you like to check out?</p>
        <div className="ga-checkout-choice">
          <button className="ga-choice-card" onClick={() => setGuestMode("guest")}>
            <div className="ga-choice-icon"><UserRound size={28} /></div>
            <strong>Continue as guest</strong>
            <small>Fast checkout — no account needed. We'll confirm your payment details and send your invoice by email.</small>
            <span className="ga-choice-cta">Continue as guest →</span>
          </button>
          <Link to="/auth" className="ga-choice-card ga-choice-card-primary">
            <div className="ga-choice-icon"><LogIn size={28} /></div>
            <strong>Sign in / Create account</strong>
            <small>Track your orders, view receipts, save addresses and manage everything from your dashboard.</small>
            <span className="ga-choice-cta">Sign in to checkout →</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ga-detail">
      <div className="ga-detail-nav"><Link to="/">← Continue shopping</Link></div>
      <h1>Checkout</h1>
      {!userId && (
        <div className="ga-guest-banner">
          <Mail size={18} />
          <div>
            <strong>Checking out as guest</strong>
            <small>Payment details and your invoice will be confirmed via email. <Link to="/auth">Sign in</Link> to save this order to a dashboard.</small>
          </div>
        </div>
      )}
      <div className="ga-checkout-grid">
        <div>
          <h3>Your details</h3>
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
          <h3>Order summary <span className="ga-summary-count">({items.length} {items.length === 1 ? "item" : "items"})</span></h3>
          <ul className="ga-cart-list">
            {items.map(i => {
              const qtyForTotal = lineUnits(i);
              const typeLabel = i.item_type === "rental" ? "Rental" : i.item_type === "vehicle" ? "Vehicle" : "Part";
              return (
                <li key={i.key} className="ga-cart-line">
                  <div className="ga-cart-thumb">
                    {i.image_url ? <img src={i.image_url} alt={i.name} /> : <div className="ga-cart-thumb-fallback" aria-hidden />}
                    <span className={`ga-cart-type ga-cart-type-${i.item_type}`}>{typeLabel}</span>
                  </div>
                  <div className="ga-cart-body">
                    <strong className="ga-cart-name">{i.name}</strong>
                    <small className="ga-cart-meta">
                      {i.item_type === "rental"
                        ? <>{i.rental_days || 1} day{(i.rental_days || 1) > 1 ? "s" : ""} × {money(unitOf(i))} / day</>
                        : <>Qty {i.quantity} × {money(unitOf(i))}</>}
                    </small>
                    <div className="ga-cart-line-foot">
                      <span className="ga-cart-line-total">{money(unitOf(i) * qtyForTotal)}</span>
                      <button
                        className="ga-cart-delete"
                        aria-label={`Remove ${i.name} from cart`}
                        onClick={() => removeItem(i.key)}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="ga-cur-pick">
            <span className="ga-cur-pick-label">Pay in</span>
            <div className="ga-cur-options">
              <button
                type="button"
                className={`ga-cur-opt ${!activeCad ? "selected" : ""}`}
                onClick={() => setCur("GHS")}
              >
                <span className="ga-cur-code"><i className="ga-cur-flag ga-cur-flag-gh" aria-hidden="true" />GHS</span>
                <strong>GH₵{subtotalGhs.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                <small>Ghana Cedis</small>
              </button>
              <button
                type="button"
                className={`ga-cur-opt ${activeCad ? "selected" : ""} ${cadAvailable ? "" : "disabled"}`}
                onClick={() => cadAvailable && setCur("CAD")}
                disabled={!cadAvailable}
              >
                <span className="ga-cur-code"><i className="ga-cur-flag ga-cur-flag-ca" aria-hidden="true" />CAD</span>
                <strong>{cadAvailable ? `CA$${subtotalCad.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}</strong>
                <small>{cadAvailable ? "Canadian Dollars" : "Not available for these items"}</small>
              </button>
            </div>
          </div>
          <div className="ga-summary-total"><span>Total ({activeCad ? "CAD" : "GHS"})</span><strong>{money(subtotal)}</strong></div>
          <button className="ga-btn-primary ga-checkout-cta" onClick={place} disabled={placing}>
            {placing ? "Placing order…" : "Place order"}
          </button>
          <p className="ga-checkout-trust"><ShieldCheck size={14} /> Secure checkout — we'll email your invoice and payment confirmation.</p>
        </div>
      </div>
    </div>
  );
}