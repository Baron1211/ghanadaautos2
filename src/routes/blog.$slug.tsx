import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { blogPosts, getPostBySlug } from "@/lib/blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Article — Ghanada Autos" }] };
    return {
      meta: [
        { title: `${post.title} — Ghanada Autos` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:image", content: post.img },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: post.img },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
      <h1>Article not found</h1>
      <Link to="/blog" className="ga-btn-primary">Back to blog</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
      <h1>Something went wrong</h1>
      <p className="ga-muted">{error.message}</p>
      <Link to="/blog" className="ga-btn-primary">Back to blog</Link>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  return (
    <article className="ga-blog-article">
      <div className="ga-blog-article-hero">
        <img src={post.img} alt={post.title} />
        <div className="ga-blog-article-hero-scrim" />
        <div className="container ga-blog-article-hero-body">
          <Link to="/blog" className="ga-blog-back">← Back to blog</Link>
          <span className="badge badge-green">{post.tag}</span>
          <h1>{post.title}</h1>
          <div className="ga-blog-meta ga-blog-meta-light">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      <div className="container ga-blog-article-body">
        <p className="ga-blog-lead">{post.excerpt}</p>
        {post.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}

        <div className="ga-blog-cta">
          <div>
            <h3>Talk to a Ghanada Autos advisor</h3>
            <p>Whether you're importing, buying or booking a service — our team in Toronto and Takoradi is one message away.</p>
          </div>
          <a className="ga-btn-primary" href="https://wa.me/14374364357">WhatsApp us</a>
        </div>
      </div>

      {related.length > 0 && (
        <div className="container ga-blog-related">
          <h2>Keep reading</h2>
          <div className="ga-blog-grid">
            {related.map((p) => (
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
      )}
    </article>
  );
}