import { useState, useEffect } from "react";
import { PC_T } from "./pcTranslations";

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

function Nav({ t, lang, setLang, isRTL, FONT_DISPLAY }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,31,60,0.97)", backdropFilter: "blur(10px)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ fontSize: 24 }}>🏨</span>
        <span style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19 }}>HotelPro</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/blog" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{t.nav.blog}</a>
        <a href="/pricing-home" style={{ color: GOLD, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>{t.nav.pricing}</a>
        <select value={lang} onChange={e => setLang(e.target.value)}
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 13, cursor: "pointer", outline: "none" }}>
          <option value="fr" style={{ color: "#000" }}>🇫🇷 FR</option>
          <option value="en" style={{ color: "#000" }}>🇬🇧 EN</option>
          <option value="ar" style={{ color: "#000" }}>🇲🇦 AR</option>
          <option value="es" style={{ color: "#000" }}>🇪🇸 ES</option>
        </select>
        <a href="/app" style={{ background: GOLD, color: "#0a0a0a", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>{t.nav.demo}</a>
      </div>
    </nav>
  );
}

function Footer({ t }) {
  return (
    <footer style={{ background: "#0a1830", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
        © {new Date().getFullYear()} HotelPro — {t.footer.rights}
      </div>
    </footer>
  );
}

export default function PricingHome() {
  const [lang, setLang] = useState(detectLang());
  const t = PC_T[lang] || PC_T.en;
  const p = t.pricing;

  useEffect(() => {
    localStorage.setItem("homeLang", lang);
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  const isRTL = t.dir === "rtl";
  const FONT = isRTL ? "'Tajawal','DM Sans',sans-serif" : "'DM Sans','Segoe UI',sans-serif";
  const FONT_DISPLAY = isRTL ? "'Tajawal',serif" : "'Playfair Display',Georgia,serif";

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ fontFamily: FONT, background: "#fafbff", color: "#0f172a", overflowX: "hidden", direction: t.dir }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap');
        *{box-sizing:border-box}
        .ph-link{text-decoration:none;color:inherit}
        .ph-btn{cursor:pointer;border:none;font-family:inherit;transition:all .2s}
        .ph-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .ph-plan-card{transition:all .25s}
        .ph-plan-card:hover{transform:translateY(-4px)}
        .ph-faq-q{cursor:pointer}
        @media (max-width:768px){
          .ph-plans-grid{grid-template-columns:1fr!important}
          .ph-compare-table{font-size:12px!important}
        }
      `}</style>
      <Nav t={t} lang={lang} setLang={setLang} isRTL={isRTL} FONT_DISPLAY={FONT_DISPLAY} />

      {/* HERO */}
      <section style={{ background: `linear-gradient(160deg,${DARK} 0%,${DARK2} 100%)`, padding: "70px 24px 60px", textAlign: "center" }}>
        <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>{p.eyebrow}</div>
        <h1 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4.5vw,42px)", fontWeight: 700, marginBottom: 14 }}>
          {p.title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
          {p.subtitle}
        </p>
      </section>

      {/* PLANS */}
      <section style={{ padding: "70px 24px 30px", maxWidth: 920, margin: "0 auto" }}>
        <div className="ph-plans-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {p.plans.map((pl, idx) => {
            const highlight = idx === 0;
            return (
              <div key={pl.name} className="ph-plan-card" style={{
                background: highlight ? DARK : "#fff",
                borderRadius: 20,
                padding: "36px 30px",
                border: highlight ? "none" : "1px solid #eef1f6",
                position: "relative",
                boxShadow: highlight ? "0 20px 40px rgba(13,31,60,0.2)" : "0 4px 16px rgba(13,31,60,0.04)",
              }}>
                {highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#0a0a0a", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 20, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                    {p.mostPopular}
                  </div>
                )}
                <div style={{ color: highlight ? "#fff" : DARK, fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{pl.name}</div>
                <div style={{ color: highlight ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 13.5, marginBottom: 24 }}>{pl.desc}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 28 }}>
                  <span style={{ color: highlight ? GOLD : DARK, fontFamily: FONT_DISPLAY, fontSize: 42, fontWeight: 700 }}>{pl.price}</span>
                  <span style={{ color: highlight ? "rgba(255,255,255,0.6)" : "#94a3b8", fontSize: 14 }}>{pl.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
                  {pl.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: highlight ? "rgba(255,255,255,0.85)" : "#475569", fontSize: 13.5 }}>
                      <span style={{ color: GOLD, fontWeight: 700, marginTop: 1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href={idx === 0 ? "/app" : "/contact"} className="ph-link ph-btn" style={{
                  display: "block", textAlign: "center",
                  background: highlight ? GOLD : DARK,
                  color: highlight ? "#0a0a0a" : "#fff",
                  padding: "14px 0", borderRadius: 10, fontWeight: 700, fontSize: 14,
                }}>{pl.cta}</a>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: "60px 24px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>{p.compareEyebrow}</div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 700, color: DARK }}>{p.compareTitle}</h2>
        </div>
        <div className="ph-compare-table" style={{ background: "#fff", border: "1px solid #eef1f6", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", background: DARK, color: "#fff", padding: "14px 20px", fontWeight: 700, fontSize: 13 }}>
            <div></div>
            <div style={{ color: GOLD, textAlign: "center" }}>{p.compareHotelPro}</div>
            <div style={{ textAlign: "center", opacity: 0.7 }}>{p.compareCloudbeds}</div>
          </div>
          {p.compareRows.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", padding: "14px 20px", borderTop: i > 0 ? "1px solid #f1f3f7" : "none", fontSize: 13.5 }}>
              <div style={{ color: "#334155", fontWeight: 600 }}>{row.feature}</div>
              <div style={{ textAlign: "center", color: "#16803c", fontWeight: 600 }}>{row.hotelpro}</div>
              <div style={{ textAlign: "center", color: "#94a3b8" }}>{row.cloudbeds}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "60px 24px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>{p.faqEyebrow}</div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 700, color: DARK }}>{p.faqTitle}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {p.faq.map((f, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #eef1f6", borderRadius: 12, padding: "16px 20px" }}>
              <div className="ph-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, fontSize: 14.5, color: DARK, gap: 12 }}>
                <span>{f.q}</span>
                <span style={{ color: GOLD, fontSize: 18, flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <div style={{ marginTop: 10, color: "#64748b", fontSize: 13.5, lineHeight: 1.6 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: `linear-gradient(135deg,${DARK},${DARK2})`, padding: "70px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(24px,4vw,34px)", fontWeight: 700, marginBottom: 14 }}>{p.ctaTitle}</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14.5, maxWidth: 460, margin: "0 auto 28px" }}>{p.ctaSubtitle}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/app" className="ph-link ph-btn" style={{ background: GOLD, color: "#0a0a0a", padding: "14px 30px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>{p.cta1}</a>
          <a href="/contact" className="ph-link ph-btn" style={{ background: "transparent", color: "#fff", padding: "14px 30px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.25)" }}>{p.cta2}</a>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
