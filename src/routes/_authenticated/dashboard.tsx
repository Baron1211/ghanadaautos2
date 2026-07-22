import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import logoAsset from "../../assets/ghanada-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Ghanada Autos" },
      { name: "description", content: "Manage your Ghanada Autos orders, cart, and profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Tab = "orders" | "rentals" | "cart" | "profile";

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("orders");
  const [userId, setUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!r);
    });
  }, []);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="ga-app">
      <header className="ga-app-header">
        <Link to="/" className="ga-app-brand">
          <img src={logoAsset.url} alt="Ghanada Autos" />
        </Link>
        <div className="ga-app-nav">
          <Link to="/">Home</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
          <button onClick={signOut} className="ga-app-signout">Sign out</button>
        </div>
      </header>

      <main className="ga-app-main">
        <h1>My Dashboard</h1>
        <p className="ga-app-sub">Everything you buy and rent, in one place.</p>

        <div className="ga-tabs">
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Orders & Receipts</button>
          <button className={tab === "rentals" ? "active" : ""} onClick={() => setTab("rentals")}>My Rentals</button>
          <button className={tab === "cart" ? "active" : ""} onClick={() => setTab("cart")}>My Cart</button>
          <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>Profile</button>
        </div>

        {tab === "orders" && <OrdersTab userId={userId} />}
        {tab === "rentals" && <RentalsTab userId={userId} />}
        {tab === "cart" && <CartTab userId={userId} />}
        {tab === "profile" && <ProfileTab userId={userId} />}
      </main>
    </div>
  );
}

