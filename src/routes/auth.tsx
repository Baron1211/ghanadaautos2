import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import logoAsset from "../assets/ghanada-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ghanada Autos" },
      { name: "description", content: "Sign in or create your Ghanada Autos account to shop parts, book rentals and track orders." },
      { property: "og:title", content: "Sign in — Ghanada Autos" },
      { property: "og:description", content: "Sign in or create your Ghanada Autos account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        // Also update profile with phone since trigger only picks up name/avatar
        const { data: sess } = await supabase.auth.getUser();
        if (sess.user) {
          await supabase
            .from("profiles")
            .update({ full_name: fullName, phone })
            .eq("id", sess.user.id);
          toast.success("Welcome to Ghanada Autos!");
          navigate({ to: "/dashboard" });
        } else {
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ga-auth-page">
      <div className="ga-auth-card">
        <Link to="/" className="ga-auth-logo">
          <img src={logoAsset.url} alt="Ghanada Autos" />
        </Link>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="ga-auth-sub">
          {mode === "login"
            ? "Sign in to manage orders, cart and bookings."
            : "Join Ghanada Autos to shop parts and rent vehicles."}
        </p>

        <button
          type="button"
          className="ga-auth-google"
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.4 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.4 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.5 34.9 26.9 36 24 36c-5.4 0-9.9-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.6 5l6.5 5.3C41.9 34.7 44 29.7 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="ga-auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit} className="ga-auth-form">
          {mode === "signup" && (
            <>
              <label>
                Full name
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Kwame Mensah"
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                />
              </label>
            </>
          )}
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
            />
          </label>
          <button type="submit" className="ga-auth-submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="ga-auth-switch">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button type="button" onClick={() => setMode("signup")}>Create an account</button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")}>Sign in</button>
            </>
          )}
        </p>

        <Link to="/" className="ga-auth-back">← Back to site</Link>
      </div>
    </div>
  );
}