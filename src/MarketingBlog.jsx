import { BLOG_POSTS } from "./blogData";

const GOLD = "#c9a84c";
const DARK = "#0d1f3c";
const DARK2 = "#0f2440";
const FONT = "'DM Sans','Segoe UI',sans-serif";
const FONT_DISPLAY = "'Playfair Display',Georgia,serif";

function Nav() {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,31,60,0.97)", backdropFilter: "blur(10px)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ fontSize: 24 }}>🏨</span>
        <span style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19 }}>HotelPro</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <a href="/blog" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Blog</a>
        <a href="/pricing" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Tarifs</a>
        <a href="/app" style={{ background: GOLD, color: "#0a0a0a", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Essai gratuit</a>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#0a1830", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
        © {new Date().getFullYear()} HotelPro — Tous droits réservés.
      </div>
    </footer>
  );
}

function CTABox() {
  return (
    <div style={{ background: DARK, borderRadius: 16, padding: "32px 28px", textAlign: "center", margin: "36px 0" }}>
      <div style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
        Essayez HotelPro gratuitement
      </div>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 20 }}>
        14 jours d'essai · Sans carte bancaire · Mise en route en 10 minutes
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/app" style={{ background: GOLD, color: "#0a0a0a", padding: "13px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
          Essai gratuit
        </a>
        <a href="/contact" style={{ background: "transparent", color: "#fff", padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.25)", textDecoration: "none" }}>
          Demander une démo
        </a>
      </div>
    </div>
  );
}

function BlogListPage() {
  return (
    <div style={{ fontFamily: FONT, background: "#fafbff", color: "#0f172a", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .blog-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(13,31,60,0.1)}
        .blog-card{transition:all .2s;text-decoration:none}
      `}</style>
      <Nav />
      <section style={{ background: `linear-gradient(160deg,${DARK} 0%,${DARK2} 100%)`, padding: "60px 24px 50px", textAlign: "center" }}>
        <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>BLOG HOTELPRO</div>
        <h1 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4.5vw,42px)", fontWeight: 700, marginBottom: 14 }}>
          Conseils de gestion hôtelière
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
          Guides pratiques pour gérer votre hôtel, riad ou maison d'hôtes plus efficacement.
        </p>
      </section>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ display: "grid", gap: 20 }}>
          {BLOG_POSTS.map((p) => (
            <a key={p.slug} href={`/blog/${p.slug}`} className="blog-card" style={{ background: "#fff", border: "1px solid #eef1f6", borderRadius: 16, padding: 28, color: "inherit" }}>
              <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>{p.category.toUpperCase()}</div>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 10 }}>{p.title}</h2>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{p.intro.slice(0, 140)}…</p>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>{p.readTime} de lecture</div>
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function BlogPostPage({ slug }) {
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div style={{ fontFamily: FONT, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Nav />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: DARK, marginBottom: 12 }}>Article introuvable</h1>
            <a href="/blog" style={{ color: GOLD, fontWeight: 600 }}>← Retour au blog</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, background: "#fafbff", color: "#0f172a", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <Nav />
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 16 }}>{post.category.toUpperCase()}</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: DARK, lineHeight: 1.25, marginBottom: 18 }}>
          {post.title}
        </h1>
        <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 36 }}>{post.readTime} de lecture</div>

        <p style={{ fontSize: 17, lineHeight: 1.75, color: "#334155", marginBottom: 32 }}>{post.intro}</p>

        {post.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 14 }}>{s.h2}</h2>
            {s.body.split("\n").map((para, j) => (
              <p key={j} style={{ fontSize: 15.5, lineHeight: 1.75, color: "#475569", marginBottom: 10, whiteSpace: "pre-line" }}>{para}</p>
            ))}
            {s.cta && <CTABox />}
          </div>
        ))}

        {post.faq && post.faq.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 18 }}>Questions fréquentes</h2>
            {post.faq.map((f, i) => (
              <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < post.faq.length - 1 ? "1px solid #eef1f6" : "none" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: DARK, marginBottom: 6 }}>{f.q}</div>
                <div style={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.65 }}>{f.a}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #eef1f6" }}>
          <a href="/blog" style={{ color: GOLD, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>← Retour au blog</a>
        </div>
      </article>
      <Footer />
    </div>
  );
}

export default function MarketingBlog({ slug }) {
  if (slug) return <BlogPostPage slug={slug} />;
  return <BlogListPage />;
}

