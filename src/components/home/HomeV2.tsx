import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoAsset from "@/assets/ghanada-logo.png.asset.json";

const categories = [
  { name: "Car Sales", sub: "Browse Vehicles", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=120&q=80" },
  { name: "Car Rentals", sub: "Book a Ride", img: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=120&q=80" },
  { name: "Spare Parts", sub: "Quality Parts", img: "https://images.unsplash.com/photo-1596638787647-904d822d751e?auto=format&fit=crop&w=120&q=80" },
  { name: "Car Repairs", sub: "Expert Service", img: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=120&q=80" },
  { name: "Import from Canada", sub: "We import for you", img: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=120&q=80" },
  { name: "Clearing & Forwarding", sub: "Hassle-free Delivery", img: "https://images.unsplash.com/photo-1494412574745-7abda12aa4c8?auto=format&fit=crop&w=120&q=80" },
];

const services = [
  { name: "Car Sales", desc: "Find your dream car from our wide selection.", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80" },
  { name: "Car Rentals", desc: "Rent the perfect car for any occasion.", img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=500&q=80" },
  { name: "Car Repairs", desc: "Professional repair and maintenance services.", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80" },
  { name: "Spare Parts", desc: "Genuine spare parts for all car brands.", img: "https://images.unsplash.com/photo-1621361365424-06f0e1eb5c49?auto=format&fit=crop&w=500&q=80" },
  { name: "Import from Canada", desc: "We help you import quality vehicles.", img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=500&q=80" },
  { name: "Clearing & Forwarding", desc: "Fast and reliable shipping solutions.", img: "https://images.unsplash.com/photo-1494412574745-7abda12aa4c8?auto=format&fit=crop&w=500&q=80" },
];

const featuredCars = [
  { name: "Toyota Land Cruiser 2022", price: "GH₵ 650,000", tag: "Featured", specs: ["SUV", "Automatic", "Diesel"], img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80" },
  { name: "Hyundai Elantra 2021", price: "GH₵ 130,000", specs: ["Sedan", "Automatic", "Petrol"], img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80" },
  { name: "Honda CR-V 2022", price: "GH₵ 280,000", specs: ["SUV", "Automatic", "Petrol"], img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80" },
  { name: "Kia Sportage 2021", price: "GH₵ 175,000", specs: ["SUV", "Automatic", "Petrol"], img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=600&q=80" },
];

const spareParts = [
  { name: "Brake Pads", price: "GH₵ 350", img: "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=400&q=80" },
  { name: "Oil Filter", price: "GH₵ 120", img: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=400&q=80" },
  { name: "Alloy Wheel", price: "GH₵ 850", img: "https://images.unsplash.com/photo-1626668893632-6f3a4466d109?auto=format&fit=crop&w=400&q=80" },
  { name: "Car Battery", price: "GH₵ 650", img: "https://images.unsplash.com/photo-1615469934246-9e353d811ee3?auto=format&fit=crop&w=400&q=80" },
  { name: "Head Lamp", price: "GH₵ 1,200", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80" },
  { name: "Shock Absorber", price: "GH₵ 450", img: "https://images.unsplash.com/photo-1621361365424-06f0e1eb5c49?auto=format&fit=crop&w=400&q=80" },
];

const carTabs = ["All Vehicles", "SUV", "Sedan", "Hatchback", "Luxury", "Pickup"];

export default function HomeV2() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState("All Vehicles");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data: dbParts } = useQuery({
    queryKey: ["v2-parts"],
    queryFn: async () => (await supabase.from("parts").select("*").eq("active", true).limit(6)).data || [],
  });

  const addToCart = async (partId: string) => {
    if (!userId) { toast("Please sign in to add to cart"); navigate({ to: "/auth" }); return; }
    const { error } = await supabase.from("cart_items").insert({ user_id: userId, item_type: "part", part_id: partId, quantity: 1 });
    if (error) toast.error(error.message); else toast.success("Added to cart");
  };

  const parts: Array<{ name: string; price: string; img: string; id: string | null }> =
    (dbParts && dbParts.length > 0)
      ? dbParts.map((p: any) => ({ name: p.name, price: `GH₵ ${p.price}`, img: p.image_url || spareParts[0].img, id: p.id }))
      : spareParts.map((p) => ({ ...p, id: null }));

  const filteredCars = tab === "All Vehicles" ? featuredCars : featuredCars.filter((c) => c.specs.includes(tab));

  return (
    <div className="gav2">
      {/* Top bar */}
      <div className="v2-topbar">
        <div className="v2-container v2-topbar-inner">
          <div className="v2-topbar-left">
            <span className="v2-phone">📞 +1 437 436 4357</span>
          </div>
          <div className="v2-topbar-right">
            {userId ? (
              <Link to="/dashboard" className="v2-topbar-link">My Account</Link>
            ) : (
              <Link to="/auth" className="v2-topbar-link">Login / Register</Link>
            )}
            <span className="v2-topbar-icon">♡ <span className="v2-badge">0</span></span>
            <Link to={userId ? "/dashboard" : "/auth"} className="v2-topbar-icon v2-cart">🛒 <span className="v2-badge v2-badge-y">0</span></Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="v2-header">
        <div className="v2-container v2-header-inner">
          <Link to="/" className="v2-logo">
            <img src={logoAsset.url} alt="Ghanada Autos" />
          </Link>
          <nav className={`v2-nav ${menuOpen ? "is-open" : ""}`}>
            <a href="#home" className="v2-nav-link is-active">Home</a>
            <a href="#about" className="v2-nav-link">About Us</a>
            <a href="#services" className="v2-nav-link">Services ▾</a>
            <a href="#shop" className="v2-nav-link">Shop ▾</a>
            <a href="#bookings" className="v2-nav-link">Bookings</a>
            <a href="#blog" className="v2-nav-link">Blog</a>
            <a href="#contact" className="v2-nav-link">Contact</a>
          </nav>
          <button className="v2-burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">☰</button>
        </div>
      </header>

      {/* Hero + sidebar */}
      <section className="v2-hero" id="home">
        <div className="v2-container v2-hero-grid">
          <div className="v2-hero-main">
            <div className="v2-hero-bg" />
            <div className="v2-hero-copy">
              <span className="v2-eyebrow">YOUR ONE-STOP AUTOMOTIVE SOLUTION</span>
              <h1 className="v2-h1">
                We Sell, We Repair,<br />We Deliver <span className="v2-accent">Excellence.</span>
              </h1>
              <p className="v2-hero-sub">
                From car sales to repairs, rentals, spare parts, vehicle importation from Canada,
                and clearing & forwarding — we've got you covered.
              </p>
              <div className="v2-hero-cta">
                <a href="#services" className="v2-btn v2-btn-y">Explore Our Services →</a>
                <a href="#featured" className="v2-btn v2-btn-outline">Browse Cars</a>
              </div>
            </div>
            <div className="v2-hero-img">
              <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80" alt="Featured car" />
            </div>
          </div>

          <aside className="v2-side">
            <div className="v2-panel">
              <div className="v2-panel-head">
                <h3>Popular Categories</h3>
                <a href="#services" className="v2-link-y">View all</a>
              </div>
              <ul className="v2-cat-list">
                {categories.map((c) => (
                  <li key={c.name} className="v2-cat">
                    <div className="v2-cat-icon">🚗</div>
                    <div className="v2-cat-txt">
                      <div className="v2-cat-name">{c.name}</div>
                      <div className="v2-cat-sub">{c.sub}</div>
                    </div>
                    <img src={c.img} alt={c.name} className="v2-cat-thumb" />
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Trust bar */}
        <div className="v2-container">
          <div className="v2-trust">
            {[
              { i: "👥", t: "Trusted by Thousands", s: "Happy Customers" },
              { i: "🛡", t: "Quality Vehicles", s: "Well Inspected" },
              { i: "💳", t: "Secure Payments", s: "100% Protected" },
              { i: "🎧", t: "Fast Support", s: "24/7 Available" },
            ].map((x) => (
              <div key={x.t} className="v2-trust-item">
                <span className="v2-trust-icon">{x.i}</span>
                <div>
                  <div className="v2-trust-title">{x.t}</div>
                  <div className="v2-trust-sub">{x.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services + right rail */}
      <section className="v2-section" id="services">
        <div className="v2-container v2-two-col">
          <div>
            <div className="v2-section-head">
              <h2><span className="v2-tick" />Our Services</h2>
              <a href="#services" className="v2-link-y">View all services</a>
            </div>
            <div className="v2-svc-grid">
              {services.map((s) => (
                <article key={s.name} className="v2-svc-card">
                  <div className="v2-svc-img"><img src={s.img} alt={s.name} /></div>
                  <h4>{s.name}</h4>
                  <p>{s.desc}</p>
                  <a href="#" className="v2-link-y">Explore →</a>
                </article>
              ))}
            </div>
          </div>

          <aside className="v2-rail">
            <div className="v2-panel">
              <h3>Book a Service</h3>
              <p className="v2-panel-sub">Schedule your service in minutes</p>
              <select className="v2-input"><option>Select Service</option><option>Car Repair</option><option>Rental</option><option>Import Request</option></select>
              <input className="v2-input" type="date" />
              <input className="v2-input" type="time" />
              <button className="v2-btn v2-btn-y v2-full">Book Now</button>
            </div>

            <div className="v2-panel v2-panel-ad">
              <h3>Need a Car Imported from Canada?</h3>
              <p>We handle everything from purchase to delivery in Ghana.</p>
              <a href="#import" className="v2-btn v2-btn-y v2-full">Request Import</a>
            </div>

            <div className="v2-panel">
              <h3>Why Choose<br />Ghanada Autos?</h3>
              <ul className="v2-check-list">
                <li>Professional & Reliable</li>
                <li>Affordable Pricing</li>
                <li>Quality Assurance</li>
                <li>Fast & Secure Delivery</li>
                <li>24/7 Customer Support</li>
              </ul>
              <div className="v2-tagline">Drive with Confidence</div>
            </div>
          </aside>
        </div>
      </section>

      {/* Featured cars */}
      <section className="v2-section" id="featured">
        <div className="v2-container">
          <div className="v2-section-head">
            <h2><span className="v2-tick" />Featured Cars</h2>
            <a href="#" className="v2-link-y">View all cars</a>
          </div>
          <div className="v2-tabs">
            {carTabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`v2-tab ${tab === t ? "is-active" : ""}`}>{t}</button>
            ))}
          </div>
          <div className="v2-car-grid">
            {filteredCars.map((c) => (
              <article key={c.name} className="v2-car-card">
                {c.tag && <span className="v2-car-tag">{c.tag}</span>}
                <div className="v2-car-img"><img src={c.img} alt={c.name} /></div>
                <h4>{c.name}</h4>
                <div className="v2-car-specs">{c.specs.map((s) => <span key={s}>◉ {s}</span>)}</div>
                <div className="v2-car-price">{c.price}</div>
                <button className="v2-btn v2-btn-dark v2-full">View Details</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Popular spare parts */}
      <section className="v2-section" id="shop">
        <div className="v2-container">
          <div className="v2-section-head">
            <h2><span className="v2-tick" />Popular Spare Parts</h2>
            <a href="#" className="v2-link-y">View all parts</a>
          </div>
          <div className="v2-parts-grid">
            {parts.map((p) => (
              <article key={p.name} className="v2-part-card">
                <div className="v2-part-img"><img src={p.img} alt={p.name} /></div>
                <h4>{p.name}</h4>
                <div className="v2-car-price">{p.price}</div>
                <button className="v2-part-cart" onClick={() => p.id && addToCart(p.id)}>🛒</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="v2-section v2-how">
        <div className="v2-container v2-how-inner">
          <h2 className="v2-how-title">How It Works</h2>
          <div className="v2-how-grid">
            {[
              { n: 1, t: "Choose", s: "Select your car, part or service" },
              { n: 2, t: "Book / Order", s: "Place your booking or order online" },
              { n: 3, t: "Confirm", s: "We confirm and prepare your order" },
              { n: 4, t: "Deliver / Service", s: "We deliver or service your car" },
            ].map((x) => (
              <div key={x.n} className="v2-step">
                <div className="v2-step-num">{x.n}</div>
                <div>
                  <div className="v2-step-title">{x.t}</div>
                  <div className="v2-step-sub">{x.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="v2-newsletter">
        <div className="v2-container v2-news-inner">
          <div className="v2-news-copy">
            <span className="v2-news-icon">✉</span>
            <strong>Stay Updated</strong>
            <span className="v2-news-sub">Subscribe to our newsletter for the latest deals and updates.</span>
          </div>
          <form className="v2-news-form" onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed"); }}>
            <input className="v2-input v2-news-input" placeholder="Enter your email" />
            <button className="v2-btn v2-btn-dark">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="v2-footer" id="contact">
        <div className="v2-container v2-footer-grid">
          <div>
            <img src={logoAsset.url} alt="Ghanada Autos" className="v2-footer-logo" />
            <p className="v2-footer-about">
              Your trusted automotive partner for sales, repairs, rentals, spare parts, importation and more.
            </p>
            <div className="v2-socials"><span>f</span><span>ig</span><span>wa</span><span>tw</span></div>
          </div>
          <div>
            <h5>Quick Links</h5>
            <ul><li>Home</li><li>About Us</li><li>Services</li><li>Shop</li><li>Bookings</li><li>Contact Us</li></ul>
          </div>
          <div>
            <h5>Our Services</h5>
            <ul><li>Car Sales</li><li>Car Rentals</li><li>Car Repairs</li><li>Spare Parts</li><li>Import from Canada</li><li>Clearing & Forwarding</li></ul>
          </div>
          <div>
            <h5>Customer Support</h5>
            <ul><li>FAQs</li><li>Shipping & Delivery</li><li>Returns & Refunds</li><li>Terms & Conditions</li><li>Privacy Policy</li></ul>
          </div>
          <div>
            <h5>Contact Us</h5>
            <ul>
              <li>📍 Toronto, Canada · Takoradi, Ghana</li>
              <li>📞 +1 437 436 4357</li>
              <li>📞 +233 547 464 093</li>
              <li>✉ info@ghanadaautos.com</li>
              <li>🕐 Mon - Sat: 8:00AM - 6:00PM</li>
            </ul>
          </div>
        </div>
        <div className="v2-footer-bottom">
          <span>© 2026 Ghanada Autos. All Rights Reserved.</span>
          <span className="v2-pay">VISA · Mastercard · MTN MoMo</span>
        </div>
      </footer>
    </div>
  );
}