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

function Nav({ t, lang, setLang, FONT_DISPLAY }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,31,60,0.97)", backdropFilter: "blur(10px)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ fontSize: 24 }}>🏨</span>
        <span style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19 }}>HotelPro</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/blog" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{t.nav.blog}</a>
        <a href="/pricing-home" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{t.nav.pricing}</a>
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

export default function ContactPage() {
  const [lang, setLang] = useState(detectLang());
  const t = PC_T[lang] || PC_T.en;
  const c = t.contact;

  useEffect(() => {
    localStorage.setItem("homeLang", lang);
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  const isRTL = t.dir === "rtl";
  const FONT = isRTL ? "'Tajawal','DM Sans',sans-serif" : "'DM Sans','Segoe UI',sans-serif";
  const FONT_DISPLAY = isRTL ? "'Tajawal',serif" : "'Playfair Display',Georgia,serif";

  const [form, setForm] = useState({ name: "", email: "", hotel: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`${c.mailSubject} - ${form.name}`);
    const body = encodeURIComponent(
      `${c.mailNameLabel}: ${form.name}\n${c.mailEmailLabel}: ${form.email}\n${c.mailHotelLabel}: ${form.hotel}\n\n${c.mailMessageLabel}:\n${form.message}`
    );
    window.location.href = `mailto:contact@hotelpro.pro?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ fontFamily: FONT, background: "#fafbff", color: "#0f172a", overflowX: "hidden", direction: t.dir }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap');
        *{box-sizing:border-box}
        .ct-link{text-decoration:none;color:inherit}
        .ct-btn{cursor:pointer;border:none;font-family:inherit;transition:all .2s}
        .ct-btn:hover{filter:brightness(1.08)}
        .ct-input{width:100%;padding:13px 16px;border-radius:10px;border:1px solid #e2e8f0;font-family:inherit;font-size:14px;outline:none;transition:border-color .2s}
        .ct-input:focus{border-color:${GOLD}}
        @media (max-width:768px){.ct-grid{grid-template-columns:1fr!important}}
      `}</style>
      <Nav t={t} lang={lang} setLang={setLang} FONT_DISPLAY={FONT_DISPLAY} />

      <section style={{ background: `linear-gradient(160deg,${DARK} 0%,${DARK2} 100%)`, padding: "70px 24px 60px", textAlign: "center" }}>
        <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>{c.eyebrow}</div>
        <h1 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4.5vw,42px)", fontWeight: 700, marginBottom: 14 }}>
          {c.title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
          {c.subtitle}
        </p>
      </section>

      <section style={{ padding: "70px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div className="ct-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 50 }}>

          {/* CONTACT INFO */}
          <div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 24 }}>
              {c.infoTitle}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>📧</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: DARK, marginBottom: 2 }}>{c.email}</div>
                  <a href="mailto:contact@hotelpro.pro" style={{ color: "#64748b", fontSize: 13.5, textDecoration: "none" }}>contact@hotelpro.pro</a>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>💬</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: DARK, marginBottom: 2 }}>{c.whatsapp}</div>
                  <a href="https://wa.me/212651645502" style={{ color: "#64748b", fontSize: 13.5, textDecoration: "none" }}>+212 651 645 502</a>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>⏱️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: DARK, marginBottom: 2 }}>{c.responseTime}</div>
                  <div style={{ color: "#64748b", fontSize: 13.5 }}>{c.responseValue}</div>
                </div>
              </div>
            </div>

            <div style={{ background: DARK, borderRadius: 16, padding: "24px 22px", marginTop: 32 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, marginBottom: 8 }}>{c.ctaBoxTitle}</div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                {c.ctaBoxText}
              </p>
              <a href="/app" className="ct-link ct-btn" style={{ display: "inline-block", background: GOLD, color: "#0a0a0a", padding: "11px 22px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
                {c.ctaBoxBtn}
              </a>
            </div>
          </div>

          {/* FORM */}
          <div style={{ background: "#fff", border: "1px solid #eef1f6", borderRadius: 20, padding: "36px 32px" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 6 }}>{c.formName}</label>
                  <input className="ct-input" type="text" name="name" required value={form.name} onChange={handleChange} placeholder={c.formNamePh} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 6 }}>{c.formEmail}</label>
                  <input className="ct-input" type="email" name="email" required value={form.email} onChange={handleChange} placeholder={c.formEmailPh} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 6 }}>{c.formHotel}</label>
                  <input className="ct-input" type="text" name="hotel" value={form.hotel} onChange={handleChange} placeholder={c.formHotelPh} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 6 }}>{c.formMessage}</label>
                  <textarea className="ct-input" name="message" required rows={5} value={form.message} onChange={handleChange} placeholder={c.formMessagePh} style={{ resize: "vertical" }} />
                </div>
                <button type="submit" className="ct-btn" style={{ background: GOLD, color: "#0a0a0a", padding: "14px 0", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                  {c.formSubmit}
                </button>
                <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 4 }}>
                  {c.formNote}
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
