import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import BookingPage from "./BookingPage";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import * as XLSX from "xlsx";
import { TRANSLATIONS, LANG_FLAGS, LANG_NAMES } from './translations';

// ── STORAGE ──────────────────────────────────────────────────────

async function sget(k) {
  try {
    const r = await getDoc(doc(db, "hotelpro", k));
    return r.exists() ? r.data().val : null;
  } catch { return null; }
}
async function sset(k, d) {
  try { await setDoc(doc(db, "hotelpro", k), { val: d }); } catch {}
}

// ── SIMPLE HASH ──────────────────────────────────────────────────
function hashPwd(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  return h.toString(36);
}

// ── CONSTANTS ────────────────────────────────────────────────────
const GOLD = "#cc0000", DARK = "#ffffff", CARD = "#ffffff", CARD2 = "#f5f5f5", BORDER = "rgba(0,0,0,0.1)";
const FONT_DISPLAY = "'Inter', 'Segoe UI', sans-serif";
const FONT_BODY    = "'Inter', 'Segoe UI', sans-serif";

// ── LANGUAGE CONTEXT ─────────────────────────────────────────────
const LangCtx = createContext('fr');
const useLang = () => { const l = useContext(LangCtx); return TRANSLATIONS[l] || TRANSLATIONS.fr; };
const useLangCode = () => useContext(LangCtx);

// ── TOAST CONTEXT ────────────────────────────────────────────────
const ToastCtx = createContext(()=>{});
const useToast = () => useContext(ToastCtx);

function Toaster({ toasts }) {
  const colors = {
    success:{ bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.35)", icon:"✅", c:"#10b981" },
    error:  { bg:"rgba(239,68,68,0.12)",  border:"rgba(239,68,68,0.35)",  icon:"❌", c:"#ef4444" },
    info:   { bg:"rgba(201,168,76,0.12)", border:"rgba(201,168,76,0.35)", icon:"ℹ️", c:GOLD },
  };
  return (
    <div style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
      {toasts.map(t=>{ const s=colors[t.type]||colors.info; return (
        <div key={t.id} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,
          padding:"12px 18px",display:"flex",alignItems:"center",gap:10,minWidth:260,maxWidth:360,
          backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
          animation:"slideIn 0.3s ease",fontFamily:FONT_BODY}}>
          <span style={{fontSize:15}}>{s.icon}</span>
          <span style={{color:s.c,fontSize:13,fontWeight:500,flex:1}}>{t.msg}</span>
        </div>
      );})}
    </div>
  );
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const notify = useCallback((msg, type="success") => {
    const id = Date.now() + Math.random();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 3000);
  },[]);
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <Toaster toasts={toasts}/>
    </ToastCtx.Provider>
  );
}

const CURRENCIES = { USD:{symbol:"$",rate:1}, MAD:{symbol:"MAD",rate:10}, EUR:{symbol:"€",rate:0.92} };

const STATUSES = {
  confirmed:{ label:"Confirmée", color:"#3b82f6" },
  checkin:  { label:"Check-in",  color:"#10b981" },
  checkout: { label:"Check-out", color:"#f59e0b" },
  pending:  { label:"En attente",color:"#8b5cf6" },
  cancelled:{ label:"Annulée",   color:"#ef4444" },
};

const CLEAN_COLORS = { clean:"#10b981", cleaning:"#f59e0b", dirty:"#ef4444", maintenance:"#8b5cf6" };
const CLEAN_ICONS  = { clean:"✅", cleaning:"🔄", dirty:"🧹", maintenance:"🔧" };

const INIT_ROOMS = Array.from({length:20},(_,i)=>({
  id:`R${String(i+1).padStart(2,"0")}`,
  type:i<5?"Suite":i<12?"Double":"Single",
  floor:Math.floor(i/5)+1,
  price:i<5?250:i<12?150:80,
  cleanStatus:"clean",
}));

// ── AUTH CONTEXT ─────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ── LANGUAGE SWITCHER ─────────────────────────────────────────────
function LangSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{background:"rgba(255,255,255,0.15)",border:`1px solid rgba(255,255,255,0.3)`,borderRadius:8,
          padding:"6px 10px",color:"#ffffff",cursor:"pointer",fontSize:13,fontFamily:FONT_BODY,
          display:"flex",alignItems:"center",gap:6,transition:"all 0.2s"}}>
        {LANG_FLAGS[lang]} {LANG_NAMES[lang]}
        <span style={{fontSize:10,color:"#475569"}}>▼</span>
      </button>
      {open && (
        <div style={{position:"absolute",bottom:"calc(100% + 6px)",left:0,
          background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,
          overflow:"hidden",zIndex:999,minWidth:140,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          {Object.entries(LANG_NAMES).map(([code,name])=>(
            <button key={code} onClick={()=>{setLang(code);setOpen(false);}}
              style={{width:"100%",background:lang===code?"rgba(201,168,76,0.1)":"transparent",
                border:"none",padding:"10px 14px",color:lang===code?GOLD:"#94a3b8",
                cursor:"pointer",fontSize:12,fontFamily:FONT_BODY,
                display:"flex",alignItems:"center",gap:8,textAlign:"left",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background=lang===code?"rgba(201,168,76,0.1)":"transparent"}>
              {LANG_FLAGS[code]} {name}
              {lang===code && <span style={{marginLeft:"auto",color:GOLD}}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── UI ATOMS ─────────────────────────────────────────────────────
function Inp({ label, error, ...p }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label && <label style={{fontSize:10,color:"#1e293b",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FONT_BODY,fontWeight:600}}>{label}</label>}
      <input {...p}
        onFocus={e=>{setFocus(true);p.onFocus&&p.onFocus(e);}}
        onBlur={e=>{setFocus(false);p.onBlur&&p.onBlur(e);}}
        style={{background:focus?"#eff6ff":"#f8fafc",
          border:`1px solid ${focus?GOLD:error?"#ef4444":"#cbd5e1"}`,
          borderRadius:9,padding:"11px 14px",color:"#1e293b",fontSize:13,outline:"none",
          width:"100%",boxSizing:"border-box",fontFamily:FONT_BODY,
          transition:"all 0.2s",boxShadow:focus?`0 0 0 3px rgba(201,168,76,0.1)`:"none",...p.style}} />
      {error && <span style={{fontSize:11,color:"#ef4444",fontFamily:FONT_BODY}}>{error}</span>}
    </div>
  );
}

function Sel({ label, children, ...p }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label && <label style={{fontSize:10,color:"#1e293b",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FONT_BODY,fontWeight:600}}>{label}</label>}
      <select {...p} style={{background:"#f8fafc",border:`1px solid #cbd5e1`,borderRadius:9,
        padding:"11px 14px",color:"#1e293b",fontSize:13,outline:"none",cursor:"pointer",fontFamily:FONT_BODY,
        width:"100%",boxSizing:"border-box",transition:"border 0.2s",...p.style}}
        onFocus={e=>e.target.style.borderColor=GOLD} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant="primary", loading, ...p }) {
  const styles = {
    primary:{bg:`linear-gradient(135deg,#16a34a 0%,#15803d 100%)`,color:"#ffffff",textShadow:"0 1px 2px rgba(0,0,0,0.3)",border:"none",shadow:"0 4px 15px rgba(22,163,74,0.3)"},
    ghost:  {bg:"rgba(201,168,76,0.07)",color:GOLD,border:`1px solid rgba(201,168,76,0.25)`,shadow:"none"},
    danger: {bg:"rgba(239,68,68,0.08)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.2)",shadow:"none"},
    dark:   {bg:"rgba(255,255,255,0.04)",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.07)",shadow:"none"},
  };
  const s = styles[variant]||styles.primary;
  return (
    <button {...p} style={{background:s.bg,border:s.border,borderRadius:9,padding:"10px 20px",
      color:s.color,fontWeight:600,fontSize:13,cursor:p.disabled?"not-allowed":"pointer",fontFamily:FONT_BODY,
      opacity:p.disabled||loading?0.55:1,transition:"all 0.2s",whiteSpace:"nowrap",letterSpacing:0.3,
      boxShadow:s.shadow,...p.style}}>
      {loading?"⏳":children}
    </button>
  );
}

function Badge({ status }) {
  const t = useLang();
  const statusLabels = {
    confirmed: t.confirmed, checkin: t.checkin, checkout: t.checkout,
    pending: t.pending, cancelled: t.cancelled,
  };
  const s = STATUSES[status]||STATUSES.pending;
  return <span style={{background:`${s.color}22`,color:s.color,border:`1px solid ${s.color}44`,
    borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:600}}>{statusLabels[status]||s.label}</span>;
}

function PayBadge({ status }) {
  const t = useLang();
  const map = {
    paid:{c:"#10b981",l:t.paid},
    unpaid:{c:"#ef4444",l:t.unpaidLabel},
    partial:{c:"#f59e0b",l:t.partial}
  };
  const m = map[status]||map.unpaid;
  return <span style={{background:`${m.c}18`,color:m.c,border:`1px solid ${m.c}33`,
    borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:600}}>{m.l}</span>;
}

function Modal({ title, onClose, children, maxWidth=500 }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16,
      animation:"fadeIn 0.2s ease"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#ffffff",
        border:`1px solid rgba(201,168,76,0.2)`,borderRadius:16,padding:26,
        width:"100%",maxWidth,maxHeight:"90vh",overflowY:"auto",
        boxShadow:`0 25px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(201,168,76,0.05)`,
        animation:"slideUp 0.25s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h3 style={{margin:0,color:GOLD,fontFamily:FONT_DISPLAY,fontSize:18,fontWeight:700,letterSpacing:0.5}}>{title}</h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",
            color:"#64748b",fontSize:18,cursor:"pointer",width:32,height:32,borderRadius:8,
            display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",lineHeight:1}}
            onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.1)";e.target.style.color="#e2e8f0";}}
            onMouseLeave={e=>{e.target.style.background="rgba(255,255,255,0.06)";e.target.style.color="#64748b";}}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── AUTH SCREEN ──────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ username:"", email:"", password:"", hotelName:"" });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [lang, setLang] = useState("fr");
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = t.required;
    if (!form.password || form.password.length < 4) e.password = t.minChars;
    if (tab === "register") {
      if (!form.hotelName.trim()) e.hotelName = t.required;
      if (!form.email.includes("@")) e.email = t.invalidEmail;
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const users = await sget("saas:users") || [];
    const user = users.find(u => u.username.toLowerCase() === form.username.toLowerCase() && u.pwHash === hashPwd(form.password));
    setLoading(false);
    if (!user) { setErr({ password: t.invalidCredentials }); return; }
    onLogin({...user, lang});
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const users = await sget("saas:users") || [];
    if (users.find(u => u.username.toLowerCase() === form.username.toLowerCase())) {
      setErr({ username: t.usernameExists });
      setLoading(false); return;
    }
    const newUser = {
      id: Date.now().toString(),
      username: form.username.trim(),
      email: form.email.trim(),
      hotelName: form.hotelName.trim(),
      pwHash: hashPwd(form.password),
      createdAt: new Date().toISOString(),
      plan: "trial",
      expiresAt: new Date(Date.now() + 14*24*60*60*1000).toISOString(),
    };
    await sset("saas:users", [...users, newUser]);
    setLoading(false);
    setSuccess(`${t.accountCreated} ${newUser.username}`);
    setTimeout(() => { onLogin({...newUser, lang}); }, 1200);
  };

  return (
    <div style={{minHeight:"100vh",height:"100vh",background:DARK,display:"flex",alignItems:"stretch",overflow:"hidden",position:"fixed",inset:0}}>
      <style>{`*{box-sizing:border-box} input::placeholder{color:rgba(107,114,128,0.6)} button:hover:not(:disabled){filter:brightness(1.1)}`}</style>

      {/* LEFT */}
      <div style={{flex:1,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80"
          alt="hotel" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`}}/>
        <div style={{position:"relative",padding:"0 48px 52px"}}>
          <div style={{fontSize:9,color:GOLD,letterSpacing:6,marginBottom:14,opacity:0.8}}>HOTEL MANAGEMENT SAAS</div>
          <h1 style={{margin:"0 0 12px",fontFamily:"Georgia,serif",fontSize:54,fontWeight:400,color:"#fff",lineHeight:1.1,textShadow:"0 2px 20px rgba(0,0,0,0.5)"}}>
            🏨 HotelPro
          </h1>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:15,lineHeight:1.7,maxWidth:420,margin:"0 0 36px",textShadow:"0 1px 10px rgba(0,0,0,0.6)"}}>
            {lang==="ar" ? "دبّر فندقك كالمحترفين. الحجوزات، الزبناء، الأرباح — كل شيء في مكان واحد." :
             lang==="es" ? "Gestiona tu hotel como un profesional. Reservas, clientes, ingresos — todo en un solo lugar." :
             lang==="en" ? "Manage your hotel like a pro. Reservations, clients, revenue — all in one place." :
             "Gérez votre hôtel comme un pro. Réservations, clients, revenus — tout en un seul endroit."}
          </p>
          {/* Lang switcher on login page */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(LANG_NAMES).map(([code,name])=>(
              <button key={code} onClick={()=>setLang(code)}
                style={{background:lang===code?"rgba(201,168,76,0.3)":"rgba(255,255,255,0.1)",
                  border:lang===code?`1px solid ${GOLD}`:"1px solid rgba(255,255,255,0.2)",
                  borderRadius:20,padding:"6px 14px",color:"#fff",fontSize:12,cursor:"pointer",
                  fontFamily:FONT_BODY,transition:"all 0.2s"}}>
                {LANG_FLAGS[code]} {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div style={{width:420,background:"#0f141c",borderLeft:`1px solid ${BORDER}`,
        display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 36px"}}>
        <div style={{width:"100%"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:32,marginBottom:8}}>🏨</div>
            <h2 style={{margin:0,color:"#e5e7eb",fontFamily:"Georgia,serif",fontSize:22}}>
              {tab==="login"?t.loginTitle:t.registerTitle}
            </h2>
            <p style={{color:"#6b7280",fontSize:12,marginTop:6}}>
              {tab==="login"?t.loginSubtitle:t.registerSubtitle}
            </p>
          </div>

          <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:10,padding:4,marginBottom:24}}>
            {[["login",`🔐 ${t.login}`],["register",`✨ ${t.register}`]].map(([k,l])=>(
              <button key={k} onClick={()=>{setTab(k);setErr({});setSuccess("");}}
                style={{flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                  transition:"all 0.2s",
                  background:tab===k?`linear-gradient(135deg,${GOLD},#b8922a)`:"transparent",
                  color:tab===k?"#0a0e13":"#9ca3af"}}>
                {l}
              </button>
            ))}
          </div>

          {success && <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",
            borderRadius:8,padding:"10px 14px",color:"#10b981",fontSize:13,marginBottom:16,textAlign:"center"}}>
            {success}
          </div>}

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {tab==="register" && (
              <Inp label={t.hotelName} placeholder="Grand Hôtel Atlas" value={form.hotelName}
                onChange={set("hotelName")} error={err.hotelName} />
            )}
            <Inp label={t.username} placeholder="directeur01" value={form.username}
              onChange={set("username")} error={err.username} />
            {tab==="register" && (
              <Inp label={t.email} type="email" placeholder="contact@hotel.ma" value={form.email}
                onChange={set("email")} error={err.email} />
            )}
            <Inp label={t.password} type="password" placeholder="••••••••" value={form.password}
              onChange={set("password")} error={err.password}
              onKeyDown={e=>e.key==="Enter"&&(tab==="login"?handleLogin():handleRegister())} />

            <Btn loading={loading} style={{width:"100%",padding:"12px",fontSize:14}}
              onClick={tab==="login"?handleLogin:handleRegister}>
              {tab==="login"?t.connect:t.createAccount}
            </Btn>
          </div>

          <p style={{textAlign:"center",color:"#4b5563",fontSize:11,marginTop:24}}>
            {t.secureData}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── INVOICE ──────────────────────────────────────────────────────
