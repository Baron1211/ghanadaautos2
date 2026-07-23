import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

const NAV: { to: string; label: string; icon: string; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: "▦", exact: true },
  { to: "/admin/parts", label: "Spare Parts", icon: "⚙" },
  { to: "/admin/rentals", label: "Rental Fleet", icon: "🚗" },
  { to: "/admin/catalog", label: "Catalog Setup", icon: "🏷" },
  { to: "/admin/orders", label: "Orders", icon: "🧾" },
  { to: "/admin/bookings", label: "Bookings", icon: "📅" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/settings", label: "Site Settings", icon: "⚙︎" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");
  const [email, setEmail] = useState<string>("");
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/auth" }); return; }
      setEmail(u.user.email || "");
      const { data } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setState(data ? "ok" : "denied");
    })();
  }, [navigate]);

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