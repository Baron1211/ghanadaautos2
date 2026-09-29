import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/confirmed")({
  head: () => ({
    meta: [{ title: "Email confirmed — RRR Auto Export" }],
  }),
  component: ConfirmedPage,
});

function ConfirmedPage() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      // Supabase auto-establishes a session from the confirmation link.
      // Sign it out so the user must explicitly log in with their credentials.
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      navigate({ to: "/auth", search: { confirmed: "1" } as any, replace: true });
    })();
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Email confirmed</h1>
        <p style={{ color: "#4b5563" }}>Redirecting you to sign in…</p>
      </div>
    </div>
  );
}