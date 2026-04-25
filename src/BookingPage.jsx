import { useState, useEffect } from "react";

const GOLD = "#c9a84c", DARK = "#080c10", CARD = "#0f1623", CARD2 = "#131d2e", BORDER = "rgba(201,168,76,0.13)";
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'DM Sans', 'Segoe UI', sans-serif";

async function sget(k, shared = true) {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
async function sset(k, d, shared = true) {
  try { localStorage.setItem(k, JSON.stringify(d)); } catch {} 
}

export default function BookingPage({ hotelId }) {
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", checkIn: "", checkOut: "", adults: 1, notes: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sget(`saas:d:${hotelId}:settings`).then(s => s && setHotel(s));
    sget(`saas:d:${hotelId}:rooms`).then(r => r && setRooms(r));
  }, [hotelId]);

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
    : 0;
  const total = nights * (selected?.price || 0);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleBook = async () => {
    if (!form.name || !form.phone || !form.checkIn || !form.checkOut) return alert("Remplissez tous les champs obligatoires");
    setLoading(true);
    const res = await sget(`saas:d:${hotelId}:res`) || [];
    const newRes = {
      id: Date.now().toString(),
      clientId: "guest-" + Date.now(),
      roomId: selected.id,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: form.adults,
      notes: form.notes,
      status: "pending",
      paymentStatus: "unpaid",
      total,
      nights,
      amountPaid: 0,
      guestName: form.name,
      guestPhone: form.phone,
      guestEmail: form.email,
    };
    await sset(`saas:d:${hotelId}:res`, [...res, newRes]);
    setLoading(false);
    setSuccess(true);
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_BODY }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>?</div>
        <h2 style={{ color: GOLD, fontFamily: FONT_DISPLAY, fontSize: 28, marginBottom: 12 }}>R�servation confirm�e!</h2>
        <p style={{ color: "#94a3b8", fontSize: 16 }}>Nous vous contacterons bient�t au {form.phone}</p>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>Chambre {selected?.id} � {nights} nuit(s) � ${total}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: DARK, fontFamily: FONT_BODY }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;600&display=swap'); *{box-sizing:border-box} input::placeholder{color:#475569} select option{background:#0f1623}`}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0b1118, #131d2e)`, borderBottom: `1px solid ${BORDER}`, padding: "20px 40px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 28 }}>??</div>
        <div>
          <h1 style={{ color: GOLD, fontFamily: FONT_DISPLAY, fontSize: 22, margin: 0 }}>{hotel?.hotelName || "HotelPro"}</h1>
          <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>R�servation en ligne</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
        {/* Steps */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {[["1", "Choisir la chambre"], ["2", "Vos informations"], ["3", "Confirmation"]].map(([n, l]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: step >= parseInt(n) ? GOLD : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: step >= parseInt(n) ? "#080c10" : "#475569" }}>{n}</div>
              <span style={{ color: step >= parseInt(n) ? "#e2e8f0" : "#475569", fontSize: 13 }}>{l}</span>
              {n !== "3" && <div style={{ width: 30, height: 1, background: BORDER }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Rooms */}
        {step === 1 && (
          <div>
            <h2 style={{ color: GOLD, fontFamily: FONT_DISPLAY, marginBottom: 20 }}>Nos chambres disponibles</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {rooms.filter(r => r.cleanStatus !== "maintenance").map(r => (
                <div key={r.id} onClick={() => { setSelected(r); setStep(2); }}
                  style={{ background: CARD2, border: `2px solid ${selected?.id === r.id ? GOLD : BORDER}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
                  onMouseLeave={e => e.currentTarget.style.borderColor = selected?.id === r.id ? GOLD : BORDER}>
                  <div style={{ height: 140, background: "linear-gradient(135deg,#1a2235,#0f1520)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, position: "relative", overflow: "hidden" }}>
                    {r.image ? <img src={r.image} alt={r.id} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "???"}
                    <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(16,185,129,0.9)", borderRadius: 20, padding: "2px 10px", fontSize: 10, color: "#fff", fontWeight: 700 }}>? Disponible</div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>Chambre {r.id}</span>
                      <span style={{ color: GOLD, fontWeight: 700 }}>${r.price}<span style={{ color: "#6b7280", fontWeight: 400, fontSize: 12 }}>/nuit</span></span>
                    </div>
                    <span style={{ background: `${GOLD}22`, color: GOLD, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{r.type}</span>
                    <div style={{ marginTop: 12 }}>
                      <button style={{ width: "100%", background: `linear-gradient(135deg,${GOLD},#b8922a)`, border: "none", borderRadius: 8, padding: "10px", color: "#080c10", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                        R�server cette chambre ?
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", marginBottom: 20, fontSize: 13 }}>? Retour</button>
            <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Chambre {selected?.id} � {selected?.type}</span>
                <span style={{ color: GOLD, fontWeight: 700 }}>${selected?.price}/nuit</span>
              </div>
            </div>
            <h2 style={{ color: GOLD, fontFamily: FONT_DISPLAY, marginBottom: 20 }}>Vos informations</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Nom complet *", "name", "text", "Ahmed El Fassi"], ["T�l�phone *", "phone", "tel", "+212 6XX XXX XXX"], ["Email", "email", "email", "contact@email.com"]].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]} onChange={set(key)}
                    style={{ width: "100%", background: "#0f172a", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 9, padding: "11px 14px", color: "#e2e8f0", fontSize: 13, outline: "none" }} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Check-in *", "checkIn", "date"], ["Check-out *", "checkOut", "date"]].map(([label, key, type]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[key]} onChange={set(key)}
                      style={{ width: "100%", background: "#0f172a", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 9, padding: "11px 14px", color: "#e2e8f0", fontSize: 13, outline: "none" }} />
                  </div>
                ))}
              </div>
              {nights > 0 && (
                <div style={{ background: `rgba(201,168,76,0.07)`, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", color: GOLD, fontSize: 14 }}>
                  ?? {nights} nuit(s) � Total: <strong>${total}</strong>
                </div>
              )}
              <button onClick={() => { if (!form.name || !form.phone || !form.checkIn || !form.checkOut) return alert("Remplissez les champs obligatoires"); setStep(3); }}
                style={{ background: `linear-gradient(135deg,${GOLD},#b8922a)`, border: "none", borderRadius: 9, padding: "13px", color: "#080c10", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Continuer ?
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", marginBottom: 20, fontSize: 13 }}>? Retour</button>
            <h2 style={{ color: GOLD, fontFamily: FONT_DISPLAY, marginBottom: 20 }}>Confirmer la r�servation</h2>
            <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
              {[["?? Chambre", `${selected?.id} � ${selected?.type}`], ["?? Check-in", form.checkIn], ["?? Check-out", form.checkOut], ["?? Nuits", nights], ["?? Nom", form.name], ["?? T�l�phone", form.phone], ["?? Total", `$${total}`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>{k}</span>
                  <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={handleBook} disabled={loading}
              style={{ width: "100%", background: `linear-gradient(135deg,${GOLD},#b8922a)`, border: "none", borderRadius: 9, padding: "14px", color: "#080c10", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              {loading ? "? En cours..." : "? Confirmer la r�servation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
