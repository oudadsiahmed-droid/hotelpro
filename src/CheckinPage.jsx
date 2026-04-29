import { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function sget(k){try{const r=await getDoc(doc(db,"hotelpro",k));return r.exists()?r.data().val:null;}catch{return null;}}
async function sset(k,d){try{await setDoc(doc(db,"hotelpro",k),{val:d});}catch{}}

export default function CheckinPage({ hotelId, resId }) {
  const [hotel, setHotel] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);
  const [signing, setSigning] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [cinPhoto, setCinPhoto] = useState("");

  const [form, setForm] = useState({
    fullName:"", nationality:"", cin:"", phone:"", email:"",
    address:"", birthDate:"", emergencyContact:""
  });

  useEffect(()=>{
    sget(`saas:d:${hotelId}:settings`).then(s=>{ if(s) setHotel(s); });
    if(resId) {
      sget(`saas:d:${hotelId}:res`).then(reservations=>{
        const r = (reservations||[]).find(r=>r.id===resId);
        if(r) setReservation(r);
      });
    }
  },[hotelId, resId]);

  // Signature canvas
  useEffect(()=>{
    if(step!==3) return;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    let drawing = false;
    let lastX = 0, lastY = 0;
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      if(e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const start = (e) => { drawing=true; const p=getPos(e); lastX=p.x; lastY=p.y; };
    const draw = (e) => {
      if(!drawing) return;
      e.preventDefault();
      const p = getPos(e);
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y); ctx.stroke();
      lastX=p.x; lastY=p.y; setHasSig(true);
    };
    const stop = () => { drawing=false; };
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("touchstart", start, {passive:false});
    canvas.addEventListener("touchmove", draw, {passive:false});
    canvas.addEventListener("touchend", stop);
    return ()=>{
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stop);
    };
  },[step]);

  const clearSig = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const handleCin = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    if(file.size > 3*1024*1024){ alert("Max 3MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => setCinPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if(!form.fullName||!form.cin||!form.phone) return alert("Remplissez les champs obligatoires!");
    setLoading(true);
    const signature = hasSig ? canvasRef.current.toDataURL() : null;
    const checkinData = {
      id: Date.now().toString(),
      resId, hotelId,
      ...form,
      cinPhoto,
      signature,
      checkinDate: new Date().toISOString(),
      status: "completed"
    };
    const existing = await sget(`saas:d:${hotelId}:checkins`) || [];
    await sset(`saas:d:${hotelId}:checkins`, [checkinData, ...existing]);
    if(resId) {
      const reservations = await sget(`saas:d:${hotelId}:res`) || [];
      await sset(`saas:d:${hotelId}:res`, reservations.map(r=>r.id===resId?{...r,checkinDone:true,checkinId:checkinData.id}:r));
    }
    setLoading(false);
    setDone(true);
  };

  if(done) return (
    <div style={{minHeight:"100vh",background:"#faf5ee",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:20}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px"}}>✅</div>
        <h2 style={{color:"#1e3a8a",fontSize:26,marginBottom:8}}>Check-in complété!</h2>
        <p style={{color:"#64748b",fontSize:14,marginBottom:20}}>{hotel?.hotelName} vous souhaite la bienvenue 🎉</p>
        {reservation && (
          <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:20}}>
            <div style={{color:"#1e3a8a",fontWeight:700,fontSize:16,marginBottom:12}}>🛏️ Votre réservation</div>
            {[["Chambre",reservation.roomId],["Arrivée",reservation.checkIn],["Départ",reservation.checkOut],["Durée",`${reservation.nights} nuit(s)`]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0e8dc",fontSize:13}}>
                <span style={{color:"#64748b"}}>{k}</span><span style={{fontWeight:600,color:"#1e293b"}}>{v}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{color:"#10b981",fontSize:13,fontWeight:600}}>📱 Présentez cette confirmation à la réception</div>
      </div>
    </div>
  );

  const STEPS = ["Informations","Documents","Signature","Confirmation"];

  return (
    <div style={{minHeight:"100vh",background:"#faf5ee",fontFamily:"Georgia,serif",padding:"20px 16px"}}>
      {/* Header */}
      <div style={{maxWidth:560,margin:"0 auto"}}>
        {hotel?.heroUrl && <img src={hotel.heroUrl} alt="hotel" style={{width:"100%",height:140,objectFit:"cover",borderRadius:16,marginBottom:20}}/>}
        <div style={{textAlign:"center",marginBottom:28}}>
          <h1 style={{color:"#1e3a8a",fontSize:26,fontWeight:700,margin:"0 0 4px"}}>{hotel?.hotelName||hotelId}</h1>
          <p style={{color:"#c9a84c",fontSize:11,letterSpacing:3,margin:0}}>CHECK-IN EN LIGNE</p>
        </div>

        {/* Steps */}
        <div style={{display:"flex",justifyContent:"center",gap:0,marginBottom:28}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:step>i+1?"#10b981":step===i+1?"#1e3a8a":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",color:step>=i+1?"#fff":"#9ca3af",fontSize:13,fontWeight:700,transition:"all 0.3s"}}>
                  {step>i+1?"✓":i+1}
                </div>
                <div style={{fontSize:9,color:step===i+1?"#1e3a8a":"#9ca3af",letterSpacing:0.5,textAlign:"center",maxWidth:60}}>{s}</div>
              </div>
              {i<STEPS.length-1 && <div style={{width:40,height:2,background:step>i+1?"#10b981":"#e2e8f0",margin:"0 4px",marginBottom:18,transition:"all 0.3s"}}/>}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{background:"#fff",borderRadius:20,padding:"28px 24px",boxShadow:"0 4px 30px rgba(0,0,0,0.08)"}}>

          {/* Step 1 — Informations */}
          {step===1 && (
            <div>
              <h3 style={{color:"#1e3a8a",fontSize:18,margin:"0 0 20px"}}>👤 Informations personnelles</h3>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  ["Nom complet *","fullName","text","Mohammed El Fassi"],
                  ["Nationalité *","nationality","text","Marocaine"],
                  ["CIN / Passeport *","cin","text","AB123456"],
                  ["Téléphone *","phone","tel","+212 6XX XXX XXX"],
                  ["Email","email","email","contact@email.com"],
                  ["Adresse","address","text","Rue Mohammed V, Casablanca"],
                  ["Date de naissance","birthDate","date",""],
                  ["Contact urgence","emergencyContact","text","Nom + téléphone"],
                ].map(([label,key,type,placeholder])=>(
                  <div key={key}>
                    <label style={{fontSize:10,color:"#64748b",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:5}}>{label}</label>
                    <input type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                      placeholder={placeholder}
                      style={{width:"100%",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"11px 14px",color:"#1e293b",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif"}}/>
                  </div>
                ))}
              </div>
              <button onClick={()=>{if(!form.fullName||!form.cin||!form.phone){alert("Remplissez les champs obligatoires (*)");return;}setStep(2);}}
                style={{width:"100%",background:"linear-gradient(135deg,#1e3a8a,#2d4fa8)",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",marginTop:20,fontFamily:"Georgia,serif"}}>
                Continuer →
              </button>
            </div>
          )}

          {/* Step 2 — Documents */}
          {step===2 && (
            <div>
              <h3 style={{color:"#1e3a8a",fontSize:18,margin:"0 0 8px"}}>📸 Photo CIN / Passeport</h3>
              <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>Prenez une photo de votre pièce d'identité (optionnel mais recommandé)</p>
              {cinPhoto ? (
                <div style={{position:"relative",borderRadius:12,overflow:"hidden",marginBottom:16}}>
                  <img src={cinPhoto} alt="CIN" style={{width:"100%",maxHeight:200,objectFit:"contain",background:"#f8fafc"}}/>
                  <button onClick={()=>setCinPhoto("")} style={{position:"absolute",top:8,right:8,background:"rgba(239,68,68,0.9)",border:"none",borderRadius:20,padding:"4px 10px",color:"#fff",fontSize:11,cursor:"pointer"}}>Supprimer</button>
                </div>
              ) : (
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:140,background:"#f8fafc",border:"2px dashed #e2e8f0",borderRadius:12,cursor:"pointer",gap:8,marginBottom:16}}>
                  <span style={{fontSize:36}}>📷</span>
                  <span style={{fontSize:13,color:"#64748b"}}>Appuyez pour prendre une photo</span>
                  <span style={{fontSize:11,color:"#9ca3af"}}>JPG, PNG — Max 3MB</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleCin} style={{display:"none"}}/>
                </label>
              )}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setStep(1)} style={{flex:1,background:"#f1f5f9",border:"none",borderRadius:12,padding:"13px",color:"#64748b",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif"}}>← Retour</button>
                <button onClick={()=>setStep(3)} style={{flex:2,background:"linear-gradient(135deg,#1e3a8a,#2d4fa8)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif"}}>Continuer →</button>
              </div>
            </div>
          )}

          {/* Step 3 — Signature */}
          {step===3 && (
            <div>
              <h3 style={{color:"#1e3a8a",fontSize:18,margin:"0 0 8px"}}>✍️ Signature digitale</h3>
              <p style={{color:"#64748b",fontSize:13,marginBottom:16}}>Signez dans le cadre ci-dessous avec votre doigt ou souris</p>
              <div style={{border:"2px solid #e2e8f0",borderRadius:12,overflow:"hidden",marginBottom:12,background:"#f8fafc"}}>
                <canvas ref={canvasRef} width={480} height={160} style={{width:"100%",height:160,display:"block",cursor:"crosshair"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
                <button onClick={clearSig} style={{background:"#fee2e2",border:"none",borderRadius:8,padding:"6px 14px",color:"#ef4444",fontSize:12,cursor:"pointer"}}>🗑 Effacer</button>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setStep(2)} style={{flex:1,background:"#f1f5f9",border:"none",borderRadius:12,padding:"13px",color:"#64748b",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif"}}>← Retour</button>
                <button onClick={()=>setStep(4)} style={{flex:2,background:"linear-gradient(135deg,#1e3a8a,#2d4fa8)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif"}}>Continuer →</button>
              </div>
            </div>
          )}

          {/* Step 4 — Confirmation */}
          {step===4 && (
            <div>
              <h3 style={{color:"#1e3a8a",fontSize:18,margin:"0 0 20px"}}>✅ Confirmation</h3>
              <div style={{background:"#faf5ee",borderRadius:12,padding:"16px",marginBottom:20}}>
                {[["👤 Nom",form.fullName],["🪪 CIN",form.cin],["📞 Téléphone",form.phone],["🌍 Nationalité",form.nationality],["📧 Email",form.email||"—"]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #e8ddd0",fontSize:13}}>
                    <span style={{color:"#64748b"}}>{k}</span><span style={{fontWeight:600,color:"#1e293b"}}>{v}</span>
                  </div>
                ))}
                {cinPhoto && <div style={{marginTop:12,fontSize:12,color:"#10b981"}}>✅ Photo CIN ajoutée</div>}
                {hasSig && <div style={{fontSize:12,color:"#10b981",marginTop:4}}>✅ Signature ajoutée</div>}
              </div>
              <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"12px 14px",fontSize:12,color:"#1e3a8a",marginBottom:20}}>
                En soumettant ce formulaire, je confirme l'exactitude des informations fournies.
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setStep(3)} style={{flex:1,background:"#f1f5f9",border:"none",borderRadius:12,padding:"13px",color:"#64748b",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif"}}>← Retour</button>
                <button onClick={submit} disabled={loading} style={{flex:2,background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif",opacity:loading?0.7:1}}>
                  {loading?"⏳ Envoi...":"✅ Confirmer le check-in"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}