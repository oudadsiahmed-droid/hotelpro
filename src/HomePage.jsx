import { useState, useEffect } from "react";
import { HOME_T } from "./homeTranslations";

const GOLD = "#c9a84c";
const DARK = "#0d1f3c";
const DARK2 = "#0f2440";

function detectLang() {
  const saved = localStorage.getItem("homeLang");
  if (saved) return saved;
  const nav = (navigator.language || "en").slice(0, 2);
  if (["fr", "ar", "es", "en"].includes(nav)) return nav;
  return "en";
}

export default function HomePage() {
  const [lang, setLang] = useState(detectLang());
  const t = HOME_T[lang] || HOME_T.en;

  useEffect(() => {
    localStorage.setItem("homeLang", lang);
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  const isRTL = t.dir === "rtl";
  const FONT = isRTL
    ? "'Tajawal','DM Sans',sans-serif"
    : "'DM Sans','Segoe UI',sans-serif";
  const FONT_DISPLAY = isRTL
    ? "'Tajawal',serif"
    : "'Playfair Display',Georgia,serif";

  return (
    <div style={{ fontFamily: FONT, background: "#fafbff", color: "#0f172a", direction: t.dir, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap');
        *{box-sizing:border-box}
        .hp-link{text-decoration:none;color:inherit}
        .hp-btn{cursor:pointer;border:none;font-family:inherit;transition:all .2s}
        .hp-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .hp-feature-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(13,31,60,0.1)}
        .hp-feature-card{transition:all .25s}
        .hp-nav-link:hover{color:${GOLD}!important}
        @keyframes hpFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .hp-anim{animation:hpFade .7s ease forwards}
        @media (max-width:768px){
          .hp-nav-links{display:none!important}
          .hp-hero-title{font-size:34px!important}
          .hp-grid2{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,31,60,0.97)", backdropFilter: "blur(10px)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid rgba(201,168,76,0.15)` }}>
        <a href="/" className="hp-link" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🏨</span>
          <span style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, letterSpacing: isRTL ? 0 : 1 }}>HotelPro</span>
        </a>
        <div className="hp-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="/features" className="hp-link hp-nav-link" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>{t.nav.features}</a>
          <a href="/pricing-home" className="hp-link hp-nav-link" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>{t.nav.pricing}</a>
          <a href="/blog" className="hp-link hp-nav-link" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>{t.nav.blog}</a>
          <a href="/contact" className="hp-link hp-nav-link" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>{t.nav.contact}</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <select value={lang} onChange={e => setLang(e.target.value)}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 13, cursor: "pointer", outline: "none" }}>
            <option value="fr" style={{ color: "#000" }}>🇫🇷 FR</option>
            <option value="en" style={{ color: "#000" }}>🇬🇧 EN</option>
            <option value="ar" style={{ color: "#000" }}>🇲🇦 AR</option>
            <option value="es" style={{ color: "#000" }}>🇪🇸 ES</option>
          </select>
          <a href="/app" className="hp-link" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600 }}>{t.nav.login}</a>
          <a href="/app" className="hp-link hp-btn" style={{ background: GOLD, color: "#0a0a0a", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{t.nav.demo}</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg,${DARK} 0%,${DARK2} 60%,#15315c 100%)`, padding: "90px 24px 110px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: `radial-gradient(circle at 20% 30%, ${GOLD} 0%, transparent 35%), radial-gradient(circle at 80% 70%, ${GOLD} 0%, transparent 35%)` }} />
        <div className="hp-anim" style={{ position: "relative", zIndex: 2, maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "inline-block", color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 600, marginBottom: 20, padding: "6px 16px", border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 30 }}>{t.hero.eyebrow}</div>
          <h1 className="hp-hero-title" style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(34px,5.5vw,58px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 22 }}>{t.hero.title}</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px" }}>{t.hero.subtitle}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
            <a href="/app" className="hp-link hp-btn" style={{ background: GOLD, color: "#0a0a0a", padding: "15px 32px", borderRadius: 10, fontWeight: 700, fontSize: 15 }}>{t.hero.cta1}</a>
            <a href="/contact" className="hp-link hp-btn" style={{ background: "transparent", color: "#fff", padding: "15px 32px", borderRadius: 10, fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.25)" }}>{t.hero.cta2}</a>
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{t.hero.trial}</div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eef1f6", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "center", gap: 56, flexWrap: "wrap", textAlign: "center" }}>
          {t.stats.map((s, i) => (
            <div key={i}>
              <div style={{ color: DARK, fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
{/* ── FEATURES ── */}
      <section id="features" style={{ padding: "90px 24px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>{t.features.eyebrow}</div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: DARK, marginBottom: 14 }}>{t.features.title}</h2>
          <p style={{ color: "#64748b", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>{t.features.subtitle}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22 }}>
          {t.features.items.map((f, i) => (
            <div key={i} className="hp-feature-card" style={{ background: "#fff", border: "1px solid #eef1f6", borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#f8fafc", padding: "90px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>{t.how.eyebrow}</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: DARK }}>{t.how.title}</h2>
          </div>
          <div className="hp-grid2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
            {t.how.steps.map((s, i) => (
              <div key={i} style={{ textAlign: isRTL ? "right" : "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: DARK, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{i + 1}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section style={{ padding: "90px 24px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>{t.pricing.eyebrow}</div>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: DARK, marginBottom: 36 }}>{t.pricing.title}</h2>
        <div style={{ background: DARK, borderRadius: 20, padding: "44px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, [isRTL ? "left" : "right"]: 0, width: 160, height: 160, background: `radial-gradient(circle, rgba(201,168,76,0.15), transparent 70%)` }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ color: GOLD, fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 700 }}>{t.pricing.price}</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>{t.pricing.period}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 28 }}>{t.pricing.desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: isRTL ? "right" : "left", maxWidth: 420, margin: "0 auto 32px" }}>
              {t.pricing.features.map((f, i) => (
                <div key={i} style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: GOLD }}>✓</span>{f}
                </div>
              ))}
            </div>
            <a href="/app" className="hp-link hp-btn" style={{ display: "inline-block", background: GOLD, color: "#0a0a0a", padding: "15px 36px", borderRadius: 10, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{t.pricing.cta}</a>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{t.pricing.compare}</div>
          </div>
        </div>
      </section>
{/* ── FINAL CTA ── */}
      <section style={{ background: `linear-gradient(135deg,${DARK},${DARK2})`, padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(26px,4vw,36px)", fontWeight: 700, marginBottom: 14 }}>{t.cta.title}</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, maxWidth: 480, margin: "0 auto 32px" }}>{t.cta.subtitle}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/app" className="hp-link hp-btn" style={{ background: GOLD, color: "#0a0a0a", padding: "14px 30px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>{t.cta.cta1}</a>
          <a href="/contact" className="hp-link hp-btn" style={{ background: "transparent", color: "#fff", padding: "14px 30px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.25)" }}>{t.cta.cta2}</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0a1830", padding: "48px 24px 28px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32, marginBottom: 32 }}>
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🏨</span>
              <span style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16 }}>HotelPro</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6 }}>{t.footer.tagline}</p>
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 1.5, marginBottom: 14, fontWeight: 600 }}>{t.footer.product}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="/features" className="hp-link" style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{t.nav.features}</a>
              <a href="/pricing-home" className="hp-link" style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{t.nav.pricing}</a>
              <a href="/blog" className="hp-link" style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{t.nav.blog}</a>
            </div>
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 1.5, marginBottom: 14, fontWeight: 600 }}>{t.footer.company}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="/contact" className="hp-link" style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{t.nav.contact}</a>
              <a href="/app" className="hp-link" style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{t.nav.login}</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
          © {new Date().getFullYear()} HotelPro — {t.footer.rights}
        </div>
      </footer>
    </div>
  );
}
