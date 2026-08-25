import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/lib/admin-perms";
import logoAsset from "../../assets/ghanada-logo-transparent.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ghanada Autos" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: string; section: string; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: "▦", section: "overview", exact: true },
  { to: "/admin/vehicles", label: "Vehicles for Sale", icon: "🚙", section: "vehicles" },
  { to: "/admin/parts", label: "Spare Parts", icon: "⚙", section: "parts" },
  { to: "/admin/rentals", label: "Rental Fleet", icon: "🚗", section: "rentals" },
  { to: "/admin/catalog", label: "Catalog Setup", icon: "🏷", section: "catalog" },
  { to: "/admin/orders", label: "Orders", icon: "🧾", section: "orders" },
  { to: "/admin/bookings", label: "Bookings", icon: "📅", section: "bookings" },
  { to: "/admin/repairs", label: "Repair Requests", icon: "🛠", section: "repairs" },
  { to: "/admin/shipments", label: "Tracking", icon: "📦", section: "shipments" },
  { to: "/admin/notifications", label: "Notifications", icon: "🔔", section: "notifications" },
  { to: "/admin/content", label: "Website Content", icon: "✎", section: "content" },
  { to: "/admin/users", label: "Customers", icon: "👥", section: "users" },
  { to: "/admin/staff", label: "Staff & Permissions", icon: "🛡", section: "staff" },
  { to: "/admin/settings", label: "Site Settings", icon: "⚙︎", section: "settings" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const access = useAdminAccess();
  const state = access.status;
  const email = access.email;
  const [drawer, setDrawer] = useState(false);
  const nav = NAV.filter((n) => access.can(n.section));

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (state === "checking") {
    return <div className="ga-admin-shell"><div className="ga-admin-loading">Checking access…</div></div>;
  }
  if (state === "denied") {
    return (
      <div className="ga-admin-shell">
        <div className="ga-admin-denied">
          <h1>Admins only</h1>
          <p>Your account doesn't have admin privileges.</p>
          <Link to="/dashboard" className="ga-btn-primary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to || path === to + "/" : path.startsWith(to);

  return (
    <div className={"ga-admin-shell" + (drawer ? " is-drawer-open" : "")}>
      <aside className="ga-admin-side">
        <Link to="/" className="ga-admin-brand" onClick={() => setDrawer(false)}>
          <img src={logoAsset.url} alt="Ghanada Autos" />
          <div>
            <strong>Ghanada Autos</strong>
            <span>Admin Console</span>
          </div>
        </Link>
        <nav className="ga-admin-nav">
          <div className="ga-admin-nav-label">Manage</div>
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setDrawer(false)}
              className={"ga-admin-nav-link" + (isActive(n.to, n.exact) ? " active" : "")}
            >
              <span className="ga-admin-nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="ga-admin-side-foot">
          <div className="ga-admin-user">
            <div className="ga-admin-user-avatar">{(email[0] || "A").toUpperCase()}</div>
            <div>
              <strong>Administrator</strong>
              <span>{email}</span>
            </div>
          </div>
          <button className="ga-admin-signout" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      {drawer && <div className="ga-admin-scrim" onClick={() => setDrawer(false)} />}

      <div className="ga-admin-content">
        <header className="ga-admin-topbar">
          <button className="ga-admin-burger" onClick={() => setDrawer(v => !v)} aria-label="Open menu">☰</button>
          <div className="ga-admin-crumbs">
            <span>Admin</span>
            <span className="sep">/</span>
            <span className="current">{NAV.find(n => isActive(n.to, n.exact))?.label || "Overview"}</span>
          </div>
          <div className="ga-admin-topbar-actions">
            <Link to="/" className="ga-admin-chip">View site</Link>
            <Link to="/admin/parts" className="ga-admin-chip primary">+ Add product</Link>
          </div>
        </header>
        <main className="ga-admin-main"><Outlet /></main>
      </div>
    </div>
  );
}