import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, CarFront, ShoppingCart, UserRound,
  LogOut, Menu, X, ArrowRight, Trash2, Home, ReceiptText, CalendarRange,
  Camera, Mail, Phone, MapPin, Save, Check,
} from "lucide-react";
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

type Tab = "overview" | "orders" | "rentals" | "cart" | "profile";

const GHS = (n: number) => `GHS ${Number(n || 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<{ full_name: string; email: string; avatar_url: string }>({ full_name: "", email: "", avatar_url: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      setProfile((p) => ({ ...p, email: data.user!.email || "" }));
      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (r) {
        navigate({ to: "/admin", replace: true });
        return;
      }
      const { data: prof } = await supabase
        .from("profiles").select("full_name, avatar_url").eq("id", data.user.id).maybeSingle();
      if (prof) setProfile((p) => ({ ...p, full_name: prof.full_name || "", avatar_url: prof.avatar_url || "" }));
    });
  }, [navigate]);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const nav: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders & Receipts", icon: Package },
    { id: "rentals", label: "My Rentals", icon: CarFront },
    { id: "cart", label: "My Cart", icon: ShoppingCart },
    { id: "profile", label: "Profile", icon: UserRound },
  ];
  const active = nav.find((n) => n.id === tab)!;
  const initial = (profile.full_name || profile.email || "?").charAt(0).toUpperCase();

  return (
    <div className={`ga-admin-shell${drawerOpen ? " is-drawer-open" : ""}`}>
      {drawerOpen && <div className="ga-admin-scrim" onClick={() => setDrawerOpen(false)} />}

      <aside className="ga-admin-side">
        <Link to="/" className="ga-admin-brand">
          <img src={logoAsset.url} alt="Ghanada Autos" />
          <div>
            <strong>Ghanada Autos</strong>
            <span>Customer Portal</span>
          </div>
        </Link>

        <nav className="ga-admin-nav">
          <div className="ga-admin-nav-label">Account</div>
          {nav.map((n) => (
            <button
              key={n.id}
              className={`ga-admin-nav-link${tab === n.id ? " active" : ""}`}
              onClick={() => { setTab(n.id); setDrawerOpen(false); }}
              type="button"
            >
              <n.icon size={16} />
              <span>{n.label}</span>
            </button>
          ))}

          <div className="ga-admin-nav-label" style={{ marginTop: 14 }}>Shop</div>
          <Link to="/" className="ga-admin-nav-link" onClick={() => setDrawerOpen(false)}>
            <Home size={16} /> <span>Back to site</span>
          </Link>
        </nav>

        <div className="ga-admin-side-foot">
          <div className="ga-admin-user">
            <div className="ga-admin-user-avatar" style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})`, backgroundSize: "cover" } : undefined}>
              {!profile.avatar_url && initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <strong>{profile.full_name || "Customer"}</strong>
              <span>{profile.email}</span>
            </div>
          </div>
          <button className="ga-admin-signout" onClick={signOut}>
            <LogOut size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Sign out
          </button>
        </div>
      </aside>

      <div className="ga-admin-content">
        <header className="ga-admin-topbar">
          <button className="ga-admin-burger" onClick={() => setDrawerOpen((v) => !v)} aria-label="Menu">
            {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="ga-admin-crumbs">
            <span>Dashboard</span>
            <span className="sep">/</span>
            <span className="current">{active.label}</span>
          </div>
          <div className="ga-admin-topbar-actions">
            <Link to="/" className="ga-admin-chip">Shop</Link>
            <Link to="/" className="ga-admin-chip primary">Browse cars <ArrowRight size={14} style={{ marginLeft: 4 }} /></Link>
          </div>
        </header>

        <main className="ga-admin-main">
          <div className="ga-admin-page-head">
            <div>
              <h1>{tab === "overview" ? `Welcome${profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}` : active.label}</h1>
              <p className="ga-admin-sub">
                {tab === "overview" && "A snapshot of your orders, rentals, and cart."}
                {tab === "orders" && "Every purchase and its receipt."}
                {tab === "rentals" && "All your car rental bookings."}
                {tab === "cart" && "Review, adjust, and check out your cart."}
                {tab === "profile" && "Manage your contact details and delivery address."}
              </p>
            </div>
          </div>

          {tab === "overview" && <OverviewTab userId={userId} onGo={setTab} />}
          {tab === "orders" && <OrdersTab userId={userId} />}
          {tab === "rentals" && <RentalsTab userId={userId} />}
          {tab === "cart" && <CartTab userId={userId} />}
          {tab === "profile" && <ProfileTab userId={userId} onSaved={(p) => setProfile((prev) => ({ ...prev, ...p }))} />}
        </main>
      </div>
    </div>
  );
}