function InvoicePrint({ res, client, room, settings, cur }) {
  const t = useLang();
  const total  = ((res.total||0)*cur.rate).toFixed(2);
  const paid   = ((res.amountPaid||0)*cur.rate).toFixed(2);
  const due    = Math.max(0,(res.total||0)-(res.amountPaid||0))*cur.rate;
  const handle = () => {
    const w = window.open("","_blank","width=800,height=600");
    w.document.write(`<html><head><title>Facture</title>
    <style>body{font-family:Georgia,serif;padding:40px;color:#111;background:#fff}
    h1{color:#c9a84c;letter-spacing:4px;font-size:28px}
    .section h4{color:#c9a84c;border-bottom:1px solid #eee;padding-bottom:6px;font-size:12px;letter-spacing:2px}
    .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f5f5f5;font-size:13px}
    .total{display:flex;justify-content:space-between;padding:12px 0;font-size:17px;font-weight:bold;color:#c9a84c;border-top:2px solid #c9a84c}
    .stamp{text-align:center;margin:30px 0;font-size:22px;font-weight:bold;letter-spacing:4px;color:${due<=0?"#10b981":"#ef4444"}}
    .footer{text-align:center;color:#aaa;font-size:11px;margin-top:30px;border-top:1px solid #eee;padding-top:16px}
    </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #c9a84c;padding-bottom:20px;margin-bottom:30px">
      <div><h1>FACTURE</h1><div style="font-size:18px;color:#555">${settings.hotelName}</div></div>
      <div style="text-align:right;color:#888;font-size:12px"><div>#${res.id}</div><div>${new Date().toLocaleDateString("fr-FR")}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px">
      <div class="section"><h4>CLIENT</h4>
        <div class="row"><span>Nom</span><span>${client?.name||"—"}</span></div>
        <div class="row"><span>Tél</span><span>${client?.phone||"—"}</span></div>
        <div class="row"><span>ID</span><span>${client?.idNumber||"—"}</span></div>
      </div>
      <div class="section"><h4>SÉJOUR</h4>
        <div class="row"><span>Chambre</span><span>${res.roomId} · ${room?.type||""}</span></div>
        <div class="row"><span>Arrivée</span><span>${res.checkIn}</span></div>
        <div class="row"><span>Départ</span><span>${res.checkOut}</span></div>
        <div class="row"><span>Durée</span><span>${res.nights} nuit(s)</span></div>
      </div>
    </div>
    <div class="section"><h4>DÉTAIL</h4>
      <div class="row"><span>${room?.type} × ${res.nights} nuits</span><span>${cur.symbol}${((room?.price||0)*res.nights*cur.rate).toFixed(2)}</span></div>
      <div class="total"><span>TOTAL</span><span>${cur.symbol}${total}</span></div>
      <div class="row"><span>Payé</span><span style="color:#10b981">${cur.symbol}${paid}</span></div>
      ${due>0?`<div class="row"><span>Reste à payer</span><span style="color:#ef4444">${cur.symbol}${due.toFixed(2)}</span></div>`:""}
    </div>
    <div class="stamp">${due<=0?"✅ PAYÉ":"⚠️ EN ATTENTE"}</div>
    <div class="footer">${settings.hotelName} · Merci pour votre confiance</div>
    </body></html>`);
    w.document.close(); w.print();
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"#f8fafc",border:`1px solid ${BORDER}`,borderRadius:10,padding:18,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[[t.invoiceClient,client?.name||"—"],[t.invoiceRoom,`${res.roomId}·${room?.type||""}`],
          [t.invoiceArrival,res.checkIn],[t.invoiceDeparture,res.checkOut],
          [t.invoiceNights,res.nights],[t.invoiceTotal,`${cur.symbol}${total}`],
          [t.invoicePaid,`${cur.symbol}${paid}`],[t.invoiceRemaining,`${cur.symbol}${due.toFixed(2)}`]
        ].map(([k,v])=>(
          <div key={k}><div style={{fontSize:10,color:"#6b7280"}}>{k}</div><div style={{color:"#1e293b",fontWeight:600,fontSize:13}}>{v}</div></div>
        ))}
      </div>
      <Btn onClick={handle} style={{alignSelf:"center",padding:"11px 30px",fontSize:14}}>{t.printInvoice}</Btn>
    </div>
  );
}

