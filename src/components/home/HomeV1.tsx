import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addToCart } from "@/lib/cart";
import { vehicleSlug } from "@/lib/slug";
import { toast } from "sonner";
import logoAsset from "@/assets/ghanada-logo.png.asset.json";
import logoTransparentAsset from "@/assets/ghanada-logo-transparent.png.asset.json";
import { blogPosts } from "@/lib/blog";
import engineImg from "@/assets/parts/engine.jpg.asset.json";
import brakeImg from "@/assets/parts/brake.jpg.asset.json";
import tyreImg from "@/assets/parts/tyre.jpg.asset.json";
import batteryImg from "@/assets/parts/battery.jpg.asset.json";
import headlightImg from "@/assets/parts/headlight.jpg.asset.json";
import clearingImg from "@/assets/parts/clearing.jpg.asset.json";

export default function HomeV1() {
  return <GhanadaHome />;
}

const vehicles = [
  { name: "Toyota Highlander XLE", price: "GH₵ 385,000", year: "2022", miles: "18,400 mi", fuel: "Petrol", trans: "Automatic", finance: true, img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80" },
  { name: "Mercedes-Benz C300", price: "GH₵ 512,000", year: "2023", miles: "9,200 mi", fuel: "Petrol", trans: "Automatic", finance: true, img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80" },
  { name: "Ford F-150 XLT", price: "GH₵ 440,000", year: "2021", miles: "27,600 mi", fuel: "Diesel", trans: "Automatic", finance: false, img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80" },
  { name: "BMW X5 xDrive40i", price: "GH₵ 645,000", year: "2023", miles: "6,100 mi", fuel: "Petrol", trans: "Automatic", finance: true, img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80" },
];

const partsFallback = [
  { name: "Engine Parts", stars: "★★★★★", price: "GH₵ 1,250", img: engineImg.url },
  { name: "Brake Pads", stars: "★★★★☆", price: "GH₵ 380", img: brakeImg.url },
  { name: "Tyres", stars: "★★★★★", price: "GH₵ 690", img: tyreImg.url },
  { name: "Batteries", stars: "★★★★☆", price: "GH₵ 950", img: batteryImg.url },
  { name: "Headlights", stars: "★★★★★", price: "GH₵ 540", img: headlightImg.url },
];

const rentalsFallback = [
  { name: "Economy — Toyota Corolla", price: "GH₵ 420 / day", seats: "5 Seats", trans: "Auto", fuel: "Petrol", img: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=500&q=80" },
  { name: "SUV — RAV4", price: "GH₵ 680 / day", seats: "5 Seats", trans: "Auto", fuel: "Petrol", img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=500&q=80" },
  { name: "Luxury — Mercedes E-Class", price: "GH₵ 1,250 / day", seats: "5 Seats", trans: "Auto", fuel: "Petrol", img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=500&q=80" },
  { name: "Van — Hiace", price: "GH₵ 950 / day", seats: "12 Seats", trans: "Manual", fuel: "Diesel", img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=500&q=80" },
];

function GhanadaHome() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!servicesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [servicesOpen]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);

  const { data: dbParts, isLoading: partsLoading } = useQuery({
    queryKey: ["home-parts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parts").select("*").eq("active", true).limit(8);
      if (error) throw error;
      return data || [];
    },
  });
  const { data: dbRentals, isLoading: rentalsLoading } = useQuery({
    queryKey: ["home-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rentals").select("*").eq("active", true).limit(8);
      if (error) throw error;
      return data || [];
    },
  });
  const { data: dbVehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["home-vehicles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("vehicles").select("*").eq("active", true).order("featured", { ascending: false }).limit(12);
      if (error) throw error;
      return data || [];
    },
  });
  const [vehicleFilter, setVehicleFilter] = useState<string>("All");
  const [condition, setCondition] = useState<"all" | "new" | "used">("all");
  const [fMake, setFMake] = useState<string>("");
  const [fModel, setFModel] = useState<string>("");
  const [fBody, setFBody] = useState<string>("");
  const [fPrice, setFPrice] = useState<string>("");

  const vehicleList: any[] = (dbVehicles as any[]) || [];
  const uniq = (arr: (string | null | undefined)[]) =>
    Array.from(new Set(arr.filter((x): x is string => !!x && String(x).trim() !== ""))).sort();
  const makes = uniq(vehicleList.map((v) => v.brand));
  const models = uniq(vehicleList.filter((v) => !fMake || v.brand === fMake).map((v) => v.model));
  const bodyTypes = uniq(vehicleList.map((v) => v.body_type));
  const priceBuckets = [
    { label: "Under GHS 200,000", value: "0-200000" },
    { label: "GHS 200,000 – 400,000", value: "200000-400000" },
    { label: "GHS 400,000 – 700,000", value: "400000-700000" },
    { label: "GHS 700,000 – 1,000,000", value: "700000-1000000" },
    { label: "Above GHS 1,000,000", value: "1000000-99999999" },
  ];

  const filteredVehicles = vehicleList.filter((v) => {
    if (condition !== "all" && (v.condition || "used") !== condition) return false;
    if (fMake && v.brand !== fMake) return false;
    if (fModel && v.model !== fModel) return false;
    if (fBody && v.body_type !== fBody) return false;
    if (vehicleFilter !== "All" && v.body_type !== vehicleFilter) return false;
    if (fPrice) {
      const [lo, hi] = fPrice.split("-").map(Number);
      const p = Number(v.price);
      if (p < lo || p > hi) return false;
    }
    return true;
  });

  const runSearch = () => {
    const el = document.getElementById("cars");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const resetSearch = () => {
    setCondition("all"); setFMake(""); setFModel(""); setFBody(""); setFPrice(""); setVehicleFilter("All");
  };

  /* ---------- Hero luxury car slides ---------- */
  const heroFallback = [
    { name: "Mercedes-Benz S-Class", tag: "Executive Saloon", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1400&q=80", to: "/cars" },
    { name: "Range Rover Autobiography", tag: "Luxury SUV", img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=80", to: "/cars" },
    { name: "BMW 7 Series", tag: "Performance Luxury", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80", to: "/cars" },
    { name: "Porsche Cayenne", tag: "Sport Utility", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80", to: "/cars" },
  ];
  const heroSlides = (vehicleList.filter((v) => v.image_url).slice(0, 5).map((v) => ({
    name: v.name as string,
    tag: [v.condition === "new" ? "New" : "Pre-Owned", v.body_type, v.year].filter(Boolean).join(" · "),
    img: v.image_url as string,
    price: `GHS ${Number(v.price).toLocaleString()}`,
    slug: vehicleSlug(v),
  })) as any[]);
  const slides: any[] = heroSlides.length ? heroSlides : heroFallback;
  const [slide, setSlide] = useState(0);
  useEffect(() => { setSlide(0); }, [slides.length]);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, [slides.length]);
  const goSlide = (dir: -1 | 1) => setSlide((s) => (s + dir + slides.length) % slides.length);

  const openPart = (id: string) => navigate({ to: "/parts/$id", params: { id } });

  const openRental = (id: string) => navigate({ to: "/rentals/$id", params: { id } });
  const openVehicle = (v: any) => navigate({ to: "/vehicles/$id", params: { id: vehicleSlug(v) } });

  const quickAddVehicle = async (v: any, buyNow: boolean) => {
    try {
      await addToCart({
        item_type: "vehicle",
        vehicle_id: v.id,
        quantity: 1,
        name: v.name,
        unit_price: Number(v.price),
        image_url: v.image_url,
      });
      toast.success(buyNow ? "Proceeding to checkout" : "Added to cart");
      if (buyNow) navigate({ to: "/checkout" });
    } catch (e: any) {
      toast.error(e.message || "Could not add to cart");
    }
  };

  const quickAddPart = async (p: any, buyNow: boolean) => {
    // If part has variations, force user into the detail page to pick one
    const { data: vars } = await supabase.from("part_variations").select("id").eq("part_id", p.id).eq("active", true).limit(1);
    if (vars && vars.length > 0) {
      navigate({ to: "/parts/$id", params: { id: p.id } });
      return;
    }
    try {
      await addToCart({
        item_type: "part",
        part_id: p.id,
        quantity: 1,
        name: p.name,
        unit_price: Number(p.price),
        image_url: p.image_url,
      });
      toast.success(buyNow ? "Proceeding to checkout" : "Added to cart");
      if (buyNow) navigate({ to: "/checkout" });
    } catch (e: any) {
      toast.error(e.message || "Could not add to cart");
    }
  };

  return (
    <div className="ga">
      {/* HEADER */}
      <header>
        <div className="nav-wrap">
          <div className="logo">
            <img src={logoAsset.url} alt="Ghanada Autos" className="logo-img" />
          </div>
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
                <a href="#clearing">Clearing &amp; Forwarding</a>
              </div>
            </div>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="nav-right">
            <span className="icon-btn">🔍</span>
            <span className="icon-btn">♡</span>
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
            <a href="#quote" className="btn btn-ghost" style={{ padding: "10px 20px" }}>
              Request Quote
            </a>
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
              <a href="#clearing" className="mobile-sub" onClick={closeMenu}>Clearing & Forwarding</a>
            </div>
          )}
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <div className="mobile-menu-divider" />
          {userId ? (
            <Link to="/dashboard" onClick={closeMenu}>My Dashboard</Link>
          ) : (
            <>
              <Link to="/auth" onClick={closeMenu}>Login</Link>
              <Link to="/auth" onClick={closeMenu}>Register</Link>
            </>
          )}
          <a href="#quote" className="btn btn-primary mobile-cta" onClick={closeMenu}>
            Request Quote
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-glow" aria-hidden />
        <div className="hero-content hero-split">
          <div className="hero-copy">
          <div className="eyebrow">Ghana's Complete Automotive Company</div>
          <h1>
            Your Complete
            <br />
            Automotive Partner
          </h1>
          <div className="sub">
            <span>Buy Cars</span>
            <span>Rent Cars</span>
            <span>Repair Vehicles</span>
            <span>Genuine Spare Parts</span>
            <span>Import From Canada</span>
            <span>Clearing &amp; Forwarding</span>
          </div>
          <div className="hero-actions">
            <Link to="/cars" className="btn btn-primary">Browse Cars →</Link>
            <Link to="/repairs" className="btn btn-outline">Book a Repair</Link>
          </div>
          <div className="hero-stats">
            <div><strong>10+</strong><span>Years Experience</span></div>
            <div><strong>500+</strong><span>Cars Sold</span></div>
            <div><strong>2,500+</strong><span>Satisfied Customers</span></div>
            <div><strong>24/7</strong><span>Customer Support</span></div>
          </div>
          </div>

          <div className="hero-slider">
            <div className="hero-slider-arc" aria-hidden />
            <div className="hero-stage">
              {slides.map((s, i) => (
                <div key={s.name + i} className={`hero-slide${i === slide ? " is-active" : ""}`} aria-hidden={i !== slide}>
                  <img src={s.img} alt={s.name} loading={i === 0 ? "eager" : "lazy"} />
                </div>
              ))}
            </div>
            <button className="hero-nav prev" aria-label="Previous vehicle" onClick={() => goSlide(-1)}>‹</button>
            <button className="hero-nav next" aria-label="Next vehicle" onClick={() => goSlide(1)}>›</button>
            <div className="hero-slide-card">
              <div className="hero-slide-tag">{slides[slide]?.tag}</div>
              <div className="hero-slide-name">
                {slides[slide]?.slug ? (
                  <Link to="/vehicles/$id" params={{ id: slides[slide].slug }}>{slides[slide].name}</Link>
                ) : (
                  <Link to="/cars">{slides[slide]?.name}</Link>
                )}
              </div>
              {slides[slide]?.price && <div className="hero-slide-price">{slides[slide].price}</div>}
            </div>
            <div className="hero-dots">
              {slides.map((s, i) => (
                <button key={"d" + i} className={i === slide ? "active" : ""} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CAR SEARCH BAR */}
      <section className="ga-search-section">
        <div className="container">
          <div className="ga-search-bar">
            <div className="ga-search-conditions" role="tablist" aria-label="Vehicle condition">
              {(["all", "new", "used"] as const).map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={condition === c}
                  className={`ga-cond ${condition === c ? "active" : ""}`}
                  onClick={() => setCondition(c)}
                >
                  <span className="ga-cond-dot" />
                  {c === "all" ? "All" : c === "new" ? "New" : "Used"}
                </button>
              ))}
            </div>
            <div className="ga-search-fields">
              <label className="ga-search-field">
                <span>Make</span>
                <select value={fMake} onChange={(e) => { setFMake(e.target.value); setFModel(""); }}>
                  <option value="">Any make</option>
                  {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="ga-search-field">
                <span>Model</span>
                <select value={fModel} onChange={(e) => setFModel(e.target.value)}>
                  <option value="">Any model</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="ga-search-field">
                <span>Body Style</span>
                <select value={fBody} onChange={(e) => setFBody(e.target.value)}>
                  <option value="">Any body</option>
                  {bodyTypes.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
              <label className="ga-search-field">
                <span>Price Range</span>
                <select value={fPrice} onChange={(e) => setFPrice(e.target.value)}>
                  <option value="">Any price</option>
                  {priceBuckets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <button className="ga-search-btn" onClick={runSearch}>
                <span>Search</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </button>
            </div>
            {(condition !== "all" || fMake || fModel || fBody || fPrice) && (
              <div className="ga-search-summary">
                <span>{filteredVehicles.length} matching {filteredVehicles.length === 1 ? "car" : "cars"}</span>
                <button className="ga-search-reset" onClick={resetSearch}>Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUICK SERVICES */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">What We Do</div>
            <h2>One company, every automotive need</h2>
            <p>From the showroom floor to the port of Tema — sales, rentals, repairs, parts and logistics, all under one roof.</p>
          </div>
          <div className="services-grid">
            {[
              ["🚗", "Car Sales", "New & certified pre-owned vehicles."],
              ["🔑", "Car Rentals", "Daily, weekly & monthly fleets."],
              ["🛠️", "Repairs", "Certified technicians, honest pricing."],
              ["⚙️", "Spare Parts", "Genuine parts, all major brands."],
              ["🚢", "Import From Canada", "Sourced, inspected & shipped for you."],
              ["📋", "Clearing & Forwarding", "Full customs & port handling."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="service-card">
                <div className="service-icon">{icon}</div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="section" id="cars" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Featured Vehicles</div>
            <h2>Find your next car</h2>
          </div>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Link to="/cars" className="btn btn-ghost">Browse all cars for sale →</Link>
          </div>
          <div className="vehicle-grid">
            {(dbVehicles && dbVehicles.length > 0 ? filteredVehicles : []).map((v: any) => (
              <div key={v.id} className="vcard">
                <div className="vimg" onClick={() => openVehicle(v)} style={{ cursor: "pointer" }}>
                   {v.finance_available && <span className="finance-tag">Finance Available</span>}
                   {v.condition === "new" && <span className="condition-tag">New</span>}
                   <span className="fav-btn">♡</span>
                   <img src={v.image_url || vehicles[0].img} alt={v.name} />
                 </div>
                 <div className="vbody">
                  <h4><Link to="/vehicles/$id" params={{ id: vehicleSlug(v) }} className="ga-link-plain">{v.name}</Link></h4>
                  <div className="vprice">GHS {Number(v.price).toLocaleString()}</div>
                  <div className="vmeta">
                    {v.year && <span>📅 {v.year}</span>}
                    {v.mileage_km ? <span>🛣️ {Number(v.mileage_km).toLocaleString()} km</span> : null}
                    {v.fuel && <span>⛽ {v.fuel}</span>}
                    {v.transmission && <span>⚙️ {v.transmission}</span>}
                  </div>
                  <div className="vactions">
                    <button className="btn btn-ghost" onClick={() => quickAddVehicle(v, false)} aria-label="Add to cart">🛒 Add</button>
                    <button className="btn btn-primary" onClick={() => quickAddVehicle(v, true)}>Buy Now</button>
                  </div>
                 <button className="vcard-details" onClick={() => openVehicle(v)}>View full details →</button>
                </div>
              </div>
            ))}
            {dbVehicles && dbVehicles.length > 0 && filteredVehicles.length === 0 && (
              <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                No cars match your search. <button onClick={resetSearch} className="ga-link-plain" style={{ textDecoration: "underline", background: "none", border: 0, cursor: "pointer" }}>Clear filters</button>
              </p>
            )}
            {vehiclesLoading && <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>Loading available cars…</p>}
            {!vehiclesLoading && (!dbVehicles || dbVehicles.length === 0) && vehicles.map((v) => (
              <div key={v.name} className="vcard">
                <div className="vimg">
                  {v.finance && <span className="finance-tag">Finance Available</span>}
                  <span className="fav-btn">♡</span>
                  <img src={v.img} alt={v.name} />
                </div>
                <div className="vbody">
                  <h4>{v.name}</h4>
                  <div className="vprice">{v.price}</div>
                  <div className="vmeta">
                    <span>📅 {v.year}</span><span>🛣️ {v.miles}</span><span>⛽ {v.fuel}</span><span>⚙️ {v.trans}</span>
                  </div>
                  <div className="vactions">
                    <a className="btn btn-primary" style={{ width: "100%", textAlign: "center" }} href="#quote">Reserve this car</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPARE PARTS */}
      <section className="section" id="parts">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Shop Spare Parts</div>
            <h2>Genuine parts, guaranteed fit</h2>
          </div>
          <div className="parts-grid">
            {(dbParts && dbParts.length > 0
              ? dbParts.map((p: any) => (
                  <div key={p.id} className="part-card">
                     <div className="pimg" onClick={() => openPart(p.id)} style={{ cursor: "pointer" }}><img src={p.image_url || partsFallback[0].img} alt={p.name} /></div>
                    <div className="part-body">
                       <h5 className="part-title"><Link to="/parts/$id" params={{ id: p.id }} className="ga-link-plain">{p.name}</Link></h5>
                      <div className="stars">★★★★★</div>
                      <div className="part-price">GHS {Number(p.price).toFixed(2)}</div>
                      <div className="part-actions">
                        <button className="part-add" onClick={() => quickAddPart(p, false)} aria-label="Add to cart">🛒</button>
                        <button className="add-cart" onClick={() => quickAddPart(p, true)}>Buy Now</button>
                      </div>
                    </div>
                  </div>
                ))
              : partsLoading ? (
                <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center" }}>Loading parts for checkout…</p>
              ) : partsFallback.map((p) => (
                  <div key={p.name} className="part-card">
                    <div className="pimg"><img src={p.img} alt={p.name} /></div>
                    <div className="part-body">
                      <h5>{p.name}</h5>
                      <div className="stars">{p.stars}</div>
                      <div className="part-price">{p.price}</div>
                      <a className="add-cart" href="#quote">Request this part</a>
                    </div>
                  </div>
                )))}
          </div>
        </div>
      </section>

      {/* RENTALS BAND */}
      <section className="band" id="rentals">
        <div className="band-bg">
          <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=2000&q=80" alt="" />
        </div>
        <div
          className="band-overlay"
          style={{ background: "linear-gradient(100deg, rgba(6,95,70,.94) 20%, rgba(6,95,70,.55) 60%, rgba(6,95,70,.2) 100%)" }}
        />
        <div className="band-content">
          <div className="eyebrow">Car Rentals</div>
          <h2>Drive off in minutes, not hours</h2>
          <p className="lead">Economy, SUV, luxury, pickup and van fleets — ready for airport pickup, business travel or weekend getaways.</p>
          <div className="vehicle-grid rental-grid">
            {(dbRentals && dbRentals.length > 0
              ? dbRentals.map((r: any) => (
                  <div key={r.id} className="vcard rental-card">
                    <Link to="/rentals/$id" params={{ id: r.id }} className="vimg rental-image-link" aria-label={`View ${r.name} rental details`}>
                      <img src={r.image_url || rentalsFallback[0].img} alt={r.name} />
                    </Link>
                    <div className="vbody">
                      <div className="rental-card-head">
                        {r.vehicle_type && <span className="rental-type-pill">{r.vehicle_type}</span>}
                        <h4 className="rental-title">
                          <Link to="/rentals/$id" params={{ id: r.id }} className="rental-title-link">
                            {r.name}
                          </Link>
                        </h4>
                      </div>
                      <div className="rental-rate">
                        <span>Daily rental</span>
                        <strong>GHS {Number(r.daily_rate).toFixed(2)}</strong>
                      </div>
                      <div className="vmeta">
                        {r.seats && <span>👤 {r.seats} seats</span>}
                        {r.transmission && <span>⚙️ {r.transmission}</span>}
                        {r.fuel && <span>⛽ {r.fuel}</span>}
                      </div>
                      <div className="vactions">
                        <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => openRental(r.id)}>Book Now</button>
                      </div>
                    </div>
                  </div>
                ))
              : rentalsLoading ? (
                <p className="ga-muted" style={{ gridColumn: "1 / -1", textAlign: "center", color: "rgba(255,255,255,.86)" }}>Loading rental cars…</p>
                ) : rentalsFallback.map((r) => (
                  <div key={r.name} className="vcard rental-card">
                    <div className="vimg"><img src={r.img} alt={r.name} /></div>
                    <div className="vbody">
                      <div className="rental-card-head">
                        <span className="rental-type-pill">Rental Car</span>
                        <h4 className="rental-title">{r.name}</h4>
                      </div>
                      <div className="rental-rate">
                        <span>Daily rental</span>
                        <strong>{r.price.replace(" / day", "")}</strong>
                      </div>
                      <div className="vmeta"><span>👤 {r.seats}</span><span>⚙️ {r.trans}</span><span>⛽ {r.fuel}</span></div>
                      <div className="vactions">
                        <a className="btn btn-primary" style={{ width: "100%", textAlign: "center" }} href="#quote">Book this rental</a>
                      </div>
                    </div>
                  </div>
                )))}
          </div>
        </div>
      </section>

      {/* REPAIRS */}
      <section className="section" id="repairs" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Auto Repairs &amp; Diagnostics</div>
            <h2>Certified technicians. Transparent pricing.</h2>
          </div>
          <div className="repair-grid">
            {[
              ["🛢️", "Oil Change", "Synthetic & conventional options."],
              ["🔧", "Engine Repair", "Full diagnostics included."],
              ["🛑", "Brake Repair", "Pads, rotors & calipers."],
              ["❄️", "AC Repair", "Regas & compressor service."],
              ["🔋", "Battery Replacement", "Free testing & installation."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="repair-card">
                <div className="service-icon">{icon}</div>
                <h4>{title}</h4>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOK A REPAIR */}
      <section className="section">
        <div className="container">
          <div className="booking">
            <div className="booking-info">
              <h3>Book a Repair</h3>
              <p>Tell us what's wrong and we'll match you with the right technician and a same-week slot.</p>
              <div className="mini-stat">
                <div className="service-icon">✅</div>
                <div>
                  <strong>Certified Mechanics</strong>
                  <br />
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Factory-trained across all major brands</span>
                </div>
              </div>
              <div className="mini-stat">
                <div className="service-icon">⏱️</div>
                <div>
                  <strong>Fast Turnaround</strong>
                  <br />
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Most jobs done within 24 hours</span>
                </div>
              </div>
            </div>
            <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label>Vehicle Type</label>
                <select><option>SUV</option><option>Sedan</option><option>Pickup</option></select>
              </div>
              <div>
                <label>Service</label>
                <select><option>Oil Change</option><option>Brake Repair</option><option>Diagnostics</option></select>
              </div>
              <div><label>Preferred Date</label><input type="date" /></div>
              <div><label>Preferred Time</label><input type="time" /></div>
              <div className="full"><label>Location</label><input type="text" placeholder="e.g. East Legon, Accra" /></div>
              <div className="full"><label>Description</label><textarea rows={3} placeholder="Briefly describe the issue" /></div>
              <div className="full"><a className="btn btn-primary" style={{ width: "100%" }}>Book Appointment</a></div>
            </form>
          </div>
        </div>
      </section>

      {/* IMPORT FROM CANADA */}
      <section className="band" id="import">
        <div className="band-bg">
          <img src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=2000&q=80" alt="" />
        </div>
        <div
          className="band-overlay"
          style={{ background: "linear-gradient(100deg, rgba(6,95,70,.95) 25%, rgba(6,95,70,.6) 65%, rgba(6,95,70,.25) 100%)" }}
        />
        <div className="band-content">
          <div className="eyebrow">🇨🇦 Import From Canada</div>
          <h2>Import your dream vehicle from Canada</h2>
          <p className="lead">We source, inspect, purchase, ship and deliver vehicles directly from Canada to Ghana — start to finish.</p>
          <div className="timeline">
            {["Choose Vehicle", "Inspection", "Purchase", "Shipping", "Arrival", "Customs", "Delivery"].map((t, i) => (
              <div key={t} className="step">
                <div className="num">{i + 1}</div>
                <h5>{t}</h5>
              </div>
            ))}
          </div>
          <a className="btn btn-primary" style={{ marginTop: 44 }}>Request a Vehicle →</a>
        </div>
      </section>

      {/* CLEARING & FORWARDING */}
      <section className="band" id="clearing">
        <div className="band-bg">
          <img src={clearingImg.url} alt="" />
        </div>
        <div
          className="band-overlay"
          style={{ background: "linear-gradient(100deg, rgba(8,34,26,.92) 30%, rgba(8,34,26,.78) 70%, rgba(8,34,26,.6) 100%)" }}
        />
        <div className="band-content">
          <div className="eyebrow">Clearing &amp; Forwarding</div>
          <h2>Port to doorstep, fully handled</h2>
          <p className="lead">Full customs clearance, documentation and delivery — so your shipment moves without delays.</p>
          <div className="checklist">
            {["Vehicle Clearing", "Customs Documentation", "Import Duty Support", "Inspection Assistance", "Fast Delivery", "Doorstep Delivery", "Shipment Tracking"].map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
          <a className="btn btn-primary" style={{ marginTop: 36 }}>Start Clearing →</a>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Why Ghanada Autos</div>
            <h2>Built on trust, backed by expertise</h2>
          </div>
          <div className="why-grid">
            {[
              ["🏆", "Trusted Experts", "A decade in Ghana's automotive market."],
              ["💰", "Affordable Prices", "Transparent, competitive pricing."],
              ["✅", "Quality Vehicles", "Every car inspected before listing."],
              ["🎓", "Certified Mechanics", "Factory-trained technical teams."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="why-card">
                <div className="service-icon">{icon}</div>
                <h4>{title}</h4>
                <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 8 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">How It Works</div>
            <h2>From browsing to driving</h2>
          </div>
          <div className="steps-row">
            {[
              ["01", "Choose", "Browse cars, rentals or services online."],
              ["02", "Book", "Reserve a vehicle or schedule a repair."],
              ["03", "Confirm", "We confirm details and financing if needed."],
              ["04", "Drive", "Pick up your vehicle or get it delivered."],
            ].map(([n, t, d]) => (
              <div key={n} className="step-box">
                <div className="big-num">{n}</div>
                <h4>{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCE */}
      <section className="section">
        <div className="container">
          <div className="finance-section">
            <div>
              <div className="eyebrow" style={{ color: "#8fe9c2" }}>Finance</div>
              <h2>Own it sooner with flexible financing</h2>
              <div className="finance-list">
                <div>Vehicle Financing</div>
                <div>Insurance Packages</div>
                <div>Installment Plans</div>
                <div>Loan Assistance</div>
              </div>
            </div>
            <div className="calc-card">
              <label>Vehicle Price (GH₵)</label>
              <input type="text" defaultValue="385,000" />
              <div style={{ height: 14 }} />
              <label>Down Payment (%)</label>
              <input type="text" defaultValue="20%" />
              <div style={{ height: 14 }} />
              <label>Loan Term</label>
              <select>
                <option>12 months</option>
                <option>24 months</option>
                <option>36 months</option>
              </select>
              <div className="calc-row">
                <span>Estimated Monthly</span>
                <span>GH₵ 12,850</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head" style={{ margin: "0 auto 56px", textAlign: "center", maxWidth: 600 }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Testimonials</div>
            <h2>What our customers say</h2>
          </div>
          <div className="test-grid">
            {[
              { q: "Ghanada Autos handled my import from Canada end-to-end. The car arrived exactly as inspected.", name: "Kwame Boateng", city: "Accra", img: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=100&q=80" },
              { q: "Fast, honest repair service. They diagnosed the issue same-day and had me back on the road quickly.", name: "Ama Serwaa", city: "Kumasi", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80" },
              { q: "Rented an SUV for a week-long business trip — clean car, smooth pickup, no hidden fees.", name: "David Owusu", city: "Tema", img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=100&q=80" },
            ].map((t) => (
              <div key={t.name} className="test-card">
                <div className="test-stars">★★★★★</div>
                <p>"{t.q}"</p>
                <div className="test-user">
                  <img src={t.img} alt={t.name} />
                  <div>
                    <h5>{t.name}</h5>
                    <span>{t.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="section">
        <div className="container">
          <div className="section-head" style={{ position: "relative" }}>
            <div className="eyebrow">Latest From The Blog</div>
            <h2>Automotive tips &amp; guides</h2>
          </div>
          <div className="ga-blog-grid">
            {blogPosts.map((b) => (
              <Link key={b.slug} to="/blog/$slug" params={{ slug: b.slug }} className="ga-blog-card">
                <div className="ga-blog-card-media">
                  <img src={b.img} alt={b.title} loading="lazy" />
                  <span className="badge badge-green ga-blog-card-tag">{b.tag}</span>
                </div>
                <div className="ga-blog-card-body">
                  <h3>{b.title}</h3>
                  <p>{b.excerpt}</p>
                  <div className="ga-blog-meta">
                    <span>{b.date}</span>
                    <span>·</span>
                    <span>{b.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link to="/blog" className="btn btn-primary">View all articles</Link>
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="section" style={{ background: "#fff", padding: "60px 0" }}>
        <div className="container">
          <div className="brand-row">
            {["TOYOTA", "HONDA", "BMW", "MERCEDES-BENZ", "FORD", "NISSAN", "HYUNDAI", "LEXUS", "MAZDA", "KIA"].map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section" id="contact">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Get In Touch</div>
            <h2>We're here to help</h2>
          </div>
          <div className="contact-grid">
            <div className="contact-info-card">
              <div className="map-fake" />
              <div className="contact-details">
                {[
                  ["📍", "Locations", "Toronto, Canada · Takoradi, Ghana"],
                  ["🇨🇦", "Canada", "+1 437 436 4357"],
                  ["🇬🇭", "Ghana", "+233 547 464 093"],
                  ["💬", "WhatsApp", "+1 437 436 4357"],
                  ["🕒", "Business Hours", "Mon – Sat, 8:00am – 6:00pm"],
                ].map(([icon, title, val]) => (
                  <div key={title} className="contact-row">
                    <div className="service-icon">{icon}</div>
                    <div>
                      <h5>{title}</h5>
                      <p>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact-form">
              <div className="form-grid">
                <div><label>Full Name</label><input type="text" placeholder="Your name" /></div>
                <div><label>Phone</label><input type="text" placeholder="Your phone number" /></div>
                <div className="full"><label>Email</label><input type="email" placeholder="you@email.com" /></div>
                <div className="full"><label>Message</label><textarea rows={5} placeholder="How can we help?" /></div>
                <div className="full"><a className="btn btn-primary" style={{ width: "100%" }}>Send Message</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="logo">
                <img src={logoTransparentAsset.url} alt="Ghanada Autos" className="logo-img footer-logo-img" />
              </div>
              <p>Ghana &amp; Canada's complete automotive company — sales, rentals, repairs, parts, import &amp; logistics under one roof.</p>
              <div className="social-row">
                <div>f</div>
                <div>ig</div>
                <div>in</div>
                <div>tw</div>
              </div>
            </div>
            <div>
              <h4>Quick Links</h4>
              <div className="footer-links">
                <a href="#">Home</a><a href="#">Cars</a><a href="#">Rentals</a><a href="#">About</a><a href="#">Contact</a>
              </div>
            </div>
            <div>
              <h4>Services</h4>
              <div className="footer-links">
                <a href="#">Repairs</a><a href="#">Spare Parts</a><a href="#">Import From Canada</a><a href="#">Clearing &amp; Forwarding</a>
              </div>
            </div>
            <div>
              <h4>Support</h4>
              <div className="footer-links">
                <a href="#">FAQs</a><a href="#">Track Shipment</a><a href="#">Financing</a><a href="#">Contact Support</a>
              </div>
            </div>
            <div>
              <h4>Newsletter</h4>
              <p>Get vehicle drops and import updates.</p>
              <div className="newsletter-input">
                <input type="email" placeholder="Email address" />
                <button>Join</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Ghanada Autos. All rights reserved.</span>
            <div className="payment-icons">
              <span>VISA</span>
              <span>MTN MoMo</span>
              <span>Vodafone Cash</span>
            </div>
            <span>Designed by Tech Oasis Ltd</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
