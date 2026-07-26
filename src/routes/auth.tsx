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
  validateSearch: (s: Record<string, unknown>) => ({
    confirmed: typeof s.confirmed === "string" ? s.confirmed : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [confirmSent, setConfirmSent] = useState<string | null>(null);
  const [justConfirmed, setJustConfirmed] = useState(false);

  const getPostAuthPath = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    return data ? "/admin" : "/dashboard";
  };

  useEffect(() => {
    if (search.confirmed === "1") {
      setJustConfirmed(true);
      setMode("login");
      toast.success("Email confirmed. Please sign in to continue.");
      return;
    }
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const destination = await getPostAuthPath(data.user.id);
        navigate({ to: destination });
      }
    });
  }, [navigate, search.confirmed]);

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
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const destination = await getPostAuthPath(data.user.id);
      navigate({ to: destination });
    } else {
      navigate({ to: "/dashboard" });
    }
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
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth/confirmed",
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        // Always force explicit login after signup — if Supabase returned a
        // session (edge case), clear it so the user must confirm their email
        // and sign in intentionally.
        if (signUpData.session) {
          try { await supabase.auth.signOut(); } catch {}
        }
        setConfirmSent(email);
        toast.success("Confirmation email sent. Please check your inbox.");
        setMode("login");
        setPassword("");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const msg = (error.message || "").toLowerCase();
          if (msg.includes("confirm") || msg.includes("not confirmed") || (error as any).code === "email_not_confirmed") {
            setConfirmSent(email);
            toast.error("Please confirm your email address before signing in. Check your inbox for the confirmation link.");
            return;
          }
          throw error;
        }
        toast.success("Signed in");
        const destination = data.user ? await getPostAuthPath(data.user.id) : "/dashboard";
        navigate({ to: destination });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!confirmSent) return;
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: confirmSent,
      options: { emailRedirectTo: window.location.origin + "/auth/confirmed" },
    });
    setLoading(false);
    if (error) toast.error(error.message || "Could not resend email");
    else toast.success("Confirmation email resent.");
  };

  return (
    <div className="ga-auth-page">
      <aside className="ga-auth-hero">
        <div className="ga-auth-hero-inner">
          <div>
            <Link to="/" className="ga-auth-hero-logo" aria-label="Ghanada Autos home">
              <img src={logoAsset.url} alt="Ghanada Autos" />
            </Link>
            <h2>Drive, ship and source with Ghanada Autos.</h2>
            <p>
              Your account keeps every rental booking, spare-part order and Canada
              import in one place — from Toronto to Takoradi.
            </p>
            <ul className="ga-auth-hero-features">
              <li><span className="dot">✓</span> Book self-drive rentals or request a driver in seconds</li>
              <li><span className="dot">✓</span> Track parts orders and reorder with one tap</li>
              <li><span className="dot">✓</span> Manage Canada imports and clearing from your dashboard</li>
            </ul>
          </div>
          <div className="ga-auth-hero-foot">
            🇨🇦 Toronto · 🇬🇭 Takoradi &nbsp;·&nbsp; +1 437 436 4357
          </div>
        </div>
      </aside>

      <main className="ga-auth-panel">
        <div className="ga-auth-card">
          <Link to="/" className="ga-auth-mobile-logo" aria-label="Ghanada Autos home">
            <img src={logoAsset.url} alt="Ghanada Autos" />
          </Link>

          <div className="ga-auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "is-active" : ""}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={mode === "signup" ? "is-active" : ""}
              onClick={() => setMode("signup")}
            >
              Create account
            </button>
          </div>

          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="ga-auth-sub">
            {mode === "login"
              ? "Sign in to manage orders, cart and bookings."
              : "Join Ghanada Autos to shop parts and rent vehicles."}
          </p>

          {confirmSent && (
            <div
              role="status"
              style={{
                background: "#ecfdf5",
                border: "1px solid #10b981",
                color: "#065f46",
                borderRadius: 12,
                padding: "12px 14px",
                margin: "12px 0 16px",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              <strong>Confirm your email address.</strong>
              <div style={{ marginTop: 4 }}>
                We sent a confirmation link to <b>{confirmSent}</b>. Click it, then sign in below.
              </div>
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={loading}
                style={{
                  marginTop: 8,
                  background: "transparent",
                  border: "none",
                  color: "#065f46",
                  fontWeight: 600,
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Resend confirmation email
              </button>
            </div>
          )}

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

          <div className="ga-auth-divider"><span>or use email</span></div>

          <form onSubmit={handleSubmit} className="ga-auth-form">
            {mode === "signup" && (
              <div className="ga-auth-row">
                <label>
                  Full name
                  <input
                    type="text"
                    required
                    autoComplete="name"
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
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 XX XXX XXXX"
                  />
                </label>
              </div>
            )}
            <label>
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="ga-auth-pwd">
              Password
              <input
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
              />
              <button
                type="button"
                className="ga-auth-pwd-toggle"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </label>
            <button type="submit" className="ga-auth-submit" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="ga-auth-terms">
              By creating an account you agree to our terms of service and privacy policy.
            </p>
          )}

          <p className="ga-auth-switch">
            {mode === "login" ? (
              <>
                New to Ghanada Autos?
                <button type="button" onClick={() => setMode("signup")}>Create an account</button>
              </>
            ) : (
              <>
                Already have an account?
                <button type="button" onClick={() => setMode("login")}>Sign in</button>
              </>
            )}
          </p>

          <Link to="/" className="ga-auth-back">← Back to site</Link>
        </div>
      </main>
    </div>
  );
}