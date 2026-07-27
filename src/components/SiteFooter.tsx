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
              <div>f</div>
              <div>ig</div>
              <div>in</div>
              <div>tw</div>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="/">Home</a><a href="/cars">Cars</a><a href="/rentals">Rentals</a><a href="/#about">About</a><a href="/#contact">Contact</a>
            </div>
          </div>
          <div>
            <h4>Services</h4>
            <div className="footer-links">
              <a href="/repairs">Repairs</a><a href="/parts">Spare Parts</a><a href="/import">Import From Canada</a><a href="/import">Clearing &amp; Forwarding</a>
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
  );
}