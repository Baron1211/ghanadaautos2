import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [parts, rentals, orders, bookings, users, recentOrders, recentBookings, lowStock] = await Promise.all([
        supabase.from("parts").select("id, active, stock, low_stock_threshold", { count: "exact" }),
        supabase.from("rentals").select("id, active", { count: "exact" }),
        supabase.from("orders").select("total, status, currency"),
        supabase.from("rental_bookings").select("total, status, currency"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("order_number, guest_name, phone, total, status, currency, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("rental_bookings").select("booking_number, guest_name, guest_phone, total, status, currency, pickup_date, created_at, rental:rentals(name)").order("created_at", { ascending: false }).limit(5),
        supabase.from("parts").select("id, name, stock, low_stock_threshold, image_url").order("stock", { ascending: true }).limit(50),
      ]);
      const orderList = orders.data || [];
      const bookingList = bookings.data || [];
      const revenue = orderList.reduce((s, o: any) => s + Number(o.total || 0), 0)
        + bookingList.reduce((s, b: any) => s + Number(b.total || 0), 0);
      const pendingOrders = orderList.filter((o: any) => o.status === "pending").length;
      const pendingBookings = bookingList.filter((b: any) => b.status === "pending").length;
      const activeParts = (parts.data || []).filter((p: any) => p.active).length;
      const activeRentals = (rentals.data || []).filter((r: any) => r.active).length;
      const lowStockItems = (lowStock.data || []).filter((p: any) => p.stock <= (p.low_stock_threshold ?? 5)).slice(0, 6);
      return {
        parts: parts.count || 0, activeParts,
        rentals: rentals.count || 0, activeRentals,
        orderCount: orderList.length,
        bookingCount: bookingList.length,
        pendingOrders, pendingBookings,
        revenue,
        users: users.count || 0,
        recentOrders: recentOrders.data || [],
        recentBookings: recentBookings.data || [],
        lowStockItems,
      };
    },
  });

  const kpis = [
    { label: "Revenue", value: `CAD ${(data?.revenue ?? 0).toFixed(2)}`, sub: `${data?.orderCount ?? 0} orders · ${data?.bookingCount ?? 0} bookings`, tone: "brand" as const },
    { label: "Pending Orders", value: data?.pendingOrders ?? "—", sub: "Awaiting fulfilment", tone: "warn" as const, href: "/admin/orders" },
    { label: "Pending Bookings", value: data?.pendingBookings ?? "—", sub: "Awaiting confirmation", tone: "warn" as const, href: "/admin/bookings" },
    { label: "Customers", value: data?.users ?? "—", sub: "Registered accounts", tone: "info" as const, href: "/admin/users" },
    { label: "Spare Parts", value: data?.parts ?? "—", sub: `${data?.activeParts ?? 0} active in catalogue`, tone: "info" as const, href: "/admin/parts" },
    { label: "Rental Fleet", value: data?.rentals ?? "—", sub: `${data?.activeRentals ?? 0} active vehicles`, tone: "info" as const, href: "/admin/rentals" },
  ];

  return (
    <div className="ga-admin-page">
      <div className="ga-admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="ga-admin-sub">Real-time snapshot of your store, rentals, and customers.</p>
        </div>
      </div>

      <div className="ga-kpi-grid">
        {kpis.map(k => {
          const inner = (
            <>
              <span className={`ga-kpi-label tone-${k.tone}`}>{k.label}</span>
              <strong>{k.value as any}</strong>
              <small>{k.sub}</small>
            </>
          );
          return k.href
            ? <Link key={k.label} to={k.href} className={`ga-kpi tone-${k.tone}`}>{inner}</Link>
            : <div key={k.label} className={`ga-kpi tone-${k.tone}`}>{inner}</div>;
        })}
      </div>

      <div className="ga-admin-grid-2">
        <section className="ga-admin-card">
          <div className="ga-admin-card-head">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="ga-admin-link">View all →</Link>
          </div>
          {data?.recentOrders.length ? (
            <table className="ga-admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
              <tbody>
                {data.recentOrders.map((o: any) => (
                  <tr key={o.order_number}>
                    <td><strong>{o.order_number}</strong><div className="ga-admin-mini">{new Date(o.created_at).toLocaleDateString()}</div></td>
                    <td>{o.guest_name || "—"}<div className="ga-admin-mini">{o.phone}</div></td>
                    <td><span className={`ga-pill status-${o.status}`}>{o.status}</span></td>
                    <td><strong>{o.currency} {Number(o.total).toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="ga-admin-empty">No orders yet.</p>}
        </section>

        <section className="ga-admin-card">
          <div className="ga-admin-card-head">
            <h3>Recent Bookings</h3>
            <Link to="/admin/bookings" className="ga-admin-link">View all →</Link>
          </div>
          {data?.recentBookings.length ? (
            <table className="ga-admin-table">
              <thead><tr><th>Booking</th><th>Customer</th><th>Pickup</th><th>Total</th></tr></thead>
              <tbody>
                {data.recentBookings.map((b: any) => (
                  <tr key={b.booking_number}>
                    <td><strong>{b.booking_number}</strong><div className="ga-admin-mini">{b.rental?.name || "—"}</div></td>
                    <td>{b.guest_name || "—"}<div className="ga-admin-mini">{b.guest_phone}</div></td>
                    <td>{b.pickup_date}<div className="ga-admin-mini"><span className={`ga-pill status-${b.status}`}>{b.status}</span></div></td>
                    <td><strong>{b.currency} {Number(b.total).toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="ga-admin-empty">No bookings yet.</p>}
        </section>
      </div>

      <section className="ga-admin-card">
        <div className="ga-admin-card-head"><h3>Quick Actions</h3></div>
        <div className="ga-quick-grid">
          <Link to="/admin/parts" className="ga-quick"><span>⚙</span><strong>Add spare part</strong><small>Upload image, price & variations</small></Link>
          <Link to="/admin/rentals" className="ga-quick"><span>🚗</span><strong>Add rental vehicle</strong><small>Set daily rate & availability</small></Link>
          <Link to="/admin/catalog" className="ga-quick"><span>🏷</span><strong>Categories & brands</strong><small>Organise your product taxonomy</small></Link>
          <Link to="/admin/orders" className="ga-quick"><span>🧾</span><strong>Fulfil orders</strong><small>Update statuses & mark shipped</small></Link>
          <Link to="/admin/bookings" className="ga-quick"><span>📅</span><strong>Confirm bookings</strong><small>Approve or cancel rentals</small></Link>
          <Link to="/admin/users" className="ga-quick"><span>👥</span><strong>Manage users</strong><small>Grant or revoke admin access</small></Link>
          <Link to="/admin/settings" className="ga-quick"><span>⚙︎</span><strong>Site settings</strong><small>Hero, contact info & driver fee</small></Link>
        </div>
      </section>

      {data?.lowStockItems && data.lowStockItems.length > 0 && (
        <section className="ga-admin-card">
          <div className="ga-admin-card-head">
            <h3>⚠ Low / Out of Stock</h3>
            <Link to="/admin/parts" className="ga-admin-link">Manage inventory →</Link>
          </div>
          <table className="ga-admin-table">
            <thead><tr><th>Part</th><th>Stock</th><th>Threshold</th><th>Status</th></tr></thead>
            <tbody>
              {data.lowStockItems.map((p: any) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><strong>{p.stock}</strong></td>
                  <td>{p.low_stock_threshold ?? 5}</td>
                  <td>{p.stock === 0 ? <span className="ga-pill status-cancelled">Out of stock</span> : <span className="ga-pill status-pending">Low</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}