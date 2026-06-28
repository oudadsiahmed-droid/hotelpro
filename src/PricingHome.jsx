import { useState } from "react";

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
        <a href="/pricing-home" style={{ color: GOLD, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Tarifs</a>
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

const PLANS = [
  {
    name: "Pro",
    price: "99$",
    period: "/ mois",
    desc: "Pour les hôtels indépendants, riads et maisons d'hôtes.",
    features: [
      "Réservations illimitées",
      "Chambres illimitées",
      "Synchronisation Booking.com",
      "Page de réservation + QR code",
      "Assistant IA inclus",
      "Rapports de revenus",
      "Support en 4 langues",
      "1 établissement",
    ],
    cta: "Commencer l'essai gratuit",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "299$",
    period: "/ mois",
    desc: "Pour les groupes hôteliers et propriétés multiples.",
    features: [
      "Tout ce qui est inclus dans Pro",
      "Établissements illimités",
      "Tableau de bord multi-propriétés",
      "Gestion du personnel avancée",
      "Support prioritaire WhatsApp",
      "Onboarding personnalisé",
      "Intégrations sur demande",
      "Account manager dédié",
    ],
    cta: "Demander une démo",
    highlight: false,
  },
];

const COMPARISON = [
  { feature: "Prix mensuel", hotelpro: "99$ tout inclus", cloudbeds: "265$ - 500$+" },
  { feature: "Frais par chambre", hotelpro: "Aucun", cloudbeds: "Souvent facturé" },
  { feature: "Mise en route", hotelpro: "Moins de 10 min", cloudbeds: "Plusieurs jours" },
  { feature: "Synchronisation Booking.com", hotelpro: "Incluse", cloudbeds: "Incluse" },
  { feature: "Assistant IA", hotelpro: "Inclus", cloudbeds: "Non disponible" },
  { feature: "Support multilingue", hotelpro: "FR / EN / AR / ES", cloudbeds: "Limité" },
];

const FAQ = [
  { q: "Y a-t-il un engagement de durée ?", a: "Non, HotelPro fonctionne sans engagement. Vous pouvez annuler à tout moment depuis votre tableau de bord." },
  { q: "Que se passe-t-il après l'essai gratuit de 14 jours ?", a: "Si vous ne passez pas à un plan payant, votre compte passe en lecture seule. Vos données restent sauvegardées et vous pouvez réactiver votre compte à tout moment." },
  { q: "Puis-je changer de plan plus tard ?", a: "Oui, vous pouvez passer du plan Pro à Enterprise (ou inversement) à tout moment depuis votre compte." },
  { q: "Le plan Enterprise convient à combien d'établissements ?", a: "Le plan Enterprise est conçu pour les groupes gérant plusieurs propriétés sous un même tableau de bord, sans limite de nombre d'établissements." },
  { q: "Proposez-vous une réduction pour un engagement annuel ?", a: "Contactez notre équipe via WhatsApp ou email — des conditions annuelles préférentielles peuvent être proposées selon votre situation." },
];

export default function PricingHome() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ fontFamily: FONT, background: "#fafbff", color: "#0f172a", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
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
      <Nav />

      {/* HERO */}
      <section style={{ background: `linear-gradient(160deg,${DARK} 0%,${DARK2} 100%)`, padding: "70px 24px 60px", textAlign: "center" }}>
        <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>TARIFS</div>
        <h1 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4.5vw,42px)", fontWeight: 700, marginBottom: 14 }}>
          Un prix simple, sans surprise
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
          14 jours d'essai gratuit · Sans carte bancaire · Annulez à tout moment
        </p>
      </section>

      {/* PLANS */}
      <section style={{ padding: "70px 24px 30px", maxWidth: 920, margin: "0 auto" }}>
        <div className="ph-plans-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {PLANS.map((p) => (
            <div key={p.name} className="ph-plan-card" style={{
              background: p.highlight ? DARK : "#fff",
              borderRadius: 20,
              padding: "36px 30px",
              border: p.highlight ? "none" : "1px solid #eef1f6",
              position: "relative",
              boxShadow: p.highlight ? "0 20px 40px rgba(13,31,60,0.2)" : "0 4px 16px rgba(13,31,60,0.04)",
            }}>
              {p.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#0a0a0a", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 20, letterSpacing: 0.5 }}>
                  LE PLUS POPULAIRE
                </div>
              )}
              <div style={{ color: p.highlight ? "#fff" : DARK, fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{p.name}</div>
              <div style={{ color: p.highlight ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 13.5, marginBottom: 24 }}>{p.desc}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 28 }}>
                <span style={{ color: p.highlight ? GOLD : DARK, fontFamily: FONT_DISPLAY, fontSize: 42, fontWeight: 700 }}>{p.price}</span>
                <span style={{ color: p.highlight ? "rgba(255,255,255,0.6)" : "#94a3b8", fontSize: 14 }}>{p.period}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: p.highlight ? "rgba(255,255,255,0.85)" : "#475569", fontSize: 13.5 }}>
                    <span style={{ color: GOLD, fontWeight: 700, marginTop: 1 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <a href={p.name === "Pro" ? "/app" : "/contact"} className="ph-link ph-btn" style={{
                display: "block", textAlign: "center",
                background: p.highlight ? GOLD : DARK,
                color: p.highlight ? "#0a0a0a" : "#fff",
                padding: "14px 0", borderRadius: 10, fontWeight: 700, fontSize: 14,
              }}>{p.cta}</a>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: "60px 24px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>COMPARAISON</div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 700, color: DARK }}>HotelPro vs Cloudbeds</h2>
        </div>
        <div className="ph-compare-table" style={{ background: "#fff", border: "1px solid #eef1f6", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", background: DARK, color: "#fff", padding: "14px 20px", fontWeight: 700, fontSize: 13 }}>
            <div></div>
            <div style={{ color: GOLD, textAlign: "center" }}>HotelPro</div>
            <div style={{ textAlign: "center", opacity: 0.7 }}>Cloudbeds</div>
          </div>
          {COMPARISON.map((row, i) => (
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
          <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>QUESTIONS FRÉQUENTES</div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 700, color: DARK }}>Vous avez des questions ?</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQ.map((f, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #eef1f6", borderRadius: 12, padding: "16px 20px" }}>
              <div className="ph-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, fontSize: 14.5, color: DARK }}>
                {f.q}
                <span style={{ color: GOLD, fontSize: 18 }}>{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <div style={{ marginTop: 10, color: "#64748b", fontSize: 13.5, lineHeight: 1.6 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: `linear-gradient(135deg,${DARK},${DARK2})`, padding: "70px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: "clamp(24px,4vw,34px)", fontWeight: 700, marginBottom: 14 }}>Prêt à digitaliser votre hôtel ?</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14.5, maxWidth: 460, margin: "0 auto 28px" }}>14 jours d'essai gratuit, sans carte bancaire requise.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/app" className="ph-link ph-btn" style={{ background: GOLD, color: "#0a0a0a", padding: "14px 30px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>Essai gratuit</a>
          <a href="/contact" className="ph-link ph-btn" style={{ background: "transparent", color: "#fff", padding: "14px 30px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.25)" }}>Demander une démo</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
