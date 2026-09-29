import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/rrr-logo.png";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import NotificationBell from "@/components/NotificationBell";

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
      <AnnouncementBanner />
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-social">
            <a href="https://www.facebook.com/share/189pSzrWyD/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.55.45-1 1-1z"/></svg>
            </a>
            <a href="https://www.instagram.com/ghanada_autos?igsh=ejBzdW10N2c0MWh2" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c2.7 0 3 0 4.1.06 1 .05 1.6.2 2 .36.5.2.9.45 1.3.85.4.4.65.8.85 1.3.16.4.31 1 .36 2 .06 1.1.06 1.4.06 4.1s0 3-.06 4.1c-.05 1-.2 1.6-.36 2a3.6 3.6 0 0 1-.85 1.3c-.4.4-.8.65-1.3.85-.4.16-1 .31-2 .36-1.1.06-1.4.06-4.1.06s-3 0-4.1-.06c-1-.05-1.6-.2-2-.36a3.6 3.6 0 0 1-1.3-.85 3.6 3.6 0 0 1-.85-1.3c-.16-.4-.31-1-.36-2C2.2 15 2.2 14.7 2.2 12s0-3 .06-4.1c.05-1 .2-1.6.36-2 .2-.5.45-.9.85-1.3.4-.4.8-.65 1.3-.85.4-.16 1-.31 2-.36C7.87 2.2 8.17 2.2 12 2.2zm0 3.3a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm5.2-.9a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@guangzhoucarking" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 3h-2.7v11.3a2.6 2.6 0 1 1-2.6-2.6c.2 0 .5 0 .7.1V9.1a5.4 5.4 0 1 0 4.6 5.3V8.6c.9.7 2 1.1 3.2 1.2V7.1a3.6 3.6 0 0 1-3.2-4.1z"/></svg>
            </a>
            <a href="https://wa.me/233592495787" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.41 9.42-9.41 2.52 0 4.88.98 6.66 2.76a9.34 9.34 0 0 1 2.76 6.66c0 5.19-4.23 9.41-9.43 9.41zm5.42-7.12c-.29-.15-1.7-.84-1.96-.93-.26-.1-.45-.15-.64.14-.19.29-.74.93-.9 1.12-.17.19-.33.21-.62.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.6-1.99-.17-.29-.02-.44.12-.59.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38s1.02 2.76 1.17 2.95c.14.19 2.01 3.08 4.88 4.32.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34z"/></svg>
            </a>
          </div>
          <div className="topbar-contact">
            <a href="https://wa.me/233592495787" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.1 2.2 2.9 4 5.1 5.1l1.7-1.7c.2-.2.5-.3.8-.2 1 .3 2 .5 3.1.5.4 0 .7.3.7.7V18c0 .4-.3.7-.7.7A14.7 14.7 0 0 1 2.6 4c0-.4.3-.7.7-.7h2.9c.4 0 .7.3.7.7 0 1 .2 2.1.5 3.1.1.3 0 .6-.2.8l-1.6 1.9z"/></svg>
              +233 592 495 787
            </a>
            <span className="topbar-sep" />
            <a href="https://wa.me/233592495787" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.41 9.42-9.41 2.52 0 4.88.98 6.66 2.76a9.34 9.34 0 0 1 2.76 6.66c0 5.19-4.23 9.41-9.43 9.41z"/></svg>
              WhatsApp +233 592 495 787
            </a>
          </div>
        </div>
      </div>
      <div className="nav-wrap">
        <Link to="/" className="logo">
          <img src={logoAsset} alt="RRR Auto Export" className="logo-img" />
        </Link>
        <nav className="main-links">
          <Link to="/">Home</Link>
          <Link to="/cars">Cars</Link>
          <Link to="/track" search={{ number: "" }}>Track Order</Link>
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
              <Link to="/import">Import From China</Link>
              <Link to="/track" search={{ number: "" }}>Track My Order</Link>
            </div>
          </div>
          <Link to="/" hash="contact">Contact</Link>
        </nav>
        <div className="nav-right">
          <NotificationBell />
          <Link to="/checkout" className="icon-btn" aria-label="Cart">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h2.2l2.3 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H5" /></svg>
          </Link>

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
        <Link to="/track" search={{ number: "" }} onClick={closeMenu}>Track Order</Link>
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
            <Link to="/import" className="mobile-sub" onClick={closeMenu}>Import From China</Link>
            <Link to="/track" search={{ number: "" }} className="mobile-sub" onClick={closeMenu}>Track My Order</Link>
          </div>
        )}
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