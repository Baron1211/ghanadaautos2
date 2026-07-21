import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "../../assets/ghanada-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ghanada Autos" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/auth" }); return; }
      const { data } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setState(data ? "ok" : "denied");
    })();
  }, [navigate]);

  if (state === "checking") return <div className="ga-app"><p className="ga-app-main ga-muted">Checking access…</p></div>;
  if (state === "denied") return (
    <div className="ga-app"><main className="ga-app-main">
      <h1>Admins only</h1>
      <p>Your account doesn't have admin privileges.</p>
      <Link to="/dashboard" className="ga-btn-primary">Back to dashboard</Link>
    </main></div>
  );

  return (
    <div className="ga-app">
      <header className="ga-app-header">
        <Link to="/" className="ga-app-brand"><img src={logoAsset.url} alt="Ghanada Autos" /></Link>
        <div className="ga-app-nav">
          <Link to="/admin">Overview</Link>
          <Link to="/admin/parts">Parts</Link>
          <Link to="/admin/rentals">Rentals</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/dashboard">My Dashboard</Link>
        </div>
      </header>
      <main className="ga-app-main"><Outlet /></main>
    </div>
  );
}