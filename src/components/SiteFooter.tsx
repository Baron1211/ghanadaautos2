import { Link } from "@tanstack/react-router";
import logoTransparentAsset from "@/assets/rrr-logo-stacked-light.png";

export default function SiteFooter() {
  return (
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
              <Link to="/faq">FAQs</Link><Link to="/track" search={{ number: "" }}>Track Shipment</Link><Link to="/cars">Financing</Link><Link to="/support">Contact Support</Link><Link to="/terms">Terms &amp; Conditions</Link><Link to="/privacy">Privacy Policy</Link><Link to="/shipping-policy">Shipping &amp; Import Policy</Link>
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
  );
}