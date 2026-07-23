import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCartCount } from "@/lib/cart";

export default function CartBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const c = await getCartCount();
        if (mounted) setCount(c);
      } catch {
        if (mounted) setCount(0);
      }
    };
    refresh();
    const onChange = () => refresh();
    window.addEventListener("cart:changed", onChange);
    window.addEventListener("storage", onChange);
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => {
      mounted = false;
      window.removeEventListener("cart:changed", onChange);
      window.removeEventListener("storage", onChange);
      sub.subscription.unsubscribe();
    };
  }, []);

  // Hide on checkout/auth/admin pages
  const hidden =
    count === 0 ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin");

  if (hidden) return null;

  return (
    <div className="ga-cart-bar" role="region" aria-label="Shopping cart">
      <div className="ga-cart-bar-inner">
        <div className="ga-cart-bar-info">
          <span className="ga-cart-bar-icon" aria-hidden>🛒</span>
          <div>
            <strong>{count} item{count === 1 ? "" : "s"} in your cart</strong>
            <small>Review your cart and complete your purchase</small>
          </div>
        </div>
        <Link to="/checkout" className="ga-cart-bar-cta">
          Proceed to Checkout →
        </Link>
      </div>
    </div>
  );
}