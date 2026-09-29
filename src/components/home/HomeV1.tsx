import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addToCart } from "@/lib/cart";
import { vehicleSlug } from "@/lib/slug";
import { toast } from "sonner";
import logoAsset from "@/assets/rrr-logo.jpg";
import logoTransparentAsset from "@/assets/rrr-logo-stacked.png";
import { blogPosts } from "@/lib/blog";
import DualPrice from "@/components/DualPrice";
import WhatsAppChat from "@/components/WhatsAppChat";
import SiteHeader from "@/components/SiteHeader";
import { useContent } from "@/lib/cms";

import engineImg from "@/assets/parts/engine.jpg";
import brakeImg from "@/assets/parts/brake.jpg";
import tyreImg from "@/assets/parts/tyre.jpg";
import batteryImg from "@/assets/parts/battery.jpg";
import headlightImg from "@/assets/parts/headlight.jpg";

import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

export default function HomeV1() {
  return <RRRHome />;
}

const vehicles = [
  { name: "Toyota Highlander XLE", price: "GH₵ 385,000", year: "2022", miles: "18,400 mi", fuel: "Petrol", trans: "Automatic", finance: true, img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80" },
  { name: "Mercedes-Benz C300", price: "GH₵ 512,000", year: "2023", miles: "9,200 mi", fuel: "Petrol", trans: "Automatic", finance: true, img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80" },
  { name: "Ford F-150 XLT", price: "GH₵ 440,000", year: "2021", miles: "27,600 mi", fuel: "Diesel", trans: "Automatic", finance: false, img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80" },
  { name: "BMW X5 xDrive40i", price: "GH₵ 645,000", year: "2023", miles: "6,100 mi", fuel: "Petrol", trans: "Automatic", finance: true, img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80" },
];

const partsFallback = [
  { name: "Engine Parts", stars: "★★★★★", price: "GH₵ 1,250", img: engineImg },
  { name: "Brake Pads", stars: "★★★★☆", price: "GH₵ 380", img: brakeImg },
  { name: "Tyres", stars: "★★★★★", price: "GH₵ 690", img: tyreImg },
  { name: "Batteries", stars: "★★★★☆", price: "GH₵ 950", img: batteryImg },
  { name: "Headlights", stars: "★★★★★", price: "GH₵ 540", img: headlightImg },
];

const rentalsFallback = [
  { name: "Economy — Toyota Corolla", price: "GH₵ 420 / day", seats: "5 Seats", trans: "Auto", fuel: "Petrol", img: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=500&q=80" },
  { name: "SUV — RAV4", price: "GH₵ 680 / day", seats: "5 Seats", trans: "Auto", fuel: "Petrol", img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=500&q=80" },
  { name: "Luxury — Mercedes E-Class", price: "GH₵ 1,250 / day", seats: "5 Seats", trans: "Auto", fuel: "Petrol", img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=500&q=80" },
  { name: "Van — Hiace", price: "GH₵ 950 / day", seats: "12 Seats", trans: "Manual", fuel: "Diesel", img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=500&q=80" },
];

function RRRHome() {
  const hero = useContent("home_hero");
  const sec = useContent("home_sections");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [trackNo, setTrackNo] = useState("");
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
      <SiteHeader />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-glow" aria-hidden />
        <div className="hero-content hero-split">
          <div className="hero-copy">
          <div className="eyebrow">{hero("eyebrow")}</div>
          <h1>
            {hero("title_line1")}
            <br />
            {hero("title_line2")}
          </h1>
          <div className="sub">
            <span>Buy Cars</span>
            <span>Rent Cars</span>
            <span>Repair Vehicles</span>
            <span>Genuine Spare Parts</span>
            <span>Import From China</span>
            <span>Clearing &amp; Forwarding</span>
          </div>
          <div className="hero-actions">
            <Link to="/cars" className="btn btn-primary">{hero("cta_label")}</Link>
            <Link to="/track" search={{ number: "" }} className="btn btn-outline ga-hero-track-btn">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l3-1.72" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /><circle cx="18" cy="18" r="3" /><path d="m20.2 20.2 1.8 1.8" /></svg>
              Track Your Item
            </Link>
          </div>

          <div className="hero-stats">
            <div><strong>{hero("stat1_value")}</strong><span>{hero("stat1_label")}</span></div>
            <div><strong>{hero("stat2_value")}</strong><span>{hero("stat2_label")}</span></div>
            <div><strong>{hero("stat3_value")}</strong><span>{hero("stat3_label")}</span></div>
            <div><strong>{hero("stat4_value")}</strong><span>{hero("stat4_label")}</span></div>
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
            <div className="hero-dots">
              {slides.map((s, i) => (
                <button key={"d" + i} className={i === slide ? "active" : ""} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRACK STRIP */}
      <section className="ga-track-strip">
        <div className="container">
          <div className="ga-track-strip-card">
            <div className="ga-track-strip-copy">
              <span className="ga-track-strip-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l3-1.72" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /><circle cx="18" cy="18" r="3" /><path d="m20.2 20.2 1.8 1.8" /></svg>
              </span>
              <div>
                <strong>Track your item</strong>
                <span>Live status, location and updates from China to Ghana.</span>
              </div>
            </div>
            <form
              className="ga-track-strip-form"
              onSubmit={(e) => { e.preventDefault(); navigate({ to: "/track", search: { number: trackNo.trim() } }); }}
            >
              <input
                value={trackNo}
                onChange={(e) => setTrackNo(e.target.value)}
                placeholder="Tracking number e.g. GA-8F3K21AB"
                aria-label="Tracking number"
              />
              <button className="btn btn-primary" type="submit">Track</button>
            </form>
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
            <div className="eyebrow">{sec("services_eyebrow")}</div>
            <h2>{sec("services_title")}</h2>
            <p>From the showroom floor to the port of Tema — sales, rentals, repairs, parts and logistics, all under one roof.</p>
          </div>
          <div className="services-grid">
            {([
              ["🚗", "Car Sales", "New & certified pre-owned vehicles.", "/cars"],
              ["🔑", "Car Rentals", "Daily, weekly & monthly fleets.", "/rentals"],
              ["🛠️", "Repairs", "Certified technicians, honest pricing.", "/repairs"],
              ["⚙️", "Spare Parts", "Genuine parts, all major brands.", "/parts"],
              ["🚢", "Import From China", "Sourced, inspected & shipped for you.", "/import"],
              ["📦", "Track Shipment", "Check status, location and delivery updates.", "/track"],
            ] as const).map(([icon, title, desc, to]) => (
              <Link key={title} to={to} className="service-card">
                <div className="service-icon">{icon}</div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="section" id="cars" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">{sec("vehicles_eyebrow")}</div>
            <h2>{sec("vehicles_title")}</h2>
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
                   <div className="vprice"><DualPrice ghs={v.price} cad={v.price_cad} size="md" /></div>
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
                    <Link to="/cars" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>Browse cars</Link>
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
            <div className="eyebrow">{sec("parts_eyebrow")}</div>
            <h2>{sec("parts_title")}</h2>
          </div>
          <div className="parts-grid">
            {(dbParts && dbParts.length > 0
              ? dbParts.map((p: any) => (
                  <div key={p.id} className="part-card">
                    <div className="pimg" onClick={() => openPart(p.id)} style={{ cursor: "pointer" }}>
                      <span className="part-badge">Genuine</span>
                      <img src={p.image_url || partsFallback[0].img} alt={p.name} />
                    </div>
                    <div className="part-body">
                      <h5 className="part-title"><Link to="/parts/$id" params={{ id: p.id }} className="ga-link-plain">{p.name}</Link></h5>
                      <div className="part-rate">
                        <span className="stars">★★★★★</span>
                        <span className="part-instock">In stock</span>
                      </div>
                      <div className="part-price"><DualPrice ghs={p.price} cad={p.price_cad} size="sm" decimals={2} /></div>
                      <div className="part-actions">
                        <button className="part-add" onClick={() => quickAddPart(p, false)} aria-label="Add to cart" title="Add to cart">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
                            <path d="M2 3h2.2l2.6 12.2h11.4L21 7H6" />
                          </svg>
                        </button>
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
                      <Link to="/parts" className="add-cart">Browse parts</Link>
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
          <div className="eyebrow">{sec("rentals_eyebrow")}</div>
          <h2>{sec("rentals_title")}</h2>
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
                         <DualPrice ghs={r.daily_rate} cad={r.daily_rate_cad} size="sm" decimals={2} suffix="/ day" />
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
                        <Link to="/rentals" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>Browse rentals</Link>
                      </div>
                    </div>
                  </div>
                )))}
          </div>
        </div>
      </section>


      {/* IMPORT FROM CHINA */}
      <section className="band" id="import">
        <div className="band-bg">
          <img src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=2000&q=80" alt="" />
        </div>
        <div
          className="band-overlay"
          style={{ background: "linear-gradient(100deg, rgba(6,95,70,.95) 25%, rgba(6,95,70,.6) 65%, rgba(6,95,70,.25) 100%)" }}
        />
        <div className="band-content">
          <div className="eyebrow">{sec("import_eyebrow")}</div>
          <h2>{sec("import_title")}</h2>
          <p className="lead">We source, inspect, purchase, ship and deliver vehicles directly from China to Ghana — start to finish.</p>
          <div className="timeline">
            {["Choose Vehicle", "Inspection", "Purchase", "Shipping", "Arrival", "Customs", "Delivery"].map((t, i) => (
              <div key={t} className="step">
                <div className="num">{i + 1}</div>
                <h5>{t}</h5>
              </div>
            ))}
          </div>
          <Link to="/import" className="btn btn-primary" style={{ marginTop: 44 }}>Request a Vehicle →</Link>
        </div>
      </section>

      {/* TRACKING */}
      <section className="ga-track-home">
        <div className="container">
          <div className="ga-track-home-card">
            <div>
              <div className="eyebrow">Shipment Tracking</div>
              <h2>Track your order from China to Ghana</h2>
              <p>Use the tracking number from your invoice or update message to view the latest status, current location, ETA and shipment timeline.</p>
            </div>
            <Link to="/track" search={{ number: "" }} className="btn btn-primary">Track My Order →</Link>
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
              { q: "RRR Auto Export handled my import from China end-to-end. The car arrived exactly as inspected.", name: "Kwame Boateng", city: "Accra", img: testimonial1 },
              { q: "Fast, honest repair service. They diagnosed the issue same-day and had me back on the road quickly.", name: "Ama Serwaa", city: "Kumasi", img: testimonial2 },
              { q: "Rented an SUV for a week-long business trip — clean car, smooth pickup, no hidden fees.", name: "David Owusu", city: "Tema", img: testimonial3 },
            ].map((t) => (
              <div key={t.name} className="test-card">
                <div className="test-stars">★★★★★</div>
                <p>"{t.q}"</p>
                <div className="test-user">
                  <img src={t.img} alt={t.name} loading="lazy" width={512} height={512} />
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
                  ["📍", "Locations", "Guangzhou, China · Takoradi, Ghana"],
                  ["🇨🇳", "China", "+233 592 495 787"],
                  ["🇬🇭", "Ghana", "+233 592 495 787"],
                  ["💬", "WhatsApp", "+233 592 495 787"],
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
                <div className="full"><Link to="/support" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>Send Message</Link></div>
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
                <img src={logoTransparentAsset} alt="RRR Auto Export" className="logo-img footer-logo-img" />
              </div>
              <p>Ghana &amp; China's complete automotive company — sales, rentals, repairs, parts, import &amp; logistics under one roof.</p>
              <div className="social-row">
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

            </div>
            <div>
              <h4>Quick Links</h4>
              <div className="footer-links">
                <Link to="/">Home</Link><Link to="/cars">Cars</Link><Link to="/rentals">Rentals</Link><Link to="/import">About</Link><Link to="/" hash="contact">Contact</Link>
              </div>
            </div>
            <div>
              <h4>Services</h4>
              <div className="footer-links">
                <Link to="/repairs">Repairs</Link><Link to="/parts">Spare Parts</Link><Link to="/import">Import From China</Link><Link to="/import">Clearing &amp; Forwarding</Link>
              </div>
            </div>
            <div>
              <h4>Support</h4>
              <div className="footer-links">
                <Link to="/faq">FAQs</Link><Link to="/track" search={{ number: "" }}>Track Shipment</Link><Link to="/cars">Financing</Link><Link to="/support">Contact Support</Link>
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
            <span>© 2026 RRR Auto Export. All rights reserved.</span>
            <div className="payment-icons">
              <span>VISA</span>
              <span>MTN MoMo</span>
              <span>Vodafone Cash</span>
            </div>
            <span>Designed by Tech Oasis Ltd</span>
          </div>
        </div>
      </footer>
      <WhatsAppChat />
    </div>
  );
}
