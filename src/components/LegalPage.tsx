import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export type LegalBlock = string | { sub: string } | { list: string[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string[];
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function LegalPage({ eyebrow, title, intro, effectiveDate, lastUpdated, sections }: LegalPageProps) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const ids = sections.map((s) => slugify(s.title));
    const onScroll = () => {
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <div className="ga">
      <SiteHeader />

      <section className="legal-hero">
        <div className="container">
          <div className="legal-crumbs">
            <Link to="/">Home</Link> <span>/</span> <span>{title}</span>
          </div>
          <div className="eyebrow legal-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <div className="legal-dates">
            <span><strong>Effective date</strong> {effectiveDate}</span>
            <span><strong>Last updated</strong> {lastUpdated}</span>
          </div>
        </div>
      </section>

      <section className="section legal-body">
        <div className="container legal-grid">
          <aside className="legal-toc">
            <h4>On this page</h4>
            <nav>
              {sections.map((s, i) => {
                const id = slugify(s.title);
                return (
                  <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""}>
                    <span className="legal-toc-num">{i + 1}</span>
                    {s.title}
                  </a>
                );
              })}
            </nav>
          </aside>

          <article className="legal-article">
            <div className="legal-intro">
              {intro.map((p) => <p key={p}>{p}</p>)}
            </div>

            {sections.map((s, i) => {
              const id = slugify(s.title);
              return (
                <section key={id} id={id} className="legal-section">
                  <h2><span className="legal-num">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
                  {s.blocks.map((b, bi) => {
                    if (typeof b === "string") return <p key={bi}>{b}</p>;
                    if ("sub" in b) return <h3 key={bi}>{b.sub}</h3>;
                    return (
                      <ul key={bi}>
                        {b.list.map((li) => <li key={li}>{li}</li>)}
                      </ul>
                    );
                  })}
                </section>
              );
            })}

            <div className="legal-contact-card">
              <h3>RRR Auto Export</h3>
              <div className="legal-contact-grid">
                <div><span>Website</span><a href="https://www.ghanadaautos.com">www.ghanadaautos.com</a></div>
                <div><span>Ghana</span><a href="tel:+233592495787">+233 592 495 787</a></div>
                <div><span>China</span><a href="tel:+233592495787">+233 592 495 787</a></div>
                <div><span>WhatsApp</span><a href="https://wa.me/233592495787" target="_blank" rel="noopener noreferrer">+233 592 495 787</a></div>
                <div><span>Email</span><a href="mailto:netwekusa@gmail.com">netwekusa@gmail.com</a></div>
                <div><span>Locations</span><p>Takoradi, Ghana &amp; Guangzhou, China</p></div>
              </div>
              <div className="legal-links">
                <Link to="/terms">Terms &amp; Conditions</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/shipping-policy">Shipping &amp; Import Policy</Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
