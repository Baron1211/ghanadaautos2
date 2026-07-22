import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoAsset from "@/assets/ghanada-logo.png.asset.json";
import logoTransparentAsset from "@/assets/ghanada-logo-transparent.png.asset.json";
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

  const { data: dbParts } = useQuery({
    queryKey: ["home-parts"],
    queryFn: async () => {
      const { data } = await supabase.from("parts").select("*").eq("active", true).limit(8);
      return data || [];
    },
  });
  const { data: dbRentals } = useQuery({
    queryKey: ["home-rentals"],
    queryFn: async () => {
      const { data } = await supabase.from("rentals").select("*").eq("active", true).limit(8);
      return data || [];
    },
  });

  const openPart = (id: string) => navigate({ to: "/parts/$id", params: { id } });
  const openRental = (id: string) => navigate({ to: "/rentals/$id", params: { id } });

  return (
    <div className="ga">
      {/* HEADER */}
      <header>
        <div className="nav-wrap">
          <div className="logo">
            <img src={logoAsset.url} alt="Ghanada Autos" className="logo-img" />
          </div>
          <nav className="main-links">
            <a href="#">Home</a>
            <a href="#cars">Cars</a>
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
                <a href="#rentals">Rentals</a>
                <a href="#repairs">Repairs</a>
                <a href="#parts">Spare Parts</a>
                <a href="#import">Import From Canada</a>
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
          <a href="#" onClick={closeMenu}>Home</a>
          <a href="#cars" onClick={closeMenu}>Cars</a>
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
              <a href="#rentals" className="mobile-sub" onClick={closeMenu}>Rentals</a>
              <a href="#repairs" className="mobile-sub" onClick={closeMenu}>Repairs</a>
              <a href="#parts" className="mobile-sub" onClick={closeMenu}>Spare Parts</a>
              <a href="#import" className="mobile-sub" onClick={closeMenu}>Import From Canada</a>
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
        <div className="hero-content">
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
            <a href="#cars" className="btn btn-primary">
              Browse Cars →
            </a>
            <a href="#repairs" className="btn btn-outline">
              Book a Repair
            </a>
          </div>
          <div className="hero-stats">
            <div><strong>10+</strong><span>Years Experience</span></div>
            <div><strong>500+</strong><span>Cars Sold</span></div>
            <div><strong>2,500+</strong><span>Satisfied Customers</span></div>
            <div><strong>24/7</strong><span>Customer Support</span></div>
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
          <div className="filter-tabs">
            {["All", "SUV", "Sedan", "Luxury", "Pickup", "Electric", "Commercial"].map((t, i) => (
              <button key={t} className={i === 0 ? "active" : ""}>{t}</button>
            ))}
          </div>
          <div className="vehicle-grid">
            {vehicles.map((v) => (
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
                    <span>📅 {v.year}</span>
                    <span>🛣️ {v.miles}</span>
                    <span>⛽ {v.fuel}</span>
                    <span>⚙️ {v.trans}</span>
                  </div>
                  <div className="vactions">
                    <a className="btn btn-ghost">View Details</a>
                    <a className="btn btn-primary">Reserve</a>
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
                    <div className="pimg"><img src={p.image_url || partsFallback[0].img} alt={p.name} /></div>
                    <div className="part-body">
                      <h5>{p.name}</h5>
                      <div className="stars">★★★★★</div>
                      <div className="part-price">CAD {Number(p.price).toFixed(2)}</div>
                      <button className="add-cart" onClick={() => openPart(p.id)}>View & Buy</button>
                    </div>
                  </div>
                ))
              : partsFallback.map((p) => (
                  <div key={p.name} className="part-card">
                    <div className="pimg"><img src={p.img} alt={p.name} /></div>
                    <div className="part-body">
                      <h5>{p.name}</h5>
                      <div className="stars">{p.stars}</div>
                      <div className="part-price">{p.price}</div>
                      <button className="add-cart" onClick={() => toast("Live parts coming soon — admin can add them")}>Add to Cart</button>
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
                  <div key={r.id} className="vcard" style={{ background: "rgba(255,255,255,.97)" }}>
                    <div className="vimg"><img src={r.image_url || rentalsFallback[0].img} alt={r.name} /></div>
                    <div className="vbody">
                      <h4>{r.name}</h4>
                      <div className="vprice">CAD {Number(r.daily_rate).toFixed(2)} / day</div>
                      <div className="vmeta"><span>{r.vehicle_type || "Vehicle"}</span></div>
                      <div className="vactions">
                        <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => openRental(r.id)}>Book Now</button>
                      </div>
                    </div>
                  </div>
                ))
              : rentalsFallback.map((r) => (
                  <div key={r.name} className="vcard" style={{ background: "rgba(255,255,255,.97)" }}>
                    <div className="vimg"><img src={r.img} alt={r.name} /></div>
                    <div className="vbody">
                      <h4>{r.name}</h4>
                      <div className="vprice">{r.price}</div>
                      <div className="vmeta"><span>👤 {r.seats}</span><span>⚙️ {r.trans}</span><span>⛽ {r.fuel}</span></div>
                      <div className="vactions">
                        <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => toast("Live rentals coming soon — admin can add them")}>Book Now</button>
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
          <div className="section-head">
            <div className="eyebrow">Latest From The Blog</div>
            <h2>Automotive tips &amp; guides</h2>
          </div>
          <div className="blog-grid">
            {[
              { tag: "Import Tips", title: "5 things to check before importing a car from Canada", date: "July 12, 2026", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80" },
              { tag: "Maintenance", title: "How often should you really change your oil?", date: "July 5, 2026", img: "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e70?auto=format&fit=crop&w=500&q=80" },
              { tag: "Buying Advice", title: "New vs. certified pre-owned: what fits your budget?", date: "June 28, 2026", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80" },
            ].map((b) => (
              <div key={b.title} className="blog-card">
                <img src={b.img} alt={b.title} />
                <div className="blog-body">
                  <span className="badge badge-green">{b.tag}</span>
                  <h4>{b.title}</h4>
                  <span className="date">{b.date}</span>
                </div>
              </div>
            ))}
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
              <div className="footer-contact">
                <div><strong>Toronto, Canada</strong><br />+1 437 436 4357</div>
                <div><strong>Takoradi, Ghana</strong><br />+233 547 464 093</div>
                <div><strong>WhatsApp</strong><br />+1 437 436 4357</div>
              </div>
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
