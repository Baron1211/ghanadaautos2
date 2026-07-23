import { createFileRoute, Link } from "@tanstack/react-router";
import { blogPosts } from "@/lib/blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Automotive Blog — Ghanada Autos" },
      { name: "description", content: "Import tips, maintenance guides and buying advice from Ghana & Canada's complete automotive company." },
      { property: "og:title", content: "Automotive Blog — Ghanada Autos" },
      { property: "og:description", content: "Import tips, maintenance guides and buying advice from Ghanada Autos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [featured, ...rest] = blogPosts;
  return (
    <div className="ga-blog-page">
      <div className="ga-blog-hero">
        <div className="container">
          <div className="eyebrow">The Ghanada Journal</div>
          <h1>Automotive tips, guides & stories</h1>
          <p>Practical advice from our workshop, import desk and sales floor — built for drivers in Ghana and beyond.</p>
        </div>
      </div>

      <div className="container ga-blog-container">
        {featured && (
          <Link to="/blog/$slug" params={{ slug: featured.slug }} className="ga-blog-featured">
            <div className="ga-blog-featured-media">
              <img src={featured.img} alt={featured.title} loading="lazy" />
            </div>
            <div className="ga-blog-featured-body">
              <span className="badge badge-green">{featured.tag}</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <div className="ga-blog-meta">
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readTime}</span>
              </div>
              <span className="ga-blog-read">Read article →</span>
            </div>
          </Link>
        )}

        <div className="ga-blog-grid">
          {rest.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="ga-blog-card">
              <div className="ga-blog-card-media">
                <img src={p.img} alt={p.title} loading="lazy" />
                <span className="badge badge-green ga-blog-card-tag">{p.tag}</span>
              </div>
              <div className="ga-blog-card-body">
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
                <div className="ga-blog-meta">
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}