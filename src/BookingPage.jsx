import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function sget(k) {
  try {
    const r = await getDoc(doc(db, "hotelpro", k));
    return r.exists() ? r.data().val : null;
  } catch { return null; }
}
async function sset(k, d) {
  try { await setDoc(doc(db, "hotelpro", k), { val: d }); } catch {}
}

const TYPES = ["Tous", "Suite", "Double", "Single", "Deluxe", "Penthouse"];

export default function BookingPage({ hotelId }) {
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("Tous");
  const [checkInFilter, setCheckInFilter] = useState("");
  const [checkOutFilter, setCheckOutFilter] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", checkIn: "", checkOut: "", adults: 1, children: 0, notes: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sget(`saas:d:${hotelId}:settings`),
      sget(`saas:d:${hotelId}:rooms`),
      sget(`saas:d:${hotelId}:res`),
    ]).then(([s, r, res]) => {
      if (s) setHotel(s);
      if (r) setRooms(r);
      if (res) setReservations(res);
      setPageLoading(false);
    });
  }, [hotelId]);

  const isRoomAvailable = (roomId) => {
    if (!checkInFilter || !checkOutFilter) return true;
    return !reservations.some(r =>
      r.roomId === roomId &&
      r.status !== "cancelled" &&
      r.checkIn < checkOutFilter &&
      r.checkOut > checkInFilter
    );
  };

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
    : 0;
  const total = nights * (selected?.price || 0);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const filteredRooms = rooms.filter(r => {
    if (r.cleanStatus === "maintenance") return false;
    if (filterType !== "Tous" && r.type !== filterType) return false;
    if (checkInFilter && checkOutFilter && !isRoomAvailable(r.id)) return false;
    return true;
  });

  const handleBook = async () => {
    if (!form.name || !form.phone || !form.checkIn || !form.checkOut) return alert("Remplissez tous les champs obligatoires");
    setLoading(true);
    const res = await sget(`saas:d:${hotelId}:res`) || [];
    
    // Add client
    const clients = await sget(`saas:d:${hotelId}:clients`) || [];
    const existingClient = clients.find(c => c.phone === form.phone);
    let clientId;
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      clientId = Date.now().toString();
      await sset(`saas:d:${hotelId}:clients`, [...clients, {
        id: clientId,
        name: form.name,
        phone: form.phone,
        email: form.email,
        createdAt: new Date().toISOString(),
      }]);
    }

    const newRes = {
      id: Date.now().toString(),
      clientId,
      roomId: selected.id,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: Number(form.adults),
      children: Number(form.children),
      notes: form.notes,
      status: "pending",
      paymentStatus: "unpaid",
      total,
      nights,
      amountPaid: 0,
      guestName: form.name,
      guestPhone: form.phone,
      guestEmail: form.email,
      source: "online",
    };
    await sset(`saas:d:${hotelId}:res`, [...res, newRes]);
    setLoading(false);
    setSuccess(true);
  };

  const typeColors = {
    Suite: "#7c3aed", Double: "#2563eb", Single: "#0891b2",
    Deluxe: "#059669", Penthouse: "#d97706"
  };

  if (pageLoading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 2s linear infinite" }}>🏨</div>
        <div style={{ color: "#64748b", fontSize: 14 }}>Chargement...</div>
      </div>
      <style>{`@keyframes spin{0%{transform:rotate(0)}50%{transform:rotate(10deg)}100%{transform:rotate(0)}}`}</style>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.1)", maxWidth: 480, width: "90%" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>✅</div>
        <h2 style={{ color: "#1e293b", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Réservation envoyée!</h2>
        <p style={{ color: "#64748b", fontSize: 15, marginBottom: 6 }}>Merci <strong>{form.name}</strong>!</p>
        <p style={{ color: "#64748b", fontSize: 14 }}>Nous vous confirmerons au <strong>{form.phone}</strong> très bientôt.</p>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginTop: 20, textAlign: "left" }}>
          {[["🛏️ Chambre", `${selected?.id} · ${selected?.type}`], ["📅 Arrivée", form.checkIn], ["📅 Départ", form.checkOut], ["🌙 Nuits", nights], ["💰 Total estimé", `$${total}`]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}>
              <span style={{ color: "#64748b" }}>{k}</span>
              <span style={{ color: "#1e293b", fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(false); setStep(1); setForm({ name: "", phone: "", email: "", checkIn: "", checkOut: "", adults: 1, children: 0, notes: "" }); setSelected(null); }}
          style={{ marginTop: 20, background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", border: "none", borderRadius: 10, padding: "12px 28px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          Nouvelle réservation
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth:"100%", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select{font-family:inherit}
        input::placeholder{color:#94a3b8}
        input:focus,select:focus{outline:none;border-color:#1d4ed8!important;box-shadow:0 0 0 3px rgba(29,78,216,0.1)!important}
        button:hover{filter:brightness(1.05);transform:translateY(-1px)}
        .room-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.12)!important}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .animate{animation:fadeIn 0.4s ease}
      `}</style>

      {/* HERO */}
      <div style={{position:"relative",height:500,overflow:"hidden",background:"linear-gradient(135deg,#1e3a8a,#0f172a)",width:"100vw",marginLeft:"calc(-50vw + 50%)"}}>
        {hotel?.heroUrl && <img src={hotel.heroUrl} alt="hotel" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.5}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.2) 100%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"40px 40px 32px"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",letterSpacing:4,marginBottom:10}}>RÉSERVATION EN LIGNE</div>
          <h1 style={{color:"#fff",fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:700,marginBottom:10,textShadow:"0 2px 20px rgba(0,0,0,0.5)"}}>{hotel?.hotelName||"HotelPro"}</h1>
          {hotel?.address&&<div style={{color:"rgba(255,255,255,0.7)",fontSize:14}}>📍 {hotel.address}</div>}
          <div style={{display:"flex",gap:16,marginTop:16,flexWrap:"wrap"}}>
            {hotel?.phone&&<div style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>📞 {hotel.phone}</div>}
            {hotel?.email&&<div style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>📧 {hotel.email}</div>}
          </div>
        <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>window.scrollTo({top:window.innerHeight,behavior:"smooth"})}>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,letterSpacing:2}}>DÉCOUVRIR</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:20,animation:"bounce 1.5s infinite"}}>↓</div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%)", padding: "0 0 0 0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 20px rgba(30,58,138,0.3)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏨</div>
            <div>
              <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>{hotel?.hotelName || "HotelPro"}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, letterSpacing: 1 }}>RÉSERVATION EN LIGNE</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["1. Chambre", "2. Infos", "3. Confirmation"].map((s, i) => (
              <div key={i} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: step === i + 1 ? "rgba(255,255,255,0.25)" : "transparent", color: step >= i + 1 ? "#fff" : "rgba(255,255,255,0.4)", border: step === i + 1 ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent" }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate">
            {/* Filters */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 28 }}>
              <h2 style={{ color: "#1e293b", fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 18 }}>🔍 Vérifier la disponibilité</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
                <div>
                  <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>Arrivée</label>
                  <input type="date" value={checkInFilter} onChange={e => { setCheckInFilter(e.target.value); setForm(p => ({ ...p, checkIn: e.target.value })); }}
                    min={new Date().toISOString().split("T")[0]}
                    style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#1e293b", background: "#f8fafc" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>Départ</label>
                  <input type="date" value={checkOutFilter} onChange={e => { setCheckOutFilter(e.target.value); setForm(p => ({ ...p, checkOut: e.target.value })); }}
                    min={checkInFilter || new Date().toISOString().split("T")[0]}
                    style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#1e293b", background: "#f8fafc" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>Type de chambre</label>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#1e293b", background: "#f8fafc", cursor: "pointer" }}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button onClick={() => { setCheckInFilter(""); setCheckOutFilter(""); setFilterType("Tous"); setForm(p => ({ ...p, checkIn: "", checkOut: "" })); }}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "11px 18px", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>
                  Réinitialiser
                </button>
              </div>
              {checkInFilter && checkOutFilter && (
                <div style={{ marginTop: 14, padding: "10px 16px", background: "rgba(29,78,216,0.06)", borderRadius: 8, color: "#1d4ed8", fontSize: 13, fontWeight: 500 }}>
                  ✅ {filteredRooms.length} chambre(s) disponible(s) du {checkInFilter} au {checkOutFilter}
                </div>
              )}
            </div>

            {/* Rooms grid */}
            <h2 style={{ color: "#1e293b", fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 20 }}>
              Nos chambres {filterType !== "Tous" ? `— ${filterType}` : ""}
            </h2>

            {filteredRooms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, color: "#64748b" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Aucune chambre disponible</div>
                <div style={{ fontSize: 13 }}>Essayez d'autres dates ou un autre type de chambre</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {filteredRooms.map(r => {
                  const available = isRoomAvailable(r.id);
                  const tCol = typeColors[r.type] || "#1d4ed8";
                  return (
                    <div key={r.id} className="room-card"
                      style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", cursor: available ? "pointer" : "default", transition: "all 0.25s", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", opacity: available ? 1 : 0.6 }}
                      onClick={() => { if (!available) return; setSelected(r); setStep(2); }}>
                      <div style={{ height: 160, background: `linear-gradient(135deg,${tCol}22,${tCol}44)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                        {r.image ? <img src={r.image} alt={r.id} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                          <div style={{ fontSize: 56 }}>🛏️</div>}
                        <div style={{ position: "absolute", top: 12, right: 12, background: available ? "#10b981" : "#ef4444", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                          {available ? "● Disponible" : "● Occupée"}
                        </div>
                        <div style={{ position: "absolute", top: 12, left: 12, background: tCol, borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                          {r.type}
                        </div>
                      </div>
                      <div style={{ padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ color: "#1e293b", fontWeight: 700, fontSize: 17 }}>Chambre {r.id}</span>
                          <span style={{ color: tCol, fontWeight: 700, fontSize: 18 }}>${r.price}<span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 12 }}>/nuit</span></span>
                        </div>
                        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>Étage {r.floor}</div>
                        {available ? (
                          <button style={{ width: "100%", background: `linear-gradient(135deg,#1e3a8a,#1d4ed8)`, border: "none", borderRadius: 10, padding: "11px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>
                            Réserver →
                          </button>
                        ) : (
                          <div style={{ width: "100%", background: "#f1f5f9", borderRadius: 10, padding: "11px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textAlign: "center" }}>
                            Non disponible
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="animate" style={{ maxWidth: 580, margin: "0 auto" }}>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: 20, fontSize: 14, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              ← Retour aux chambres
            </button>

            {/* Selected room summary */}
            <div style={{ background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", borderRadius: 16, padding: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 32 }}>🛏️</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Chambre {selected?.id}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{selected?.type} · Étage {selected?.floor}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>${selected?.price}<span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>/nuit</span></div>
                {nights > 0 && <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{nights} nuit(s) = ${total}</div>}
              </div>
            </div>

            <h2 style={{ color: "#1e293b", fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 20 }}>Vos informations</h2>

            <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[["Nom complet *", "name", "text", "Ahmed El Fassi"], ["Téléphone *", "phone", "tel", "+212 6XX XXX XXX"], ["Email", "email", "email", "contact@email.com"]].map(([label, key, type, placeholder]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <input type={type} placeholder={placeholder} value={form[key]} onChange={set(key)}
                      style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#1e293b", background: "#f8fafc", transition: "all 0.2s" }} />
                  </div>
                ))}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Arrivée *", "checkIn", "date"], ["Départ *", "checkOut", "date"]].map(([label, key, type]) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>
                      <input type={type} value={form[key]} onChange={set(key)} min={new Date().toISOString().split("T")[0]}
                        style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#1e293b", background: "#f8fafc" }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Adultes", "adults"], ["Enfants", "children"]].map(([label, key]) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>
                      <input type="number" min={key === "adults" ? 1 : 0} value={form[key]} onChange={set(key)}
                        style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#1e293b", background: "#f8fafc" }} />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>Notes / Demandes spéciales</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Chambre non-fumeur, lit bébé..."
                    style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#1e293b", background: "#f8fafc", resize: "vertical", minHeight: 80, fontFamily: "inherit" }} />
                </div>

                {nights > 0 && (
                  <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.15)", borderRadius: 10, padding: "12px 16px", color: "#1d4ed8", fontSize: 14, fontWeight: 500 }}>
                    🌙 {nights} nuit(s) · Total estimé: <strong>${total}</strong>
                  </div>
                )}

                <button onClick={() => {
                  if (!form.name || !form.phone || !form.checkIn || !form.checkOut) return alert("Remplissez les champs obligatoires (*)");
                  setStep(3);
                }} style={{ background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s" }}>
                  Continuer →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="animate" style={{ maxWidth: 520, margin: "0 auto" }}>
            <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: 20, fontSize: 14, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              ← Retour
            </button>
            <h2 style={{ color: "#1e293b", fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 20 }}>Confirmer la réservation</h2>

            <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              <div style={{ borderBottom: "2px solid #1d4ed8", paddingBottom: 14, marginBottom: 16 }}>
                <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 16, fontFamily: "'Playfair Display', serif" }}>{hotel?.hotelName}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>Récapitulatif de votre réservation</div>
              </div>
              {[
                ["🛏️ Chambre", `${selected?.id} · ${selected?.type}`],
                ["📅 Arrivée", form.checkIn],
                ["📅 Départ", form.checkOut],
                ["🌙 Nuits", `${nights} nuit(s)`],
                ["👤 Nom", form.name],
                ["📞 Téléphone", form.phone],
                form.email && ["📧 Email", form.email],
                ["👥 Adultes", form.adults],
                form.notes && ["📝 Notes", form.notes],
                ["💰 Total estimé", `$${total}`],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ color: "#64748b", fontSize: 13 }}>{k}</span>
                  <span style={{ color: k === "💰 Total estimé" ? "#1d4ed8" : "#1e293b", fontWeight: k === "💰 Total estimé" ? 700 : 600, fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>

            {hotel?.paypalEmail ? (
              <div style={{marginBottom:16}}>
                <div style={{background:"rgba(0,112,240,0.06)",border:"1px solid rgba(0,112,240,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:10,color:"#0070f0",fontSize:13}}>
                  💳 Paiement sécurisé via PayPal
                </div>
                <a href={`https://www.paypal.com/paypalme/${hotel.paypalEmail.split("@")[0]}/${total}`} target="_blank" rel="noreferrer"
                  style={{display:"block",width:"100%",background:"#0070ba",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",textAlign:"center",textDecoration:"none",marginBottom:10}}>
                  💳 Payer ${total} avec PayPal
                </a>
                <div style={{textAlign:"center",color:"#94a3b8",fontSize:12,marginBottom:10}}>— ou —</div>
              </div>
            ) : (
              <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#92400e",fontSize:13}}>
                ℹ️ Le paiement s'effectue à l'hôtel. Votre réservation sera confirmée par téléphone.
              </div>
            )}

            <button onClick={handleBook} disabled={loading}
              style={{ width: "100%", background: loading ? "#94a3b8" : "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 12, padding: "15px", color: "#fff", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              {loading ? "⏳ Envoi en cours..." : "✅ Confirmer la réservation"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px 20px", color: "#94a3b8", fontSize: 12, borderTop: "1px solid #e2e8f0", marginTop: 40 }}>
        © {new Date().getFullYear()} {hotel?.hotelName || "HotelPro"} · Réservation sécurisée
      </div>
    </div>
  );
}