function OverviewTab({ userId, onGo }: { userId: string; onGo: (t: Tab) => void }) {
  const { data: orders } = useQuery({
    queryKey: ["overview-orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(id)").eq("user_id", userId).order("created_at", { ascending: false });
      return data || [];
    },
  });
  const { data: bookings } = useQuery({
    queryKey: ["overview-bookings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("rental_bookings").select("*, rental:rentals(name)").eq("user_id", userId).order("created_at", { ascending: false });
      return data || [];
    },
  });
  const { data: cart } = useQuery({
    queryKey: ["overview-cart", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("cart_items").select("id").eq("user_id", userId);
      return data || [];
    },
  });

  const spent = (orders || []).reduce((s: number, o: any) => s + Number(o.total || 0), 0);
  const activeRentals = (bookings || []).filter((b: any) => ["pending", "confirmed", "active"].includes(b.status)).length;

  return (
    <>
      <div className="ga-kpi-grid">
        <button className="ga-kpi" onClick={() => onGo("orders")}>
          <span className="ga-kpi-label tone-brand">Total orders</span>
          <strong>{orders?.length ?? 0}</strong>
          <small>Lifetime purchases</small>
        </button>
        <button className="ga-kpi tone-info" onClick={() => onGo("rentals")}>
          <span className="ga-kpi-label tone-info">Active rentals</span>
          <strong>{activeRentals}</strong>
          <small>{bookings?.length ?? 0} bookings total</small>
        </button>
        <button className="ga-kpi tone-warn" onClick={() => onGo("cart")}>
          <span className="ga-kpi-label tone-warn">Cart items</span>
          <strong>{cart?.length ?? 0}</strong>
          <small>Ready to check out</small>
        </button>
        <div className="ga-kpi">
          <span className="ga-kpi-label">Total spent</span>
          <strong>{GHS(spent)}</strong>
          <small>Across all orders</small>
        </div>
      </div>

      <div className="ga-admin-grid-2">
        <div className="ga-admin-card">
          <div className="ga-admin-card-head">
            <h3><ReceiptText size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />Recent orders</h3>
            <button className="ga-admin-link" onClick={() => onGo("orders")}>View all</button>
          </div>
          {!orders?.length ? (
            <p className="ga-admin-empty">No orders yet. Start shopping to see them here.</p>
          ) : (
            <table className="ga-admin-table">
              <thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 4).map((o: any) => (
                  <tr key={o.id}>
                    <td><strong>{o.order_number}</strong><div className="ga-admin-mini">{new Date(o.created_at).toLocaleDateString()}</div></td>
                    <td>{o.order_items?.length ?? 0}</td>
                    <td>{GHS(o.total)}</td>
                    <td><span className={`ga-pill status-${o.status}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="ga-admin-card">
          <div className="ga-admin-card-head">
            <h3><CalendarRange size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />Recent rentals</h3>
            <button className="ga-admin-link" onClick={() => onGo("rentals")}>View all</button>
          </div>
          {!bookings?.length ? (
            <p className="ga-admin-empty">No rentals yet. Book a car from the homepage.</p>
          ) : (
            <table className="ga-admin-table">
              <thead><tr><th>Booking</th><th>Vehicle</th><th>Dates</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.slice(0, 4).map((b: any) => (
                  <tr key={b.id}>
                    <td><strong>{b.booking_number}</strong></td>
                    <td>{b.rental?.name || "—"}</td>
                    <td>{b.pickup_date} → {b.return_date}</td>
                    <td><span className={`ga-pill status-${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="ga-admin-card">
        <div className="ga-admin-card-head"><h3>Quick actions</h3></div>
        <div className="ga-quick-grid">
          <Link to="/" className="ga-quick"><strong>Browse cars for sale</strong><small>Shop the current inventory</small></Link>
          <Link to="/" className="ga-quick"><strong>Rent a car</strong><small>Self-drive or with a driver</small></Link>
          <Link to="/" className="ga-quick"><strong>Order spare parts</strong><small>Genuine OEM & aftermarket</small></Link>
          <Link to="/blog" className="ga-quick"><strong>Read the blog</strong><small>Guides, tips, and news</small></Link>
        </div>
      </div>
    </>
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
          <strong>GHS {total.toFixed(2)}</strong>
        </div>
        <button className="ga-btn-primary" onClick={checkout} disabled={placing}>
          {placing ? "Placing order…" : "Place order"}
        </button>
        <p className="ga-muted ga-small">Payments are arranged with our team after order placement.</p>
      </div>
    </div>
  );
}

function ProfileTab({ userId, onSaved }: { userId: string; onSaved?: (p: { full_name?: string; avatar_url?: string }) => void }) {
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
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
    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) {
      setForm(f => ({ ...f, avatar_url: data.signedUrl }));
      onSaved?.({ avatar_url: data.signedUrl });
      toast.success("Photo updated");
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", userId);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      onSaved?.({ full_name: form.full_name, avatar_url: form.avatar_url });
    }
  };

  const initial = (form.full_name || email || "?").charAt(0).toUpperCase();
  const completeness = [form.full_name, form.phone, form.address, form.avatar_url].filter(Boolean).length;
  const pct = Math.round((completeness / 4) * 100);

  return (
    <div className="ga-profile-wrap">
      <div className="ga-profile-hero">
        <div
          className="ga-profile-avatar"
          style={form.avatar_url ? { backgroundImage: `url(${form.avatar_url})` } : undefined}
        >
          {!form.avatar_url && <span>{initial}</span>}
          <label className="ga-profile-avatar-edit" title="Change photo">
            <Camera size={16} />
            <input type="file" accept="image/*" hidden disabled={uploading}
              onChange={(e) => e.target.files && uploadAvatar(e.target.files[0])} />
          </label>
        </div>
        <div className="ga-profile-hero-info">
          <h2>{form.full_name || "Add your name"}</h2>
          <p className="ga-profile-email"><Mail size={14} /> {email || "—"}</p>
          <div className="ga-profile-progress">
            <div className="ga-profile-progress-bar"><span style={{ width: `${pct}%` }} /></div>
            <small>{pct === 100 ? "Profile complete" : `Profile ${pct}% complete`}</small>
          </div>
        </div>
      </div>

      <div className="ga-admin-card">
        <div className="ga-admin-card-head">
          <h3><UserRound size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />Personal details</h3>
        </div>
        <div className="ga-form-grid">
          <label>
            Full name
            <input value={form.full_name} placeholder="Kwame Mensah"
              onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </label>
          <label>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Phone size={12} /> Phone</span>
            <input value={form.phone} placeholder="+233 …"
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          </label>
          <label className="ga-form-full">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><MapPin size={12} /> Shipping address</span>
            <textarea value={form.address} placeholder="Street, city, region"
              onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
          </label>
        </div>
        <div className="ga-profile-actions">
          <button className="ga-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : (<><Save size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />Save changes</>)}
          </button>
          {pct === 100 && <span className="ga-profile-done"><Check size={14} /> All set</span>}
        </div>
      </div>
    </div>
  );
}