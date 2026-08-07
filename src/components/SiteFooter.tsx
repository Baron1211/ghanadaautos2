import { Link } from "@tanstack/react-router";
import logoTransparentAsset from "@/assets/ghanada-logo-transparent.png.asset.json";

export default function SiteFooter() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo">
              <img src={logoTransparentAsset.url} alt="Ghanada Autos" className="logo-img footer-logo-img" />
            </div>
            <p>Ghana &amp; Canada's complete automotive company — sales, rentals, repairs, parts, import &amp; logistics under one roof.</p>
            <div className="social-row">
              <a href="https://www.facebook.com/share/189pSzrWyD/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
              <a href="https://www.instagram.com/ghanada_autos?igsh=ejBzdW10N2c0MWh2" target="_blank" rel="noopener noreferrer" aria-label="Instagram">ig</a>
              <a href="https://www.tiktok.com/@ghanada.autos?_r=1&amp;_t=ZS-98SpAjVdzT3" target="_blank" rel="noopener noreferrer" aria-label="TikTok">tt</a>
              <a href="https://wa.me/14374364357" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">wa</a>
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
              <Link to="/repairs">Repairs</Link><Link to="/parts">Spare Parts</Link><Link to="/import">Import From Canada</Link><Link to="/import">Clearing &amp; Forwarding</Link>
            </div>
          </div>
          <div>
            <h4>Support</h4>
            <div className="footer-links">
              <Link to="/faq">FAQs</Link><Link to="/support" hash="track">Track Shipment</Link><Link to="/cars">Financing</Link><Link to="/support">Contact Support</Link>
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
  );
}