// ── RESERVATION FORM ─────────────────────────────────────────────
function ResForm({ clients, rooms, existing, onSave, onClose }) {
  const t = useLang();
  const [f,setF] = useState(existing||{clientId:"",roomId:"",checkIn:"",checkOut:"",adults:1,children:0,status:"confirmed",notes:"",paymentStatus:"unpaid",amountPaid:0});
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  const nights = f.checkIn&&f.checkOut ? Math.max(0,(new Date(f.checkOut)-new Date(f.checkIn))/86400000) : 0;
  const room = rooms.find(r=>r.id===f.roomId);
  const total = nights*(room?.price||0);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Sel label={t.client} value={f.clientId} onChange={set("clientId")}>
          <option value="">—</option>
          {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </Sel>
        <Sel label={t.room} value={f.roomId} onChange={set("roomId")}>
          <option value="">—</option>
          {rooms.map(r=><option key={r.id} value={r.id}>{r.id}·{r.type}·${r.price}/n</option>)}
        </Sel>
        <Inp label={t.checkIn} type="date" value={f.checkIn} onChange={set("checkIn")} />
        <Inp label={t.checkOut} type="date" value={f.checkOut} onChange={set("checkOut")} />
        <Inp label={t.adults} type="number" min={1} value={f.adults} onChange={set("adults")} />
        <Inp label={t.children} type="number" min={0} value={f.children} onChange={set("children")} />
        <Sel label={t.status} value={f.status} onChange={set("status")}>
          <option value="confirmed">{t.confirmed}</option>
          <option value="checkin">{t.checkin}</option>
          <option value="checkout">{t.checkout}</option>
          <option value="pending">{t.pending}</option>
          <option value="cancelled">{t.cancelled}</option>
        </Sel>
        <Sel label={t.payment} value={f.paymentStatus} onChange={set("paymentStatus")}>
          <option value="unpaid">{t.unpaidLabel}</option>
          <option value="partial">{t.partial}</option>
          <option value="paid">{t.paid}</option>
        </Sel>
        {f.paymentStatus==="partial"&&<Inp label={t.paidAmount} type="number" min={0} value={f.amountPaid} onChange={set("amountPaid")} />}
      </div>
      <Inp label={t.notes} value={f.notes} onChange={set("notes")} placeholder={t.notesPlaceholder} />
      {nights>0&&<div style={{background:"rgba(201,168,76,0.07)",border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 13px",fontSize:13,color:GOLD}}>
        🌙 {nights} {t.nightsTotal} <strong>${total}</strong>
        {f.paymentStatus==="partial"&&f.amountPaid>0&&<> · {t.remaining} <strong>${Math.max(0,total-f.amountPaid).toFixed(0)}</strong></>}
      </div>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={onClose}>{t.cancel}</Btn>
        <Btn onClick={()=>{
          if(!f.clientId||!f.roomId||!f.checkIn||!f.checkOut) return alert(t.fillAllFields);
          const amountPaid = f.paymentStatus==="paid"?total:f.paymentStatus==="unpaid"?0:Number(f.amountPaid)||0;
          onSave({...f,id:existing?.id||Date.now().toString(),total,nights,amountPaid});
        }}>{t.save}</Btn>
      </div>
    </div>
  );
}

// ── CLIENT FORM ──────────────────────────────────────────────────
function ClientForm({ existing, onSave, onClose }) {
  const t = useLang();
  const [f,setF]=useState(existing||{name:"",email:"",phone:"",nationality:"",idNumber:"",notes:""});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label={t.fullName} value={f.name} onChange={set("name")} placeholder="Ahmed El Fassi" />
        <Inp label={t.phone} value={f.phone} onChange={set("phone")} placeholder="+212 6XX..." />
        <Inp label={t.email} type="email" value={f.email} onChange={set("email")} />
        <Inp label={t.nationality} value={f.nationality} onChange={set("nationality")} />
        <Inp label={t.idNumber} value={f.idNumber} onChange={set("idNumber")} />
      </div>
      <Inp label={t.notes} value={f.notes} onChange={set("notes")} placeholder={t.notesPlaceholder} />
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={onClose}>{t.cancel}</Btn>
        <Btn onClick={()=>{
          if(!f.name||!f.phone) return alert(t.namePhoneRequired);
          onSave({...f,id:existing?.id||Date.now().toString(),createdAt:existing?.createdAt||new Date().toISOString()});
        }}>{t.save}</Btn>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS BANNER ─────────────────────────────────────────
function NotifBanner({ reservations, clients }) {
  const t = useLang();
  const today = new Date().toISOString().split("T")[0];
  const ins    = reservations.filter(r=>r.checkIn===today&&r.status!=="cancelled");
  const outs   = reservations.filter(r=>r.checkOut===today&&r.status!=="cancelled");
  const unpaid = reservations.filter(r=>(r.paymentStatus||"unpaid")==="unpaid"&&r.status!=="cancelled");
  if(!ins.length&&!outs.length&&!unpaid.length) return null;
  return (
    <div style={{background:"rgba(201,168,76,0.05)",border:`1px solid ${BORDER}`,borderRadius:10,
      padding:"10px 16px",marginBottom:20,display:"flex",flexWrap:"wrap",gap:12,alignItems:"center"}}>
      <span style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:1}}>🔔 {t.today}</span>
      {ins.length>0&&<span style={{fontSize:12,color:"#10b981"}}>✈️ <strong>{ins.length}</strong> {t.arrivals}: {ins.map(r=>clients.find(c=>c.id===r.clientId)?.name||r.roomId).join(", ")}</span>}
      {outs.length>0&&<span style={{fontSize:12,color:"#f59e0b"}}>🚪 <strong>{outs.length}</strong> {t.departures}: {outs.map(r=>clients.find(c=>c.id===r.clientId)?.name||r.roomId).join(", ")}</span>}
      {unpaid.length>0&&<span style={{fontSize:12,color:"#ef4444"}}>💳 <strong>{unpaid.length}</strong> {t.unpaid}</span>}
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────
function Dashboard({ reservations, clients, rooms, settings }) {
  const t = useLang();
  const cur   = CURRENCIES[settings.currency]||CURRENCIES.USD;
  const today = new Date().toISOString().split("T")[0];
  const occ   = reservations.filter(r=>r.checkIn<=today&&r.checkOut>today&&["confirmed","checkin"].includes(r.status)).length;
  const rev   = reservations.filter(r=>r.status!=="cancelled").reduce((a,r)=>a+(r.total||0),0);
  const coll  = reservations.filter(r=>r.status!=="cancelled").reduce((a,r)=>a+(r.amountPaid||0),0);
  const recent=[...reservations].sort((a,b)=>b.id-a.id).slice(0,6);
  const stats=[
    {icon:"🛏️",label:t.occupiedRooms,val:`${occ}/${rooms.length}`,sub:`${Math.round(occ/rooms.length*100)}%`},
    {icon:"💰",label:t.totalRevenue,val:`${cur.symbol}${(rev*cur.rate).toFixed(0)}`},
    {icon:"✅",label:t.collected,val:`${cur.symbol}${(coll*cur.rate).toFixed(0)}`},
    {icon:"⏳",label:t.toCollect,val:`${cur.symbol}${((rev-coll)*cur.rate).toFixed(0)}`},
    {icon:"👥",label:t.clientsCount,val:clients.length},
    {icon:"📋",label:t.activeReservations,val:reservations.filter(r=>r.status!=="cancelled").length},
  ];
  return (
    <div>
      <NotifBanner reservations={reservations} clients={clients} />
      <h2 style={{margin:"0 0 18px",color:GOLD,fontFamily:"Georgia,serif",fontSize:22}}>{t.dashboardTitle}</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:24}}>
        {stats.map((s,i)=>(
          <div key={i} style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:20}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:700,color:GOLD,fontFamily:"Georgia,serif",margin:"4px 0 2px"}}>{s.val}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{s.label}</div>
            {s.sub&&<div style={{fontSize:11,color:"#10b981",marginTop:2}}>{s.sub}</div>}
          </div>
        ))}
      </div>
      <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:12,padding:20}}>
        <div style={{color:GOLD,fontFamily:"Georgia,serif",fontSize:15,marginBottom:14}}>{t.latestReservations}</div>
        {recent.length===0?<div style={{color:"#6b7280",textAlign:"center",padding:30,fontSize:13}}>{t.noReservations}</div>:
        recent.map(r=>{
          const cl=clients.find(c=>c.id===r.clientId);
          return (
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${BORDER}`,flexWrap:"wrap"}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${GOLD},#b8922a)`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:DARK,flexShrink:0}}>
                {cl?.name?.[0]||"?"}
              </div>
              <div style={{flex:1,minWidth:120}}>
                <div style={{color:"#e5e7eb",fontSize:13,fontWeight:600}}>{cl?.name||"—"}</div>
                <div style={{color:"#6b7280",fontSize:11}}>{r.roomId}·{r.checkIn}→{r.checkOut}</div>
              </div>
              <div style={{color:GOLD,fontWeight:700,fontSize:13}}>{cur.symbol}{((r.total||0)*cur.rate).toFixed(0)}</div>
              <Badge status={r.status}/><PayBadge status={r.paymentStatus||"unpaid"}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── RESERVATIONS ─────────────────────────────────────────────────
function ResPage({ reservations, clients, rooms, settings, onAdd, onEdit, onDelete, onField }) {
  const t = useLang();
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const [fSt,setFSt]=useState("all");
  const [fPay,setFPay]=useState("all");
  const cur=CURRENCIES[settings.currency]||CURRENCIES.USD;
  const filtered=reservations.filter(r=>{
    const cl=clients.find(c=>c.id===r.clientId);
    return (!search||(cl?.name||"").toLowerCase().includes(search.toLowerCase())||r.roomId.includes(search))
      &&(fSt==="all"||r.status===fSt)
      &&(fPay==="all"||(r.paymentStatus||"unpaid")===fPay);
  });
  const exportXLSX=()=>{
    const ws=XLSX.utils.json_to_sheet(filtered.map(r=>{const cl=clients.find(c=>c.id===r.clientId);
      return{Client:cl?.name||"—",Chambre:r.roomId,"Check-in":r.checkIn,"Check-out":r.checkOut,
        Nuits:r.nights,Total:`${cur.symbol}${((r.total||0)*cur.rate).toFixed(2)}`,
        Payé:`${cur.symbol}${((r.amountPaid||0)*cur.rate).toFixed(2)}`,
        Statut:r.status,Paiement:r.paymentStatus||"unpaid"};}));
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Reservations");
    XLSX.writeFile(wb,`reservations-${new Date().toISOString().split("T")[0]}.xlsx`);
  };
  return (
    <div>
      <NotifBanner reservations={reservations} clients={clients}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <h2 style={{margin:0,color:GOLD,fontFamily:"Georgia,serif",fontSize:22}}>{t.reservationsTitle}</h2>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" onClick={exportXLSX}>{t.excel}</Btn>
          <Btn onClick={()=>setModal("add")}>{t.newReservation}</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}
          style={{flex:1,minWidth:160,background:CARD2,border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 12px",color:"#1e293b",fontSize:13,outline:"none"}}/>
        <select value={fSt} onChange={e=>setFSt(e.target.value)}
          style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 10px",color:"#e5e7eb",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="all">{t.allStatuses}</option>
          <option value="confirmed">{t.confirmed}</option>
          <option value="checkin">{t.checkin}</option>
          <option value="checkout">{t.checkout}</option>
          <option value="pending">{t.pending}</option>
          <option value="cancelled">{t.cancelled}</option>
        </select>
        <select value={fPay} onChange={e=>setFPay(e.target.value)}
          style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 10px",color:"#e5e7eb",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="all">{t.allPayments}</option>
          <option value="paid">{t.paid}</option>
          <option value="unpaid">{t.unpaidLabel}</option>
          <option value="partial">{t.partial}</option>
        </select>
      </div>
      {filtered.length===0?<div style={{color:"#6b7280",textAlign:"center",padding:50,fontSize:13}}>{t.noReservationsFound}</div>:
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {filtered.map(r=>{
          const cl=clients.find(c=>c.id===r.clientId);
          const rm=rooms.find(x=>x.id===r.roomId);
          return (
            <div key={r.id} style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:10,
              padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${GOLD},#b8922a)`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:DARK,flexShrink:0}}>
                {cl?.name?.[0]||"?"}
              </div>
              <div style={{flex:1,minWidth:130}}>
                <div style={{color:"#1e293b",fontWeight:600,fontSize:13}}>{cl?.name||"—"}</div>
                <div style={{color:"#6b7280",fontSize:11}}>{r.roomId}({rm?.type})·{r.checkIn}→{r.checkOut}·{r.nights}n</div>
              </div>
              <div style={{textAlign:"right",minWidth:65}}>
                <div style={{color:GOLD,fontWeight:700,fontSize:13}}>{cur.symbol}{((r.total||0)*cur.rate).toFixed(0)}</div>
                {r.paymentStatus==="partial"&&<div style={{color:"#f59e0b",fontSize:10}}>{cur.symbol}{((r.amountPaid||0)*cur.rate).toFixed(0)}</div>}
              </div>
              <Badge status={r.status}/><PayBadge status={r.paymentStatus||"unpaid"}/>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <Btn variant="ghost" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setModal({type:"invoice",data:r})}>🖨️</Btn>
                <Btn variant="ghost" style={{padding:"4px 8px",fontSize:11}} onClick={()=>setModal({type:"edit",data:r})}>✏️</Btn>
                <Btn variant="danger" style={{padding:"4px 8px",fontSize:11}} onClick={()=>{if(confirm(t.confirmDelete))onDelete(r.id);}}>🗑</Btn>
              </div>
            </div>
          );
        })}
      </div>}
      {modal==="add"&&<Modal title={t.newReservationTitle} onClose={()=>setModal(null)}>
        <ResForm clients={clients} rooms={rooms} onClose={()=>setModal(null)} onSave={r=>{onAdd(r);setModal(null);}}/>
      </Modal>}
      {modal?.type==="edit"&&<Modal title={t.editReservationTitle} onClose={()=>setModal(null)}>
        <ResForm clients={clients} rooms={rooms} existing={modal.data} onClose={()=>setModal(null)} onSave={r=>{onEdit(r);setModal(null);}}/>
      </Modal>}
      {modal?.type==="invoice"&&<Modal title={t.invoiceTitle} onClose={()=>setModal(null)}>
        <InvoicePrint res={modal.data} client={clients.find(c=>c.id===modal.data.clientId)}
          room={rooms.find(r=>r.id===modal.data.roomId)} settings={settings} cur={cur}/>
      </Modal>}
    </div>
  );
}

// ── CLIENTS ──────────────────────────────────────────────────────
function ClientsPage({ clients, reservations, settings, onAdd, onEdit, onDelete }) {
  const t = useLang();
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const cur=CURRENCIES[settings.currency]||CURRENCIES.USD;
  const filtered=clients.filter(c=>!search||(c.name||"").toLowerCase().includes(search.toLowerCase())||c.phone?.includes(search));
  const exportXLSX=()=>{
    const ws=XLSX.utils.json_to_sheet(clients.map(c=>{
      const s=reservations.filter(r=>r.clientId===c.id).length;
      const sp=reservations.filter(r=>r.clientId===c.id).reduce((a,r)=>a+(r.total||0),0);
      return{Name:c.name,Phone:c.phone,Email:c.email,Nationality:c.nationality,ID:c.idNumber,Stays:s,Total:`${cur.symbol}${(sp*cur.rate).toFixed(2)}`};
    }));
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Clients");
    XLSX.writeFile(wb,`clients-${new Date().toISOString().split("T")[0]}.xlsx`);
  };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <h2 style={{margin:0,color:GOLD,fontFamily:"Georgia,serif",fontSize:22}}>{t.clientsTitle}</h2>
        <div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={exportXLSX}>{t.excel}</Btn><Btn onClick={()=>setModal("add")}>{t.newClient}</Btn></div>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}
        style={{width:"100%",boxSizing:"border-box",background:CARD2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 13px",color:"#1e293b",fontSize:13,outline:"none",marginBottom:14}}/>
      {filtered.length===0?<div style={{color:"#6b7280",textAlign:"center",padding:50,fontSize:13}}>{t.noClients}</div>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {filtered.map(c=>{
          const stays=reservations.filter(r=>r.clientId===c.id).length;
          const spent=reservations.filter(r=>r.clientId===c.id).reduce((a,r)=>a+(r.total||0),0);
          return (
            <div key={c.id} style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:11,padding:16,transition:"border-color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=`${GOLD}55`}
              onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${GOLD},#b8922a)`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:DARK}}>
                    {c.name[0]}
                  </div>
                  <div>
                    <div style={{color:"#e5e7eb",fontWeight:600,fontSize:13}}>{c.name}</div>
                    <div style={{color:"#6b7280",fontSize:11}}>{c.nationality||"—"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <Btn variant="ghost" style={{padding:"3px 7px",fontSize:11}} onClick={()=>setModal({type:"edit",data:c})}>✏️</Btn>
                  <Btn variant="danger" style={{padding:"3px 7px",fontSize:11}} onClick={()=>{if(confirm(t.confirmDelete))onDelete(c.id);}}>🗑</Btn>
                </div>
              </div>
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:4}}>
                {c.email&&<div style={{fontSize:12,color:"#6b7280"}}>📧 {c.email}</div>}
                {c.phone&&<div style={{fontSize:12,color:"#6b7280"}}>📞 {c.phone}</div>}
                {c.idNumber&&<div style={{fontSize:12,color:"#6b7280"}}>🪪 {c.idNumber}</div>}
              </div>
              <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${BORDER}`,display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:12,color:"#6b7280"}}>🏨 {stays} {t.stays}</div>
                <div style={{fontSize:12,color:GOLD,fontWeight:600}}>{cur.symbol}{(spent*cur.rate).toFixed(0)}</div>
              </div>
            </div>
          );
        })}
      </div>}
      {modal==="add"&&<Modal title={t.newClientTitle} onClose={()=>setModal(null)}>
        <ClientForm onClose={()=>setModal(null)} onSave={c=>{onAdd(c);setModal(null);}}/>
      </Modal>}
      {modal?.type==="edit"&&<Modal title={t.editClientTitle} onClose={()=>setModal(null)}>
        <ClientForm existing={modal.data} onClose={()=>setModal(null)} onSave={c=>{onEdit(c);setModal(null);}}/>
      </Modal>}
    </div>
  );
}

// ── ROOM EDIT MODAL ───────────────────────────────────────────────
function RoomEditModal({ room, onSave, onClose }) {
  const t = useLang();
  const [f, setF] = useState({ id:room.id, type:room.type, price:room.price, floor:room.floor, image:room.image||"" });
  const [preview, setPreview] = useState(room.image||"");
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { alert("Image trop grande (max 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); setF(p=>({...p,image:ev.target.result})); };
    reader.readAsDataURL(file);
  };

  const removeImage = () => { setPreview(""); setF(p=>({...p,image:""})); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div>
        <label style={{fontSize:10,color:"#6b7280",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:8}}>
          {t.roomPhoto}
        </label>
        {preview ? (
          <div style={{position:"relative",borderRadius:10,overflow:"hidden",height:180}}>
            <img src={preview} alt="room" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.6),transparent)"}}/>
            <div style={{position:"absolute",bottom:10,left:0,right:0,display:"flex",justifyContent:"center",gap:8}}>
              <label style={{background:"rgba(201,168,76,0.9)",color:"#0a0e13",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {t.changePhoto}<input type="file" accept="image/*" onChange={handleImage} style={{display:"none"}}/>
              </label>
              <button onClick={removeImage} style={{background:"rgba(239,68,68,0.85)",color:"#fff",border:"none",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {t.removePhoto}
              </button>
            </div>
          </div>
        ) : (
          <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            height:140,background:"#f8fafc",border:`2px dashed ${BORDER}`,borderRadius:10,
            cursor:"pointer",gap:8,transition:"border-color 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=GOLD}
            onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
            <span style={{fontSize:32}}>📷</span>
            <span style={{fontSize:12,color:"#6b7280"}}>{t.addPhoto}</span>
            <span style={{fontSize:10,color:"#4b5563"}}>{t.photoMaxSize}</span>
            <input type="file" accept="image/*" onChange={handleImage} style={{display:"none"}}/>
          </label>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Sel label={t.roomNumber} value={f.id} onChange={set("id")}>
  {Array.from({length:30},(_,i)=>`R${String(i+1).padStart(2,"0")}`).map(r=><option key={r} value={r}>{r}</option>)}
</Sel>
        <Sel label={t.type} value={f.type} onChange={set("type")}>
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Suite">Suite</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Penthouse">Penthouse</option>
        </Sel>
        <Inp label={t.pricePerNight} type="number" value={f.price} onChange={set("price")} min={0}/>
        <Sel label={t.floor} value={f.floor} onChange={set("floor")}>
          {[1,2,3,4,5,6,7,8].map(fl=><option key={fl} value={fl}>Étage {fl}</option>)}
        </Sel>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
        <Btn variant="ghost" onClick={onClose}>{t.cancel}</Btn>
        <Btn onClick={()=>{
          if(!f.id.trim()) return alert(t.roomNumberRequired);
          onSave({...room,...f,id:f.id.trim(),price:Number(f.price),floor:Number(f.floor)});
        }}>{t.save}</Btn>
      </div>
    </div>
  );
}

// ── ROOMS ─────────────────────────────────────────────────────────
function RoomsPage({ rooms, reservations, onUpdateRoom, onAddRoom, onDeleteRoom }) {
  const t = useLang();
  const [editRoom, setEditRoom] = useState(null);
  const [view, setView] = useState("grid");
  const today = new Date().toISOString().split("T")[0];
  const occIds = reservations.filter(r=>r.checkIn<=today&&r.checkOut>today&&["confirmed","checkin"].includes(r.status)).map(r=>r.roomId);
  const typeColors = { Suite:"#c9a84c", Double:"#8b5cf6", Single:"#3b82f6", Deluxe:"#10b981", Penthouse:"#f59e0b" };
  const CLEAN_LABELS = { clean:t.clean, cleaning:t.cleaning, dirty:t.dirty, maintenance:t.maintenance };

  const addRoom = () => {
    const newId = `R${String(rooms.length+1).padStart(2,"0")}`;
    setEditRoom({ id:newId, type:"Single", floor:1, price:80, cleanStatus:"clean", image:"" });
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <h2 style={{margin:0,color:GOLD,fontFamily:"Georgia,serif",fontSize:22}}>{t.roomsTitle}</h2>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:6,fontSize:11}}>
            <span style={{color:"#10b981"}}>🟢 {rooms.length-occIds.length}</span>
            <span style={{color:"#ef4444"}}>🔴 {occIds.length}</span>
          </div>
          <div style={{display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:8,padding:3,gap:2}}>
            {[["grid","⊞"],["list","☰"]].map(([v,ico])=>(
              <button key={v} onClick={()=>setView(v)} style={{
                background:view===v?`rgba(201,168,76,0.2)`:"transparent",
                border:view===v?`1px solid ${BORDER}`:"1px solid transparent",
                borderRadius:6,padding:"4px 10px",color:view===v?GOLD:"#6b7280",
                cursor:"pointer",fontSize:14,transition:"all 0.15s"}}>
                {ico}
              </button>
            ))}
          </div>
          <Btn onClick={addRoom} style={{padding:"7px 14px",fontSize:12}}>{t.addRoom}</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
        {Object.entries(CLEAN_ICONS).map(([k,ico])=>(
          <div key={k} style={{background:CARD2,border:`1px solid ${CLEAN_COLORS[k]}33`,borderRadius:8,padding:"5px 12px",fontSize:11,color:CLEAN_COLORS[k]}}>
            {ico} {CLEAN_LABELS[k]}: <strong>{rooms.filter(r=>r.cleanStatus===k).length}</strong>
          </div>
        ))}
      </div>

      {view==="grid" && [1,2,3,4,5,6,7,8].map(fl=>{
        const flRooms = rooms.filter(r=>Number(r.floor)===fl);
        if(!flRooms.length) return null;
        return (
          <div key={fl} style={{marginBottom:24}}>
            <div style={{fontSize:10,color:"#6b7280",letterSpacing:2,marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
              ÉTAGE {fl}<div style={{flex:1,height:1,background:BORDER}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
              {flRooms.map(r=>{
                const occ = occIds.includes(r.id);
                const col = occ?"#ef4444":"#10b981";
                const tCol = typeColors[r.type]||GOLD;
                return (
                  <div key={r.id} style={{background:CARD2,border:`2px solid ${col}25`,borderRadius:12,overflow:"hidden",transition:"all 0.2s",cursor:"pointer"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=col;e.currentTarget.style.transform="translateY(-2px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=`${col}25`;e.currentTarget.style.transform="none";}}
                    onClick={()=>setEditRoom(r)}>
                    <div style={{height:100,background:"rgba(0,0,0,0.3)",position:"relative",overflow:"hidden"}}>
                      {r.image ? <img src={r.image} alt={r.id} style={{width:"100%",height:"100%",objectFit:"cover"}}/> :
                        <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,#1a2235,#0f1520)`,flexDirection:"column",gap:4}}>
                          <span style={{fontSize:28}}>🛏️</span>
                        </div>}
                      <div style={{position:"absolute",top:7,right:7,background:occ?"rgba(239,68,68,0.9)":"rgba(16,185,129,0.9)",borderRadius:20,padding:"2px 8px",fontSize:9,color:"#fff",fontWeight:700}}>
                        {occ?`● ${t.occupied.replace("🔴 ","")}` :`● ${t.free.replace("🟢 ","")}`}
                      </div>
                    </div>
                    <div style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{color:"#1e293b",fontWeight:700,fontSize:15}}>{r.id}</div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{color:GOLD,fontWeight:700,fontSize:12}}>${r.price}<span style={{color:"#6b7280",fontWeight:400}}>/n</span></div>
                          <button onClick={e=>{e.stopPropagation();if(confirm("Supprimer cette chambre?"))onDeleteRoom(r.id);}} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"4px 8px",color:"#ef4444",fontSize:14,cursor:"pointer"}}>🗑</button>
                        </div>
                      </div>
                      <div style={{fontSize:10,color:tCol,fontWeight:600,marginBottom:8}}>{r.type}</div>
                      <select value={r.cleanStatus||"clean"} onClick={e=>e.stopPropagation()}
                        onChange={e=>{ e.stopPropagation(); onUpdateRoom(r.id,{cleanStatus:e.target.value},r); }}
                        style={{width:"100%",background:DARK,border:`1px solid ${CLEAN_COLORS[r.cleanStatus||"clean"]}55`,borderRadius:6,padding:"4px 6px",color:CLEAN_COLORS[r.cleanStatus||"clean"],fontSize:10,cursor:"pointer",outline:"none"}}>
                        {Object.entries(CLEAN_ICONS).map(([k,ico])=><option key={k} value={k}>{ico} {CLEAN_LABELS[k]}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {editRoom && (
        <Modal title={rooms.find(r=>r.id===editRoom.id) ? `✏️ ${t.editRoomTitle} ${editRoom.id}` : t.newRoomTitle} onClose={()=>setEditRoom(null)}>
          <RoomEditModal room={editRoom} onClose={()=>setEditRoom(null)}
            onSave={updated=>{
              const exists = rooms.find(r=>r.id===editRoom.id);
              if(exists) onUpdateRoom(editRoom.id, updated, editRoom);
              else onAddRoom(updated);
              setEditRoom(null);
            }}/>
        </Modal>
      )}
    </div>
  );
}

// ── REVENUE ──────────────────────────────────────────────────────
function RevenuePage({ reservations, settings }) {
  const t = useLang();
  const cur=CURRENCIES[settings.currency]||CURRENCIES.USD;
  const byMonth=t.months.map((m,i)=>{
    const mR=reservations.filter(r=>{if(r.status==="cancelled")return false;const d=new Date(r.checkIn);return d.getMonth()===i&&d.getFullYear()===new Date().getFullYear();});
    return{month:m,total:+(mR.reduce((a,r)=>a+(r.total||0),0)*cur.rate).toFixed(0),paid:+(mR.reduce((a,r)=>a+(r.amountPaid||0),0)*cur.rate).toFixed(0),count:mR.length};
  });
  const totY=byMonth.reduce((a,m)=>a+m.total,0);
  const paidY=byMonth.reduce((a,m)=>a+m.paid,0);
  return (
    <div>
      <h2 style={{margin:"0 0 18px",color:GOLD,fontFamily:"Georgia,serif",fontSize:22}}>{t.revenueTitle}</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:24}}>
        {[{icon:"💰",label:t.annualRevenue,val:`${cur.symbol}${totY.toLocaleString()}`},
          {icon:"✅",label:t.collectedLabel,val:`${cur.symbol}${paidY.toLocaleString()}`},
          {icon:"⏳",label:t.toCollectLabel,val:`${cur.symbol}${(totY-paidY).toLocaleString()}`},
          {icon:"📈",label:t.collectionRate,val:`${totY>0?Math.round(paidY/totY*100):0}%`}
        ].map((s,i)=>(
          <div key={i} style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:20}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:700,color:GOLD,fontFamily:"Georgia,serif",margin:"4px 0 2px"}}>{s.val}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:12,padding:20,marginBottom:16}}>
        <div style={{color:GOLD,fontFamily:"Georgia,serif",fontSize:14,marginBottom:16}}>{t.monthlyRevenue} {new Date().getFullYear()} ({cur.symbol})</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byMonth} margin={{top:5,right:10,left:0,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)"/>
            <XAxis dataKey="month" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#6b7280",fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:DARK,border:`1px solid ${BORDER}`,borderRadius:8,color:"#e5e7eb",fontSize:12}}
              formatter={(v,n)=>[`${cur.symbol}${v}`,n==="total"?t.total:t.collectedLabel]}/>
            <Bar dataKey="total" fill={`${GOLD}55`} radius={[4,4,0,0]}/>
            <Bar dataKey="paid" fill={GOLD} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:"rgba(201,168,76,0.07)"}}>
            {[t.month,t.reservationsCount,t.total,t.collectedLabel,t.remaining2].map(h=>(
              <th key={h} style={{padding:"9px 14px",color:GOLD,fontWeight:600,fontSize:10,letterSpacing:1,textAlign:"left",borderBottom:`1px solid ${BORDER}`}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{byMonth.map((m,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${BORDER}`}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,0.04)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{padding:"8px 14px",color:"#1e293b",fontWeight:600}}>{m.month}</td>
              <td style={{padding:"8px 14px",color:"#6b7280"}}>{m.count}</td>
              <td style={{padding:"8px 14px",color:GOLD}}>{cur.symbol}{m.total.toLocaleString()}</td>
              <td style={{padding:"8px 14px",color:"#10b981"}}>{cur.symbol}{m.paid.toLocaleString()}</td>
              <td style={{padding:"8px 14px",color:m.total-m.paid>0?"#ef4444":"#10b981"}}>{cur.symbol}{(m.total-m.paid).toLocaleString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ── SETTINGS ─────────────────────────────────────────────────────
function SettingsPage({ settings, onSave, user, onLogout }) {
  const t = useLang();
  const [f,setF]=useState(settings);
  const [pwForm,setPwForm]=useState({old:"",newPw:"",confirm:""});
  const [pwMsg,setPwMsg]=useState("");
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const setPw=k=>e=>setPwForm(p=>({...p,[k]:e.target.value}));

  const changePassword=async()=>{
    if(pwForm.newPw!==pwForm.confirm){setPwMsg(t.passwordMismatch);return;}
    if(pwForm.newPw.length<4){setPwMsg(t.passwordTooShort);return;}
    const users=await sget("saas:users")||[];
    const idx=users.findIndex(u=>u.id===user.id);
    if(idx===-1||users[idx].pwHash!==hashPwd(pwForm.old)){setPwMsg(t.wrongOldPassword);return;}
    users[idx].pwHash=hashPwd(pwForm.newPw);
    await sset("saas:users",users);
    setPwMsg(t.passwordChanged); setPwForm({old:"",newPw:"",confirm:""});
  };

  return (
    <div>
      <h2 style={{margin:"0 0 20px",color:GOLD,fontFamily:"Georgia,serif",fontSize:22}}>{t.settingsTitle}</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
        <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:12,padding:22}}>
          <div style={{color:GOLD,fontFamily:"Georgia,serif",fontSize:15,marginBottom:16}}>{t.myHotel}</div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <Inp label={t.hotelNameLabel} value={f.hotelName} onChange={set("hotelName")} placeholder="Grand Hôtel Atlas"/>
            <Sel label={t.currency} value={f.currency} onChange={set("currency")}>
              <option value="USD">USD ($) · Dollar</option>
              <option value="MAD">MAD · Dirham Marocain</option>
              <option value="EUR">EUR (€) · Euro</option>
            </Sel>
            <Btn onClick={()=>onSave(f)} style={{alignSelf:"flex-start"}}>{t.saveSettings}</Btn>
          </div>
        </div>
        <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:12,padding:22}}>
          <div style={{color:GOLD,fontFamily:"Georgia,serif",fontSize:15,marginBottom:16}}>{t.myAccount}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {[[t.user,user.username],["📧 Email",user.email||"—"],["🏨",user.hotelName],
              [t.registeredOn,new Date(user.createdAt).toLocaleDateString()]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${BORDER}`}}>
                <span style={{fontSize:12,color:"#6b7280"}}>{k}</span>
                <span style={{fontSize:12,color:"#1e293b",fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
          <Btn variant="danger" onClick={onLogout} style={{width:"100%"}}>{t.logout}</Btn>
        </div>
        <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:12,padding:22}}>
          <div style={{color:GOLD,fontFamily:"Georgia,serif",fontSize:15,marginBottom:16}}>{t.changePassword}</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Inp label={t.oldPassword} type="password" value={pwForm.old} onChange={setPw("old")} placeholder="••••••••"/>
            <Inp label={t.newPassword} type="password" value={pwForm.newPw} onChange={setPw("newPw")} placeholder="••••••••"/>
            <Inp label={t.confirmPassword} type="password" value={pwForm.confirm} onChange={setPw("confirm")} placeholder="••••••••"/>
            {pwMsg&&<div style={{fontSize:12,color:pwMsg.startsWith("✅")?"#10b981":"#ef4444",padding:"6px 10px",
              background:pwMsg.startsWith("✅")?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",borderRadius:6}}>{pwMsg}</div>}
            <Btn onClick={changePassword} style={{alignSelf:"flex-start"}}>{t.changeBtn}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STAFF MODULE ─────────────────────────────────────────────────
const DEPARTMENTS = ["Réception","Housekeeping","Restaurant","Cuisine","Sécurité","Maintenance","Spa & Bien-être","Direction","Comptabilité"];
const STAFF_STATUS = {
  active:   {label:"Actif",       color:"#10b981", bg:"rgba(16,185,129,0.12)"},
  leave:    {label:"En congé",    color:"#f59e0b", bg:"rgba(245,158,11,0.12)"},
  absent:   {label:"Absent",      color:"#ef4444", bg:"rgba(239,68,68,0.12)"},
  trial:    {label:"Période d'essai", color:"#8b5cf6", bg:"rgba(139,92,246,0.12)"},
  resigned: {label:"Démissionné", color:"#64748b", bg:"rgba(100,116,139,0.12)"},
};
const CONTRACTS = ["CDI","CDD","Temps partiel","Stage","Intérim","Saisonnier"];
const DEPT_ICONS = {
  "Réception":"🛎️","Housekeeping":"🧹","Restaurant":"🍽️","Cuisine":"👨‍🍳",
  "Sécurité":"🔒","Maintenance":"🔧","Spa & Bien-être":"💆","Direction":"👔","Comptabilité":"📊"
};

function StaffForm({ existing, onSave, onClose }) {
  const t = useLang();
  const [f,setF] = useState(existing || {
    name:"", phone:"", email:"", cin:"", department:"Réception",
    position:"", contract:"CDI", salary:"", startDate:"",
    status:"active", notes:"", photo:"",
  });
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  const [prev,setPrev] = useState(existing?.photo||"");

  const handlePhoto = e => {
    const file=e.target.files[0]; if(!file) return;
    if(file.size>1.5*1024*1024){alert("Max 1.5MB");return;}
    const r=new FileReader();
    r.onload=ev=>{setPrev(ev.target.result);setF(p=>({...p,photo:ev.target.result}));};
    r.readAsDataURL(file);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <label style={{cursor:"pointer",flexShrink:0}}>
          <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",background:`linear-gradient(135deg,#16a34a,#15803d)`,border:`2px solid #cbd5e1`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:prev?"":26,position:"relative"}}>
            {prev ? <img src={prev} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span>{f.name?.[0]?.toUpperCase()||"👤"}</span>}
          </div>
          <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
        </label>
        <div style={{flex:1}}>
          <Inp label={t.fullNameRequired} value={f.name} onChange={set("name")} placeholder="Mohammed El Amrani"/>
          <div style={{marginTop:8}}>
            <Inp label={t.position} value={f.position} onChange={set("position")} placeholder="Réceptionniste..."/>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Sel label={t.department} value={f.department} onChange={set("department")}>
          {DEPARTMENTS.map(d=><option key={d} value={d}>{DEPT_ICONS[d]||"👤"} {d}</option>)}
        </Sel>
        <Sel label={t.contract} value={f.contract} onChange={set("contract")}>
          {CONTRACTS.map(c=><option key={c} value={c}>{c}</option>)}
        </Sel>
        <Inp label={t.phone} value={f.phone} onChange={set("phone")} placeholder="+212 6XX XXX XXX"/>
        <Inp label={t.email} type="email" value={f.email} onChange={set("email")}/>
        <Inp label="CIN / N° ID" value={f.cin} onChange={set("cin")} placeholder="AB123456"/>
        <Inp label={t.salary} type="number" value={f.salary} onChange={set("salary")} placeholder="5000"/>
        <Inp label={t.hireDate} type="date" value={f.startDate} onChange={set("startDate")}/>
        <Sel label={t.status} value={f.status} onChange={set("status")}>
          {Object.entries(STAFF_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </Sel>
      </div>
      <Inp label={t.notes} value={f.notes} onChange={set("notes")} placeholder={t.notesPlaceholder}/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:4}}>
        <Btn variant="ghost" onClick={onClose}>{t.cancel}</Btn>
        <Btn onClick={()=>{
          if(!f.name.trim()||!f.position.trim()) return alert(t.namePositionRequired);
          onSave({...f,id:existing?.id||Date.now().toString(),createdAt:existing?.createdAt||new Date().toISOString()});
        }}>{t.save}</Btn>
      </div>
    </div>
  );
}

function StaffCard({ emp, onEdit, onDelete, onStatus }) {
  const t = useLang();
  const st = STAFF_STATUS[emp.status]||STAFF_STATUS.active;
  const seniority = emp.startDate ? Math.floor((new Date()-new Date(emp.startDate))/(365.25*24*3600*1000)*10)/10 : null;
  return (
    <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:14,overflow:"hidden",transition:"all 0.2s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.3)";e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.transform="none";}}>
      <div style={{height:3,background:`linear-gradient(90deg,${GOLD}44,${GOLD},${GOLD}44)`}}/>
      <div style={{padding:"18px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:`linear-gradient(135deg,${GOLD},#a8832a)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:emp.photo?"":20,fontWeight:700,color:"#080c10"}}>
              {emp.photo ? <img src={emp.photo} alt={emp.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : emp.name?.[0]?.toUpperCase()||"👤"}
            </div>
            <div>
              <div style={{color:"#f1f5f9",fontWeight:700,fontSize:14,fontFamily:FONT_DISPLAY}}>{emp.name}</div>
              <div style={{color:GOLD,fontSize:12,marginTop:2,fontWeight:500}}>{emp.position}</div>
              <div style={{fontSize:11,color:"#475569",marginTop:1}}>{DEPT_ICONS[emp.department]||"👤"} {emp.department}</div>
            </div>
          </div>
          <span style={{background:st.bg,color:st.color,border:`1px solid ${st.color}33`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:600,whiteSpace:"nowrap"}}>● {st.label}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {[emp.phone&&["📞",emp.phone],emp.email&&["📧",emp.email],emp.cin&&["🪪",emp.cin],
            emp.contract&&["📄",emp.contract],emp.salary&&["💰",`${Number(emp.salary).toLocaleString()} MAD`],
            seniority!==null&&["📅",`${seniority} ${seniority>=2?t.years:t.year} ${t.seniority}`],
          ].filter(Boolean).map(([icon,val],i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11}}>{icon}</span>
              <span style={{fontSize:11,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",paddingTop:12,borderTop:`1px solid rgba(255,255,255,0.05)`}}>
          <select value={emp.status} onChange={e=>onStatus(emp.id,e.target.value)}
            style={{flex:1,background:DARK,border:`1px solid rgba(255,255,255,0.07)`,borderRadius:7,padding:"5px 8px",color:STAFF_STATUS[emp.status]?.color||"#94a3b8",fontSize:11,cursor:"pointer",outline:"none",fontFamily:FONT_BODY}}>
            {Object.entries(STAFF_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <Btn variant="ghost" style={{padding:"5px 10px",fontSize:12}} onClick={()=>onEdit(emp)}>✏️</Btn>
          <Btn variant="danger" style={{padding:"5px 10px",fontSize:12}} onClick={()=>onDelete(emp.id)}>🗑</Btn>
        </div>
      </div>
    </div>
  );
}

function StaffPage({ staff, onAdd, onEdit, onDelete, onStatus }) {
  const t = useLang();
  const [modal,setModal] = useState(null);
  const [search,setSearch] = useState("");
  const [fDept,setFDept] = useState("all");
  const [fStatus,setFStatus] = useState("all");
  const [view,setView] = useState("cards");

  const filtered = staff.filter(e=>{
    const ms = !search||(e.name||"").toLowerCase().includes(search.toLowerCase())||(e.position||"").toLowerCase().includes(search.toLowerCase());
    const md = fDept==="all"||e.department===fDept;
    const mst= fStatus==="all"||e.status===fStatus;
    return ms&&md&&mst;
  });

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(staff.map(e=>({
      Name:e.name, Position:e.position, Department:e.department,
      Phone:e.phone, Email:e.email, ID:e.cin,
      Contract:e.contract, Salary:e.salary, HireDate:e.startDate, Status:STAFF_STATUS[e.status]?.label||e.status,
    })));
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Staff");
    XLSX.writeFile(wb,`staff-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const byDept = DEPARTMENTS.map(d=>({dept:d,count:staff.filter(e=>e.department===d).length})).filter(x=>x.count>0);
  const totalSalary = staff.filter(e=>e.status==="active").reduce((a,e)=>a+Number(e.salary||0),0);

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:22}}>
        {[
          {icon:"👥",label:t.totalStaff,val:staff.length,col:GOLD},
          {icon:"✅",label:t.active,val:staff.filter(e=>e.status==="active").length,col:"#10b981"},
          {icon:"🌴",label:t.onLeave,val:staff.filter(e=>e.status==="leave").length,col:"#f59e0b"},
          {icon:"❌",label:t.absent,val:staff.filter(e=>e.status==="absent").length,col:"#ef4444"},
          {icon:"💰",label:t.payroll,val:`${totalSalary.toLocaleString()} MAD`,col:"#8b5cf6"},
          {icon:"🏢",label:t.departments,val:byDept.length,col:"#3b82f6"},
        ].map((s,i)=>(
          <div key={i} style={{background:CARD2,border:`1px solid rgba(255,255,255,0.05)`,borderRadius:11,padding:"13px 15px",borderLeft:`3px solid ${s.col}`}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:700,color:s.col,fontFamily:FONT_DISPLAY}}>{s.val}</div>
            <div style={{fontSize:10,color:"#475569",marginTop:2,letterSpacing:0.5}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}
          style={{flex:1,minWidth:180,background:CARD2,border:`1px solid rgba(255,255,255,0.07)`,borderRadius:9,padding:"9px 13px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:FONT_BODY}}/>
        <select value={fDept} onChange={e=>setFDept(e.target.value)}
          style={{background:CARD2,border:`1px solid rgba(255,255,255,0.07)`,borderRadius:9,padding:"9px 12px",color:"#1e293b",fontSize:12,outline:"none",cursor:"pointer",fontFamily:FONT_BODY}}>
          <option value="all">{t.allDepartments}</option>
          {DEPARTMENTS.map(d=><option key={d} value={d}>{DEPT_ICONS[d]} {d}</option>)}
        </select>
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)}
          style={{background:CARD2,border:`1px solid rgba(255,255,255,0.07)`,borderRadius:9,padding:"9px 12px",color:"#1e293b",fontSize:12,outline:"none",cursor:"pointer",fontFamily:FONT_BODY}}>
          <option value="all">{t.allStatuses2}</option>
          {Object.entries(STAFF_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <Btn variant="ghost" onClick={exportXLSX} style={{padding:"9px 14px",fontSize:12}}>{t.excel}</Btn>
        <Btn onClick={()=>setModal("add")} style={{padding:"9px 16px",fontSize:13}}>{t.addEmployee}</Btn>
      </div>

      {view==="cards" && (
        filtered.length===0
          ? <div style={{textAlign:"center",color:"#475569",padding:60,fontSize:14}}>
              <div style={{fontSize:48,marginBottom:12}}>👥</div>
              <div>{t.noEmployees}</div>
              <Btn onClick={()=>setModal("add")} style={{marginTop:16}}>{t.addFirstEmployee}</Btn>
            </div>
          : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {filtered.map(e=>(
                <StaffCard key={e.id} emp={e}
                  onEdit={emp=>setModal({type:"edit",data:emp})}
                  onDelete={id=>{if(confirm(t.confirmDelete))onDelete(id);}}
                  onStatus={(id,status)=>onStatus(id,status)}/>
              ))}
            </div>
      )}

      {modal==="add" && (
        <Modal title={t.newEmployeeTitle} onClose={()=>setModal(null)} maxWidth={580}>
          <StaffForm onClose={()=>setModal(null)} onSave={e=>{onAdd(e);setModal(null);}}/>
        </Modal>
      )}
      {modal?.type==="edit" && (
        <Modal title={`${t.editEmployeeTitle} — ${modal.data.name}`} onClose={()=>setModal(null)} maxWidth={580}>
          <StaffForm existing={modal.data} onClose={()=>setModal(null)} onSave={e=>{onEdit(e);setModal(null);}}/>
        </Modal>
      )}
    </div>
  );
}

// ── BOOKING CALENDAR ─────────────────────────────────────────────
const TYPE_COLORS = { Suite:"#c9a84c", Double:"#8b5cf6", Single:"#3b82f6", Deluxe:"#10b981", Penthouse:"#f59e0b" };
const STATUS_COLORS_CAL = { confirmed:"#3b82f6", checkin:"#10b981", checkout:"#f59e0b", pending:"#8b5cf6", cancelled:"#ef4444" };

function BookingCalendar({ reservations, rooms, clients, settings }) {
  const t = useLang();
  const now = new Date();
  const [year,setYear] = useState(now.getFullYear());
  const [month,setMonth] = useState(now.getMonth());
  const [tooltip,setTooltip] = useState(null);
  const [selRoom,setSelRoom] = useState("all");
  const cur = CURRENCIES[settings.currency] || CURRENCIES.USD;

  const daysInMonth = new Date(year, month+1, 0).getDate();
  const days = Array.from({length: daysInMonth}, (_,i)=> i+1);
  const displayRooms = selRoom === "all" ? rooms : rooms.filter(r => r.id === selRoom);
  const pad = n => String(n).padStart(2,"0");
  const dateStr = d => `${year}-${pad(month+1)}-${pad(d)}`;

  const getResForRoomDay = (roomId, day) => {
    const ds = dateStr(day);
    return reservations.find(r => r.roomId === roomId && r.checkIn <= ds && r.checkOut > ds && r.status !== "cancelled");
  };

  const buildSpans = (roomId) => {
    const spans = [];
    let i = 1;
    while (i <= daysInMonth) {
      const res = getResForRoomDay(roomId, i);
      if (res) {
        const resEnd = new Date(res.checkOut);
        const monthEnd = new Date(year, month+1, 0);
        const end = resEnd < monthEnd ? resEnd.getDate() : daysInMonth;
        const len = end - i + (resEnd.getDate() === end && resEnd.getMonth() === month ? 0 : 1);
        spans.push({ day: i, len: Math.max(1, len), res });
        i += Math.max(1, len);
      } else {
        spans.push({ day: i, len: 1, res: null });
        i++;
      }
    }
    return spans;
  };

  const today = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  const totalCells = rooms.length * daysInMonth;
  const occupied = rooms.reduce((acc, r) => acc + days.filter(d => !!getResForRoomDay(r.id, d)).length, 0);
  const occupancyPct = Math.round(occupied / totalCells * 100);
  const monthRevenue = reservations.filter(r => {
    if (r.status === "cancelled") return false;
    const ci = new Date(r.checkIn), co = new Date(r.checkOut);
    const ms = new Date(year, month, 1), me = new Date(year, month+1, 0);
    return ci <= me && co >= ms;
  }).reduce((a,r) => a + (r.total||0), 0);

  const CELL_W = 30;

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:20}}>
        {[
          {icon:"📅",label:t.month,val:`${t.monthsFull[month]} ${year}`,col:GOLD},
          {icon:"📊",label:t.occupancyRate,val:`${occupancyPct}%`,col:occupancyPct>70?"#10b981":occupancyPct>40?"#f59e0b":"#ef4444"},
          {icon:"🛏️",label:t.nightsSold,val:`${occupied}`,col:"#8b5cf6"},
          {icon:"💰",label:t.monthRevenue,val:`${cur.symbol}${(monthRevenue*cur.rate).toFixed(0)}`,col:"#10b981"},
        ].map((s,i)=>(
          <div key={i} style={{background:CARD2,border:`1px solid rgba(255,255,255,0.05)`,borderRadius:10,padding:"12px 15px",borderLeft:`3px solid ${s.col}`}}>
            <div style={{fontSize:17,marginBottom:3}}>{s.icon}</div>
            <div style={{fontSize:18,fontWeight:700,color:s.col,fontFamily:FONT_DISPLAY}}>{s.val}</div>
            <div style={{fontSize:10,color:"#475569",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}}
            style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 12px",color:GOLD,cursor:"pointer",fontSize:16,fontFamily:FONT_BODY}}>‹</button>
          <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 18px",color:"#1e293b",fontSize:13,fontWeight:600,fontFamily:FONT_DISPLAY,minWidth:160,textAlign:"center"}}>
            {t.monthsFull[month]} {year}
          </div>
          <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}}
            style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 12px",color:GOLD,cursor:"pointer",fontSize:16,fontFamily:FONT_BODY}}>›</button>
        </div>
        <button onClick={()=>{setYear(now.getFullYear());setMonth(now.getMonth());}}
          style={{background:"rgba(201,168,76,0.1)",border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 14px",color:GOLD,cursor:"pointer",fontSize:12,fontFamily:FONT_BODY}}>
          {t.todayBtn}
        </button>
        <select value={selRoom} onChange={e=>setSelRoom(e.target.value)}
          style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 12px",color:"#1e293b",fontSize:12,outline:"none",cursor:"pointer",fontFamily:FONT_BODY}}>
          <option value="all">{t.allRooms}</option>
          {rooms.map(r=><option key={r.id} value={r.id}>{r.id} — {r.type}</option>)}
        </select>
      </div>

      <div style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <div style={{minWidth: 180 + daysInMonth * CELL_W}}>
            <div style={{display:"flex",borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
              <div style={{width:180,flexShrink:0,padding:"10px 14px",fontSize:10,color:"#475569",letterSpacing:1,borderRight:`1px solid rgba(255,255,255,0.06)`,background:"rgba(0,0,0,0.2)"}}>
                {t.room}
              </div>
              {days.map(d=>{
                const ds = dateStr(d);
                const isToday = ds === today;
                const dow = new Date(year,month,d).getDay();
                const isWeekend = dow===0||dow===6;
                return (
                  <div key={d} style={{width:CELL_W,flexShrink:0,textAlign:"center",padding:"6px 0",fontSize:10,borderRight:`1px solid rgba(255,255,255,0.04)`,background:isToday?"rgba(201,168,76,0.15)":isWeekend?"rgba(255,255,255,0.02)":"transparent",borderBottom:isToday?`2px solid ${GOLD}`:"none",boxSizing:"border-box"}}>
                    <div style={{color:isToday?GOLD:isWeekend?"#6b7280":"#475569",fontWeight:isToday?700:400}}>{d}</div>
                    <div style={{color:isToday?GOLD:"#334155",fontSize:8}}>{t.days[dow]}</div>
                  </div>
                );
              })}
            </div>
            {displayRooms.map((room,ri)=>{
              const spans = buildSpans(room.id);
              const tCol = TYPE_COLORS[room.type]||GOLD;
              return (
                <div key={room.id} style={{display:"flex",alignItems:"stretch",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:ri%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                  <div style={{width:180,flexShrink:0,padding:"8px 14px",borderRight:`1px solid rgba(255,255,255,0.06)`,display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:tCol,flexShrink:0}}/>
                    <div>
                      <div style={{color:"#1e293b",fontWeight:600,fontSize:12}}>{room.id}</div>
                      <div style={{color:tCol,fontSize:10}}>{room.type} · ${room.price}/n</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",flex:1,position:"relative",height:46}}>
                    {spans.map((span,si)=>{
                      if (!span.res) {
                        return Array.from({length:span.len},(_,li)=>{
                          const d = span.day+li;
                          const ds = dateStr(d);
                          const isToday = ds===today;
                          return <div key={`${si}-${li}`} style={{width:CELL_W,flexShrink:0,height:"100%",borderRight:`1px solid rgba(255,255,255,0.03)`,boxSizing:"border-box",background:isToday?"rgba(201,168,76,0.07)":"transparent"}}/>;
                        });
                      }
                      const res = span.res;
                      const client = clients.find(c=>c.id===res.clientId);
                      const col = STATUS_COLORS_CAL[res.status]||"#3b82f6";
                      const label = client?.name || res.roomId;
                      return (
                        <div key={si} style={{width: span.len * CELL_W - 3,flexShrink:0,height:32,borderRadius:6,background:`linear-gradient(135deg,${col}dd,${col}99)`,border:`1px solid ${col}`,display:"flex",alignItems:"center",padding:"0 7px",margin:"0 1px",cursor:"pointer",position:"relative",zIndex:2,overflow:"hidden",transition:"filter 0.15s",boxSizing:"border-box",boxShadow:`0 2px 8px ${col}44`}}
                          onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.2)";const rect=e.currentTarget.getBoundingClientRect();setTooltip({res,client,room,rect});}}
                          onMouseLeave={e=>{e.currentTarget.style.filter="none";setTooltip(null);}}>
                          <span style={{color:"#fff",fontSize:10,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textShadow:"0 1px 3px rgba(0,0,0,0.5)",fontFamily:FONT_BODY}}>
                            {span.len > 2 ? label : span.len === 2 ? label.split(" ")[0] : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {tooltip && (
        <div style={{position:"fixed",top:tooltip.rect.top-120,left:tooltip.rect.left,background:`linear-gradient(135deg,${CARD},#0d1520)`,border:`1px solid rgba(201,168,76,0.3)`,borderRadius:10,padding:"12px 16px",zIndex:9000,minwidth:260,boxShadow:`0 12px 40px rgba(0,0,0,0.6)`,pointerEvents:"none"}}>
          <div style={{color:GOLD,fontWeight:700,fontSize:13,fontFamily:FONT_DISPLAY,marginBottom:8}}>
            🛏️ {tooltip.room.id} — {tooltip.room.type}
          </div>
          {[
            ["👤",tooltip.client?.name||"—"],
            ["📅",`${tooltip.res.checkIn} → ${tooltip.res.checkOut}`],
            ["🌙",`${tooltip.res.nights} ${t.nights}`],
            ["💰",`${cur.symbol}${((tooltip.res.total||0)*cur.rate).toFixed(0)}`],
          ].map(([ico,val])=>(
            <div key={ico} style={{display:"flex",gap:7,fontSize:11,color:"#94a3b8",marginBottom:4}}>
              <span>{ico}</span><span style={{color:"#d1d5db"}}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── AI ASSISTANT ─────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon:"💰", text:"Quel est le chiffre d'affaires de ce mois ?" },
  { icon:"🛏️", text:"Combien de chambres sont occupées aujourd'hui ?" },
  { icon:"📋", text:"Quelles sont les réservations non payées ?" },
  { icon:"👥", text:"Combien de clients avons-nous en total ?" },
  { icon:"🧑‍💼", text:"Quel est l'effectif du personnel actif ?" },
  { icon:"📈", text:"Quelle est la chambre la plus rentable ?" },
  { icon:"🔔", text:"Y a-t-il des arrivées ou départs aujourd'hui ?" },
  { icon:"💡", text:"Donne-moi des conseils pour améliorer le taux d'occupation." },
];

function buildContext(data) {
  const { reservations, clients, rooms, staff, settings, today } = data;
  const cur = CURRENCIES[settings.currency] || CURRENCIES.USD;
  const activeRes = reservations.filter(r => r.status !== "cancelled");
  const occupiedRooms = reservations.filter(r => r.checkIn <= today && r.checkOut > today && ["confirmed","checkin"].includes(r.status));
  const todayIns  = reservations.filter(r => r.checkIn === today && r.status !== "cancelled");
  const todayOuts = reservations.filter(r => r.checkOut === today && r.status !== "cancelled");
  const unpaid    = reservations.filter(r => (r.paymentStatus||"unpaid") === "unpaid" && r.status !== "cancelled");
  const revenue   = activeRes.reduce((a,r) => a + (r.total||0), 0);
  const collected = activeRes.reduce((a,r) => a + (r.amountPaid||0), 0);
  const thisMonth = new Date().getMonth();
  const thisYear  = new Date().getFullYear();
  const monthRes  = activeRes.filter(r => { const d = new Date(r.checkIn); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; });
  const monthRevenue = monthRes.reduce((a,r) => a + (r.total||0), 0);

  return `Tu es l'assistant IA du gestionnaire de l'hôtel "${settings.hotelName}".
Tu as accès aux données RÉELLES et À JOUR de l'hôtel. Réponds en darija marocaine (ou français si demandé) de façon concise, précise et utile.

=== DONNÉES EN TEMPS RÉEL (${today}) ===
🏨 HÔTEL: ${settings.hotelName} | Devise: ${cur.symbol}
🛏️ CHAMBRES: Total: ${rooms.length} | Occupées: ${occupiedRooms.length}/${rooms.length} (${Math.round(occupiedRooms.length/rooms.length*100)}%) | Disponibles: ${rooms.length - occupiedRooms.length}
📋 RÉSERVATIONS: Actives: ${activeRes.length} | Arrivées aujourd'hui: ${todayIns.length} | Départs: ${todayOuts.length} | Non payées: ${unpaid.length} | Ce mois: ${monthRes.length}
💰 FINANCES: Total: ${cur.symbol}${(revenue*cur.rate).toFixed(0)} | Ce mois: ${cur.symbol}${(monthRevenue*cur.rate).toFixed(0)} | Encaissé: ${cur.symbol}${(collected*cur.rate).toFixed(0)} | Reste: ${cur.symbol}${((revenue-collected)*cur.rate).toFixed(0)}
👥 CLIENTS: ${clients.length} enregistrés
🧑‍💼 PERSONNEL: ${staff.length} total | ${staff.filter(e=>e.status==="active").length} actifs | ${staff.filter(e=>e.status==="leave").length} en congé`;
}

function TypingDots() {
  return (
    <div style={{display:"flex",gap:5,alignItems:"center",padding:"4px 0"}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:7,height:7,borderRadius:"50%",background:GOLD,animation:`bounce 1.2s ${i*0.25}s ease infinite`}}/>
      ))}
    </div>
  );
}

function AIAssistant({ reservations, clients, rooms, staff, settings }) {
  const t = useLang();
  const [messages, setMessages] = useState([{
    role:"assistant",
    content:`${t.assistantWelcome} **${settings.hotelName}** 🏨\n\n${t.assistantWelcome2}`,
    time: new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    const userMsg = { role:"user", content:q, time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);
    try {
      const systemCtx = buildContext({ reservations, clients, rooms, staff, settings, today });
      const apiMessages = history.filter(m => m.role === "user" || m.role === "assistant").map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemCtx, messages: apiMessages }),
      });
      const data = await res.json();
      const reply = data.content?.map(b=>b.text||"").join("") || "Désolé, erreur.";
      setMessages(p=>[...p,{role:"assistant",content:reply,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}]);
    } catch(e) {
      setMessages(p=>[...p,{role:"assistant",content:"❌ Erreur de connexion.",time:""}]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const fmt = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c9a84c">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>');

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)",gap:0}}>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {[
          {icon:"🛏️",label:t.occupation,val:`${reservations.filter(r=>r.checkIn<=today&&r.checkOut>today&&["confirmed","checkin"].includes(r.status)).length}/${rooms.length}`},
          {icon:"📋",label:t.reservationsLabel,val:reservations.filter(r=>r.status!=="cancelled").length},
          {icon:"👥",label:t.clientsLabel,val:clients.length},
          {icon:"🧑‍💼",label:t.activeStaff,val:staff.filter(e=>e.status==="active").length},
        ].map((s,i)=>(
          <div key={i} style={{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 14px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>{s.icon}</span>
            <div>
              <div style={{color:GOLD,fontWeight:700,fontSize:14}}>{s.val}</div>
              <div style={{color:"#475569",fontSize:9,letterSpacing:0.5}}>{s.label}</div>
            </div>
          </div>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:9,padding:"8px 14px"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#10b981",animation:"pulse 2s infinite"}}/>
          <span style={{color:"#10b981",fontSize:12,fontWeight:500}}>{t.aiConnected}</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"scroll",display:"flex",flexDirection:"column",gap:16,padding:"20px",background:CARD2,border:`1px solid ${BORDER}`,borderRadius:14,marginBottom:12}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}}>
            <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,background:m.role==="user"?`linear-gradient(135deg,${GOLD},#a8832a)`:"linear-gradient(135deg,#1e3a5f,#0f2440)",border:m.role==="assistant"?`1px solid rgba(201,168,76,0.3)`:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:m.role==="user"?14:18,fontWeight:700,color:m.role==="user"?"#080c10":"#fff"}}>
              {m.role==="user"?"👤":"🤖"}
            </div>
            <div style={{maxWidth:"75%",display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:4}}>
              <div style={{background:m.role==="user"?`linear-gradient(135deg,${GOLD},#b8922a)`:"rgba(255,255,255,0.04)",border:m.role==="assistant"?`1px solid rgba(255,255,255,0.07)`:"none",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"12px 16px",color:m.role==="user"?"#ffffff":"#1e293b",fontSize:13,lineHeight:1.7,fontFamily:FONT_BODY}}>
                {m.role==="assistant" ? <div dangerouslySetInnerHTML={{__html:fmt(m.content)}}/> : m.content}
              </div>
              {m.time&&<div style={{fontSize:10,color:"#334155",letterSpacing:0.3}}>{m.time}</div>}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#1e3a5f,#0f2440)",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
            <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid rgba(255,255,255,0.07)`,borderRadius:"14px 14px 14px 4px",padding:"14px 18px"}}><TypingDots/></div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
        {QUICK_PROMPTS.map((p,i)=>(
          <button key={i} onClick={()=>send(p.text)} disabled={loading}
            style={{background:"#f8fafc",border:`1px solid #cbd5e1`,borderRadius:20,padding:"5px 12px",color:"#64748b",fontSize:11,cursor:"pointer",fontFamily:FONT_BODY,transition:"all 0.15s",display:"flex",alignItems:"center",gap:4}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.color=GOLD;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color="#ffffff";}}>
            {p.icon} {p.text.length>30?p.text.slice(0,30)+"...":p.text}
          </button>
        ))}
      </div>

      <div style={{display:"flex",gap:8}}>
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder={t.askPlaceholder} disabled={loading}
          style={{flex:1,background:CARD2,border:`1px solid ${loading?"rgba(255,255,255,0.05)":BORDER}`,borderRadius:11,padding:"13px 18px",color:"#1e293b",fontSize:13,outline:"none",fontFamily:FONT_BODY,transition:"all 0.2s"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()}
          style={{background:loading||!input.trim()?CARD2:`linear-gradient(135deg,${GOLD},#b8922a)`,border:`1px solid ${loading||!input.trim()?"rgba(255,255,255,0.07)":"transparent"}`,borderRadius:11,padding:"13px 20px",color:loading||!input.trim()?"#334155":"#080c10",fontWeight:700,fontSize:18,cursor:loading||!input.trim()?"not-allowed":"pointer",transition:"all 0.2s"}}>
          {loading?"⏳":"➤"}
        </button>
      </div>
    </div>
  );
}

// ── HOTEL APP ─────────────────────────────────────────────────────
function ExpiredPage({ onLogout }) {
  return (
    <div style={{minHeight:"100vh",background:"#0f141c",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <div style={{textAlign:"center",padding:40,maxWidth:480}}>
        <div style={{fontSize:64,marginBottom:20}}>⏰</div>
        <h2 style={{color:"#fff",fontSize:26,fontWeight:700,marginBottom:12}}>Période d'essai terminée</h2>
        <p style={{color:"#6b7280",fontSize:15,marginBottom:8}}>Votre essai gratuit de 14 jours est expiré.</p>
        <p style={{color:"#6b7280",fontSize:14,marginBottom:32}}>Contactez-nous pour continuer à utiliser HotelPro.</p>
        <div style={{background:"#111",border:"1px solid #222",borderRadius:12,padding:24,marginBottom:24}}>
          <div style={{color:"#10b981",fontSize:14,fontWeight:600,marginBottom:8}}>📞 Contactez-nous</div>
          <div style={{color:"#ccc",fontSize:13}}>WhatsApp: +212 6XX XXX XXX</div>
          <div style={{color:"#ccc",fontSize:13,marginTop:4}}>Email: contact@hotelpro.ma</div>
        </div>
        <button onClick={onLogout} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"10px 24px",color:"#ef4444",cursor:"pointer",fontSize:13,fontWeight:600}}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

function ExpiredPage({ onLogout }) {
  return (
    <div style={{minHeight:"100vh",background:"#0f141c",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <div style={{textAlign:"center",padding:40,maxWidth:480}}>
        <div style={{fontSize:64,marginBottom:20}}>⏰</div>
        <h2 style={{color:"#fff",fontSize:26,fontWeight:700,marginBottom:12}}>Période d'essai terminée</h2>
        <p style={{color:"#6b7280",fontSize:15,marginBottom:8}}>Votre essai gratuit de 14 jours est expiré.</p>
        <p style={{color:"#6b7280",fontSize:14,marginBottom:32}}>Contactez-nous pour continuer à utiliser HotelPro.</p>
        <div style={{background:"#111",border:"1px solid #222",borderRadius:12,padding:24,marginBottom:24}}>
          <div style={{color:"#10b981",fontSize:14,fontWeight:600,marginBottom:8}}>📞 Contactez-nous</div>
          <div style={{color:"#ccc",fontSize:13}}>WhatsApp: +212 6XX XXX XXX</div>
          <div style={{color:"#ccc",fontSize:13,marginTop:4}}>Email: contact@hotelpro.ma</div>
        </div>
        <button onClick={onLogout} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"10px 24px",color:"#ef4444",cursor:"pointer",fontSize:13,fontWeight:600}}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

function HotelApp({ user, onLogout, lang, setLang }) {
  const uid=user.id;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const [page,setPage]=useState("dashboard");
  const [res,setRes]=useState([]);
  const [clients,setClients]=useState([]);
  const [rooms,setRooms]=useState(INIT_ROOMS);
  const [staff,setStaff]=useState([]);
  const [settings,setSettings]=useState({hotelName:user.hotelName||"Mon Hôtel",currency:"USD"});
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    Promise.all([
      sget(`saas:d:${user.username}:res`),sget(`saas:d:${user.username}:clients`),
      sget(`saas:d:${user.username}:rooms`),sget(`saas:d:${user.username}:settings`),
      sget(`saas:d:${user.username}:staff`),
    ]).then(([r,c,rm,s,st])=>{
      if(r)setRes(r); if(c)setClients(c);
      if(rm)setRooms(rm); else sset(`saas:d:${user.username}:rooms`, INIT_ROOMS); if(s)setSettings(s);
      if(st)setStaff(st);
      setReady(true);
    });
  },[user.username]);

  const saveRes=useCallback(d=>{setRes(d);sset(`saas:d:${user.username}:res`,d);},[user.username]);
  const saveCli=useCallback(d=>{setClients(d);sset(`saas:d:${user.username}:clients`,d);},[user.username]);
  const saveRooms=useCallback(d=>{setRooms(d);sset(`saas:d:${user.username}:rooms`,d);},[user.username]);
  const saveStaff=useCallback(d=>{setStaff(d);sset(`saas:d:${user.username}:staff`,d);},[user.username]);
  const saveSettings=useCallback(d=>{setSettings(d);sset(`saas:d:${user.username}:settings`,d);},[user.username]);

  const today=new Date().toISOString().split("T")[0];
  const notifCount=[
    ...res.filter(r=>r.checkIn===today&&r.status!=="cancelled"),
    ...res.filter(r=>r.checkOut===today&&r.status!=="cancelled"),
    ...res.filter(r=>(r.paymentStatus||"unpaid")==="unpaid"&&r.status!=="cancelled"),
  ].length;

  const NAV=[
    {id:"dashboard",   icon:"📊", label:t.dashboard},
    {id:"calendar",    icon:"📅", label:t.calendar},
    {id:"reservations",icon:"📋", label:t.reservations},
    {id:"clients",     icon:"👥", label:t.clients},
    {id:"rooms",       icon:"🏨", label:t.rooms},
    {id:"staff",       icon:"🧑‍💼", label:t.staff},
    {id:"assistant",   icon:"🤖", label:t.assistant},
    {id:"revenue",     icon:"📈", label:t.revenue},
    {id:"settings",    icon:"⚙️", label:t.settings},
  ];

  if(!ready) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:DARK,gap:16}}>
      <div style={{fontSize:40,animation:"pulse 1.5s ease infinite"}}>🏨</div>
      <div style={{color:GOLD,fontSize:18,fontFamily:FONT_DISPLAY,letterSpacing:2}}>HotelPro</div>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:GOLD,animation:`bounce 1.2s ${i*0.2}s ease infinite`}}/>)}
      </div>
    </div>
  );

  const toast = useToast();

  return (
    <LangCtx.Provider value={lang}>
      <div style={{display:"flex",height:"100vh",width:"100vw",background:DARK,fontFamily:FONT_BODY,overflow:"hidden",position:"fixed",top:0,left:0}}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          ::-webkit-scrollbar{width:5px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.25);border-radius:10px}
          select option{background:#ffffff;color:#1e293b}
          input::placeholder{color:rgba(100,116,139,0.6)}
          button{font-family:'DM Sans','Segoe UI',sans-serif}
          button:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
          button:active:not(:disabled){transform:translateY(0)}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
          @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.95)}}
          @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
        `}</style>

        {/* ── SIDEBAR ── */}
        <div style={{width:260,background:`linear-gradient(180deg,#1e3a8a 0%,#1d4ed8 100%)`,borderRight:`1px solid rgba(201,168,76,0.1)`,display:"flex",flexDirection:"column",flexShrink:0,position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`}}/>

          {/* Logo */}
          <div style={{padding:"26px 18px 20px",borderBottom:`1px solid rgba(255,255,255,0.05)`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,#f59e0b,#d97706)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"0 4px 12px rgba(245,158,11,0.4)"}}>🏨</div>
              <div>
                <div style={{color:"#f1f5f9",fontFamily:FONT_DISPLAY,fontSize:15,fontWeight:700,letterSpacing:0.5}}>{settings.hotelName}</div>
                <div style={{color:"#bfdbfe",fontSize:9,letterSpacing:2,marginTop:1}}>MANAGEMENT</div>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"7px 11px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${GOLD},#a8832a)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#080c10",flexShrink:0}}>
                {user.username[0].toUpperCase()}
              </div>
              <div style={{minWidth:0}}>
                <div style={{color:"#ffffff",textShadow:"0 1px 2px rgba(0,0,0,0.3)",fontSize:11,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.username}</div>
                <div style={{color:"#10b981",fontSize:9,letterSpacing:1}}>● ACTIF</div>
              </div>
            </div>
          </div>

          {/* Lang fo9 */}
          <div style={{padding:"12px 14px",borderBottom:`1px solid rgba(255,255,255,0.1)`}}>
            <LangSwitcher lang={lang} setLang={setLang}/>
          </div>
          {/* Nav */}
          <nav style={{flex:1,padding:"14px 10px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto",minHeight:0}}>
            {NAV.map(n=>{
              const active=page===n.id;
              return (
                <button key={n.id} onClick={()=>setPage(n.id)} style={{width:"100%",background:active?`linear-gradient(135deg,rgba(201,168,76,0.16),rgba(201,168,76,0.06))`:"transparent",border:active?`1px solid rgba(201,168,76,0.2)`:"1px solid transparent",borderRadius:10,padding:"10px 13px",color:"#ffffff",textShadow:"0 1px 2px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",gap:10,fontSize:13,fontWeight:active?600:400,cursor:"pointer",transition:"all 0.18s",textAlign:"left",position:"relative",letterSpacing:0.2}}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="#94a3b8";}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#ffffff";}}}>
                  {active && <div style={{position:"absolute",left:-10,top:"50%",transform:"translateY(-50%)",width:3,height:22,background:GOLD,borderRadius:2}}/>}
                  <span style={{fontSize:16,opacity:1,filter:"brightness(2)"}}>{n.icon}</span>
                  {n.label}
                  {n.id==="reservations"&&notifCount>0&&(
                    <span style={{marginLeft:"auto",background:"#ef4444",color:"#fff",borderRadius:20,padding:"2px 7px",fontSize:9,fontWeight:700}}>
                      {notifCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Language switcher + date */}
          <div style={{padding:"0 12px 18px",display:"flex",flexDirection:"column",gap:8,marginTop:"auto"}}>
            
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{flex:1,overflowY:"scroll",background:DARK,display:"flex",flexDirection:"column",width:"100%"}}>
          <div style={{padding:"18px 28px 0",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:`linear-gradient(180deg,rgba(201,168,76,0.02) 0%,transparent 100%)`,display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:16,flexShrink:0}}>
            <div>
              <h1 style={{color:"#1e293b",fontFamily:FONT_DISPLAY,fontSize:22,fontWeight:700,letterSpacing:0.5}}>
                {NAV.find(n=>n.id===page)?.icon} {NAV.find(n=>n.id===page)?.label}
              </h1>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {notifCount>0 && (
                <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"5px 12px",fontSize:11,color:"#ef4444",fontWeight:600}}>
                  🔔 {notifCount} alerte{notifCount>1?"s":""}
                </div>
              )}
            </div>
          </div>

          <div style={{flex:1,padding:"24px 28px",overflowY:"auto",animation:"fadeIn 0.25s ease"}}>
            {page==="calendar"     &&<BookingCalendar reservations={res} rooms={rooms} clients={clients} settings={settings}/>}
            {page==="dashboard"    &&<Dashboard reservations={res} clients={clients} rooms={rooms} settings={settings}/>}
            {page==="reservations" &&<ResPage reservations={res} clients={clients} rooms={rooms} settings={settings}
              onAdd={r=>{saveRes([r,...res]);toast(t.reservationAdded);}}
              onEdit={r=>{saveRes(res.map(x=>x.id===r.id?r:x));toast(t.reservationEdited,"info");}}
              onDelete={id=>{saveRes(res.filter(x=>x.id!==id));toast(t.reservationDeleted,"error");}}
              onField={(id,field,val)=>saveRes(res.map(x=>x.id===id?{...x,[field]:val}:x))}/>}
            {page==="clients"      &&<ClientsPage clients={clients} reservations={res} settings={settings}
              onAdd={c=>{saveCli([c,...clients]);toast(t.clientAdded);}}
              onEdit={c=>{saveCli(clients.map(x=>x.id===c.id?c:x));toast(t.clientEdited,"info");}}
              onDelete={id=>{saveCli(clients.filter(x=>x.id!==id));toast(t.clientDeleted,"error");}}/>}
            {page==="rooms"        &&<RoomsPage rooms={rooms} reservations={res}
              onUpdateRoom={(id,upd)=>saveRooms(rooms.map(r=>r.id===id?{...r,...upd}:r))}
              onAddRoom={newRoom=>{saveRooms([...rooms,newRoom]);toast(t.roomAdded);}}
              onDeleteRoom={id=>{saveRooms(rooms.filter(r=>r.id!==id));toast(t.roomDeleted,"error");}}/>}
            {page==="staff"        &&<StaffPage staff={staff}
              onAdd={e=>{saveStaff([e,...staff]);toast(t.employeeAdded);}}
              onEdit={e=>{saveStaff(staff.map(x=>x.id===e.id?e:x));toast(t.employeeEdited,"info");}}
              onDelete={id=>{saveStaff(staff.filter(x=>x.id!==id));toast(t.employeeDeleted,"error");}}
              onStatus={(id,status)=>saveStaff(staff.map(x=>x.id===id?{...x,status}:x))}/>}
            {page==="assistant"    &&<AIAssistant reservations={res} clients={clients} rooms={rooms} staff={staff} settings={settings}/>}
            {page==="revenue"      &&<RevenuePage reservations={res} settings={settings}/>}
            {page==="settings"     &&<SettingsPage settings={settings} user={user} onSave={s=>{saveSettings(s);toast(t.settingsSaved);}} onLogout={onLogout}/>}
          </div>
        </div>
      </div>
    </LangCtx.Provider>
  );
}

// ── ADMIN PANEL ──────────────────────────────────────────────────
function AdminPanel() {
  const [pwd, setPwd] = useState("");
  const [auth, setAuth] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const ADMIN_PWD = "hotelpro2024admin";

  const login = async () => {
    if (pwd !== ADMIN_PWD) return alert("Mot de passe incorrect!");
    setAuth(true);
    setLoading(true);
    const u = await sget("saas:users") || [];
    setUsers(u);
    setLoading(false);
  };

  if (!auth) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <div style={{background:"#111",border:"1px solid #333",borderRadius:16,padding:40,width:360,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🔐</div>
        <h2 style={{color:"#fff",marginBottom:8,fontSize:22}}>Admin Panel</h2>
        <p style={{color:"#666",fontSize:13,marginBottom:24}}>HotelPro Super Admin</p>
        <input type="password" placeholder="Mot de passe admin" value={pwd} onChange={e=>setPwd(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&login()}
          style={{width:"100%",background:"#1a1a1a",border:"1px solid #333",borderRadius:8,padding:"12px 14px",color:"#fff",fontSize:14,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>
        <button onClick={login} style={{width:"100%",background:"linear-gradient(135deg,#1e3a8a,#1d4ed8)",border:"none",borderRadius:8,padding:"12px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
          Connexion
        </button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",fontFamily:"'Inter',sans-serif",padding:32}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <div style={{fontSize:32}}>🔐</div>
          <div>
            <h1 style={{color:"#fff",margin:0,fontSize:24}}>Admin Panel</h1>
            <p style={{color:"#666",margin:0,fontSize:13}}>HotelPro · {users.length} hôtel(s) enregistré(s)</p>
          </div>
        </div>
        {loading ? <div style={{color:"#666",textAlign:"center",padding:60}}>Chargement...</div> :
        <div style={{display:"grid",gap:16}}>
          {users.map((u,i)=>(
            <div key={i} style={{background:"#111",border:"1px solid #222",borderRadius:12,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#1e3a8a,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:16}}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{color:"#fff",fontWeight:700,fontSize:15}}>@{u.username}</div>
                    <div style={{color:"#666",fontSize:12}}>🏨 {u.hotelName}</div>
                  </div>
                </div>
                <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:20,padding:"4px 12px",color:"#10b981",fontSize:11,fontWeight:600}}>
                  ● {u.plan||"pro"}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:12}}>
                {[["📧 Email",u.email||"—"],["📅 Inscrit",new Date(u.createdAt).toLocaleDateString("fr-FR")],["🔗 Booking",`/book/${u.username}`]].map(([k,v])=>(
                  <div key={k} style={{background:"#1a1a1a",borderRadius:8,padding:"8px 12px"}}>
                    <div style={{color:"#666",marginBottom:2}}>{k}</div>
                    <div style={{color:"#ccc"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [checking,setChecking]=useState(true);
  const [lang,setLang]=useState("fr");
  useEffect(()=>{
    fetch("https://ipapi.co/json/")
      .then(r=>r.json())
      .then(d=>{
        const map={"US":"en","CA":"en","GB":"en","AU":"en","IE":"en","NZ":"en","FR":"fr","BE":"fr","MA":"fr","DZ":"fr","TN":"fr","ES":"es","MX":"es","AR":"es","CO":"es","SA":"ar","AE":"ar","EG":"ar","QA":"ar"};
        const detected=map[d.country_code];
        if(detected&&!localStorage.getItem("langOverride"))setLang(detected);
      }).catch(()=>{});
  },[]);

  useEffect(()=>{
    sget("saas:session",false).then(s=>{ if(s){setUser(s);if(s.lang)setLang(s.lang);} setChecking(false); });
  },[]);

  const handleLogin=async(u)=>{ setUser(u); if(u.lang)setLang(u.lang); await sset("saas:session",u,false); };
  const handleLogout=async()=>{ setUser(null); await sset("saas:session",null,false); };

  if(checking) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:DARK,gap:14}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;600&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}`}</style>
      <div style={{fontSize:44,animation:"pulse 1.5s ease infinite"}}>🏨</div>
      <div style={{color:GOLD,fontSize:20,fontFamily:FONT_DISPLAY,letterSpacing:3}}>HotelPro</div>
    </div>
  );

  if(window.location.pathname === "/admin") return <AdminPanel/>;
  if(window.location.pathname.startsWith("/book/")) {
  const hotelId = window.location.pathname.split("/")[2];
  return <BookingPage hotelId={hotelId}/>;
}
if(!user) return <ToastProvider><AuthScreen onLogin={handleLogin}/></ToastProvider>;
  if(user && user.expiresAt && new Date(user.expiresAt) < new Date() && user.plan==="trial") return <ExpiredPage onLogout={handleLogout}/>;
  return (
    <ToastProvider>
      <HotelApp user={user} onLogout={handleLogout} lang={lang} setLang={c=>{setLang(c);localStorage.setItem("langOverride",c);}}/>
    </ToastProvider>
  );
}