function RentalsTab({ userId }: { userId: string }) {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("rental_bookings")
        .select("*, rental:rentals(name, image_url)")
        .eq("user_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <p className="ga-muted">Loading rentals…</p>;
  if (!bookings?.length) return (
    <div className="ga-empty">
      <h3>No rental bookings yet</h3>
      <Link to="/" className="ga-btn-primary">Book a car</Link>
    </div>
  );
  return (
    <div className="ga-order-list">
      {bookings.map((b: any) => (
        <div key={b.id} className="ga-order-card">
          <div className="ga-order-head">
            <div>
              <strong>{b.booking_number}</strong>
              <span className={`ga-badge ga-badge-${b.status}`}>{b.status}</span>
            </div>
            <div className="ga-order-total">{b.currency} {Number(b.total).toFixed(2)}</div>
          </div>
          <div className="ga-order-meta">
            {b.rental?.name} · {b.pickup_date} → {b.return_date} · {b.with_driver ? "With driver" : "Self-drive"}
          </div>
          {b.destination && <p className="ga-muted">Destination: {b.destination}</p>}
        </div>
      ))}
    </div>
  );
}

function OrdersTab({ userId }: { userId: string }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="ga-muted">Loading orders…</p>;
  if (!orders?.length) {
    return (
      <div className="ga-empty">
        <h3>No orders yet</h3>
        <p>Browse spare parts and rentals on the homepage to get started.</p>
        <Link to="/" className="ga-btn-primary">Go shopping</Link>
      </div>
    );
  }
  return (
    <div className="ga-order-list">
      {orders.map((o: any) => (
        <div key={o.id} className="ga-order-card">
          <div className="ga-order-head">
            <div>
              <strong>{o.order_number}</strong>
              <span className={`ga-badge ga-badge-${o.status}`}>{o.status}</span>
            </div>
            <div className="ga-order-total">
              {o.currency} {Number(o.total).toFixed(2)}
            </div>
          </div>
          <div className="ga-order-meta">
            {new Date(o.created_at).toLocaleDateString()} · {o.order_items.length} item(s)
          </div>
          <table className="ga-receipt">
            <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
            <tbody>
              {o.order_items.map((it: any) => (
                <tr key={it.id}>
                  <td>{it.name}{it.rental_days ? ` (${it.rental_days} days)` : ""}</td>
                  <td>{it.quantity}</td>
                  <td>{Number(it.unit_price).toFixed(2)}</td>
                  <td>{Number(it.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {o.shipping_address && <p className="ga-muted">Ship to: {o.shipping_address}</p>}
        </div>
      ))}
    </div>
  );
}

function CartTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["cart", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, part:parts(*), rental:rentals(*)")
        .eq("user_id", userId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("address,phone").eq("id", userId).maybeSingle().then(({ data }) => {
      if (data) {
        setAddress(data.address || "");
        setPhone(data.phone || "");
      }
    });
  }, [userId]);

  const lineTotal = (i: any) => {
    if (i.item_type === "part" && i.part) return Number(i.part.price) * i.quantity;
    if (i.item_type === "rental" && i.rental) return Number(i.rental.daily_rate) * (i.rental_days || 1);
    return 0;
  };
  const total = items?.reduce((sum: number, i: any) => sum + lineTotal(i), 0) ?? 0;

  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart", userId] });
  };

  const updateQty = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    await supabase.from("cart_items").update({ quantity }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart", userId] });
  };

  const checkout = async () => {
    if (!items?.length) return;
    if (!address.trim() || !phone.trim()) {
      toast.error("Address and phone are required");
      return;
    }
    setPlacing(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          subtotal: total,
          total,
          shipping_address: address,
          phone,
          notes,
        })
        .select()
        .single();
      if (error) throw error;

      const orderItems = items.map((i: any) => {
        const unit = i.item_type === "part" ? Number(i.part.price) : Number(i.rental.daily_rate);
        const qty = i.item_type === "part" ? i.quantity : (i.rental_days || 1);
        return {
          order_id: order.id,
          item_type: i.item_type,
          part_id: i.part_id,
          rental_id: i.rental_id,
          name: i.item_type === "part" ? i.part.name : i.rental.name,
          unit_price: unit,
          quantity: i.quantity,
          rental_days: i.rental_days,
          rental_start: i.rental_start,
          line_total: unit * qty,
        };
      });
      const { error: itErr } = await supabase.from("order_items").insert(orderItems);
      if (itErr) throw itErr;

      await supabase.from("cart_items").delete().eq("user_id", userId);
      toast.success(`Order ${order.order_number} placed!`);
      qc.invalidateQueries({ queryKey: ["cart", userId] });
      qc.invalidateQueries({ queryKey: ["orders", userId] });
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) return <p className="ga-muted">Loading cart…</p>;
  if (!items?.length) {
    return (
      <div className="ga-empty">
        <h3>Your cart is empty</h3>
        <p>Add spare parts or a rental from the homepage.</p>
        <Link to="/" className="ga-btn-primary">Shop now</Link>
      </div>
    );
  }
  return (
    <div className="ga-cart">
      <div className="ga-cart-items">
        {items.map((i: any) => {
          const isPart = i.item_type === "part";
          const source = isPart ? i.part : i.rental;
          if (!source) return null;
          const unit = isPart ? Number(source.price) : Number(source.daily_rate);
          return (
            <div key={i.id} className="ga-cart-row">
              <div className="ga-cart-info">
                <strong>{source.name}</strong>
                <span className="ga-muted">
                  {isPart ? `${unit.toFixed(2)} each` : `${unit.toFixed(2)} / day · ${i.rental_days} days`}
                </span>
              </div>
              {isPart && (
                <div className="ga-qty">
                  <button onClick={() => updateQty(i.id, i.quantity - 1)}>−</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => updateQty(i.id, i.quantity + 1)}>+</button>
                </div>
              )}
              <div className="ga-cart-total">{lineTotal(i).toFixed(2)}</div>
              <button className="ga-cart-remove" onClick={() => remove(i.id)}>Remove</button>
            </div>
          );
        })}
      </div>

      <div className="ga-checkout">
        <h3>Checkout</h3>
        <label>Shipping address<textarea value={address} onChange={(e) => setAddress(e.target.value)} /></label>
        <label>Contact phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <label>Notes (optional)<textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        <div className="ga-checkout-total">
          <span>Total</span>
          <strong>CAD {total.toFixed(2)}</strong>
        </div>
        <button className="ga-btn-primary" onClick={checkout} disabled={placing}>
          {placing ? "Placing order…" : "Place order"}
        </button>
        <p className="ga-muted ga-small">Payments are arranged with our team after order placement.</p>
      </div>
    </div>
  );
}

function ProfileTab({ userId }: { userId: string }) {
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then(({ data }) => {
      if (data) setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
        avatar_url: data.avatar_url || "",
      });
    });
  }, [userId]);

  const uploadAvatar = async (file: File) => {
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) setForm(f => ({ ...f, avatar_url: data.signedUrl }));
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", userId);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <div className="ga-profile">
      <div className="ga-avatar-row">
        <div className="ga-avatar" style={{ backgroundImage: form.avatar_url ? `url(${form.avatar_url})` : undefined }}>
          {!form.avatar_url && <span>{(form.full_name || "?").charAt(0).toUpperCase()}</span>}
        </div>
        <label className="ga-btn-ghost">
          Upload photo
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files && uploadAvatar(e.target.files[0])} />
        </label>
      </div>
      <label>Full name<input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} /></label>
      <label>Phone<input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
      <label>Shipping address<textarea value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} /></label>
      <button className="ga-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
    </div>
  );
}