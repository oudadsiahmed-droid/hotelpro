import { BLOG_POSTS_EN } from "./blogData_en";

const GOLD = "#c9a84c";
const DARK = "#0d1f3c";
const DARK2 = "#0f2440";
const FONT = "'DM Sans','Segoe UI',sans-serif";
const FONT_DISPLAY = "'Playfair Display',Georgia,serif";

function NavEN() {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,31,60,0.97)", backdropFilter: "blur(10px)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ fontSize: 24 }}>🏨</span>
        <span style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19 }}>HotelPro</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <a href="/blog-en" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Blog</a>
        <a href="/pricing" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Pricing</a>
        <a href="/app" style={{ background: GOLD, color: "#0a0a0a", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Free trial</a>
      </div>
    </nav>
  );
}

function FooterEN() {
  return (
    <footer style={{ background: "#0a1830", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
        © {new Date().getFullYear()} HotelPro — All rights reserved.
      </div>
    </footer>
  );
}

function CTABoxEN() {
  return (
    <div style={{ background: DARK, borderRadius: 16, padding: "32px 28px", textAlign: "center", margin: "36px 0" }}>
      <div style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
        Try HotelPro for free
      </div>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 20 }}>
        14-day free trial · No credit card required · Set up in 10 minutes
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/app" style={{ background: GOLD, color: "#0a0a0a", padding: "13px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
          Start free trial
        </a>
        <a href="/contact" style={{ background: "transparent", color: "#fff", padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.25)", textDecoration: "none" }}>
          Request a demo
        </a>
      </div>
    </div>
  );
}

const CATEGORY_STYLE_EN = {
  "Hotel Management": { icon: "🏨", bg: "#fff4e0", fg: "#92611a" },
  "Revenue Management": { icon: "📈", bg: "#eaf3de", fg: "#27500a" },
};
function categoryStyleEN(cat) {
  return CATEGORY_STYLE_EN[cat] || { icon: "📰", bg: "#f1efe8", fg: "#444441" };
}

function BlogListPageEN() {
  return (
    <div style={{ fontFamily: FONT, background: "#fafbff", color: "#0f172a", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .blog-card-en:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(13,31,60,0.12)}
        .blog-card-en{transition:all .25s;text-decoration:none}
        @media (max-width:640px){.blog-grid-en{grid-template-columns:1fr!important}}
      `}</style>
      <NavEN />
      <section style={{ background: `linear-gradient(160deg,${DARK} 0%,${DARK2} 100%)`, padding: "60px 24px 50px", textAlign: "center" }}>
        <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>HOTELPRO BLOG</div>
        <h1 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4.5vw,42px)", fontWeight: 700, marginBottom: 14 }}>
          Hotel management advice
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
          Practical guides to run your hotel, inn, or B&amp;B more efficiently.
        </p>
      </section>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        <div className="blog-grid-en" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
          {BLOG_POSTS_EN.map((p) => {
            const cs = categoryStyleEN(p.category);
            return (
              <a key={p.slug} href={`/blog-en/${p.slug}`} className="blog-card-en" style={{ background: "#fff", border: "1px solid #eef1f6", borderRadius: 16, overflow: "hidden", color: "inherit", display: "flex", flexDirection: "column" }}>
                <div style={{ background: cs.bg, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 56 }}>{cs.icon}</span>
                </div>
                <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ color: cs.fg, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>{p.category.toUpperCase()}</div>
                  <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: DARK, marginBottom: 10, lineHeight: 1.3 }}>{p.title}</h2>
                  <p style={{ color: "#64748b", fontSize: 13.5, lineHeight: 1.6, marginBottom: 14, flex: 1 }}>{p.intro.slice(0, 100)}…</p>
                  <div style={{ color: "#94a3b8", fontSize: 12, borderTop: "1px solid #f1f3f7", paddingTop: 12 }}>{p.readTime} read</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
      <FooterEN />
    </div>
  );
}

function BlogPostPageEN({ slug }) {
  const post = BLOG_POSTS_EN.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div style={{ fontFamily: FONT, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <NavEN />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: DARK, marginBottom: 12 }}>Article not found</h1>
            <a href="/blog-en" style={{ color: GOLD, fontWeight: 600 }}>← Back to blog</a>
          </div>
        </div>
        <FooterEN />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, background: "#fafbff", color: "#0f172a", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <NavEN />
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 16 }}>{post.category.toUpperCase()}</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: DARK, lineHeight: 1.25, marginBottom: 18 }}>
          {post.title}
        </h1>
        <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 36 }}>{post.readTime} read</div>

        <p style={{ fontSize: 17, lineHeight: 1.75, color: "#334155", marginBottom: 32 }}>{post.intro}</p>

        {post.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 14 }}>{s.h2}</h2>
            {s.body.split("\n").map((para, j) => (
              <p key={j} style={{ fontSize: 15.5, lineHeight: 1.75, color: "#475569", marginBottom: 10, whiteSpace: "pre-line" }}>{para}</p>
            ))}
            {s.cta && <CTABoxEN />}
          </div>
        ))}

        {post.faq && post.faq.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 18 }}>Frequently asked questions</h2>
            {post.faq.map((f, i) => (
              <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < post.faq.length - 1 ? "1px solid #eef1f6" : "none" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: DARK, marginBottom: 6 }}>{f.q}</div>
                <div style={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.65 }}>{f.a}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #eef1f6" }}>
          <a href="/blog-en" style={{ color: GOLD, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>← Back to blog</a>
        </div>
      </article>
      <FooterEN />
    </div>
  );
}

export default function MarketingBlogEN({ slug }) {
  if (slug) return <BlogPostPageEN slug={slug} />;
  return <BlogListPageEN />;
}
