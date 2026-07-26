import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/ghanada-logo.png.asset.json";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!servicesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [servicesOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header>
      <div className="nav-wrap">
        <Link to="/" className="logo">
          <img src={logoAsset.url} alt="Ghanada Autos" className="logo-img" />
        </Link>
        <nav className="main-links">
          <Link to="/">Home</Link>
          <Link to="/cars">Cars</Link>
          <div className={`nav-dropdown${servicesOpen ? " is-open" : ""}`} ref={servicesRef}>
            <button
              className="nav-dropdown-trigger"
              type="button"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services <span className="caret">▾</span>
            </button>
            <div className="nav-dropdown-menu" onClick={() => setServicesOpen(false)}>
              <Link to="/rentals">Rentals</Link>
              <Link to="/repairs">Repairs</Link>
              <Link to="/parts">Spare Parts</Link>
              <Link to="/import">Import From Canada</Link>
              <Link to="/" hash="clearing">Clearing &amp; Forwarding</Link>
            </div>
          </div>
          <Link to="/" hash="about">About</Link>
          <Link to="/" hash="contact">Contact</Link>
        </nav>
        <div className="nav-right">
          <Link to="/checkout" className="icon-btn" aria-label="Cart">🛒</Link>
          <div className="nav-divider" />
          <div className="auth-links">
            {userId ? (
              <Link to="/dashboard">My Account</Link>
            ) : (
              <>
                <Link to="/auth">Login</Link>
                <Link to="/auth">Register</Link>
              </>
            )}
          </div>
        </div>
        <button
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/cars" onClick={closeMenu}>Cars</Link>
        <button
          type="button"
          className={`mobile-group-toggle${servicesOpen ? " is-open" : ""}`}
          aria-expanded={servicesOpen}
          onClick={() => setServicesOpen((v) => !v)}
        >
          Services <span className="caret">▾</span>
        </button>
        {servicesOpen && (
          <div className="mobile-sub-group">
            <Link to="/rentals" className="mobile-sub" onClick={closeMenu}>Rentals</Link>
            <Link to="/repairs" className="mobile-sub" onClick={closeMenu}>Repairs</Link>
            <Link to="/parts" className="mobile-sub" onClick={closeMenu}>Spare Parts</Link>
            <Link to="/import" className="mobile-sub" onClick={closeMenu}>Import From Canada</Link>
            <Link to="/" hash="clearing" className="mobile-sub" onClick={closeMenu}>Clearing & Forwarding</Link>
          </div>
        )}
        <Link to="/" hash="about" onClick={closeMenu}>About</Link>
        <Link to="/" hash="contact" onClick={closeMenu}>Contact</Link>
        <div className="mobile-menu-divider" />
        {userId ? (
          <Link to="/dashboard" onClick={closeMenu}>My Dashboard</Link>
        ) : (
          <>
            <Link to="/auth" onClick={closeMenu}>Login</Link>
            <Link to="/auth" onClick={closeMenu}>Register</Link>
          </>
        )}
      </div>
    </header>
  );
}