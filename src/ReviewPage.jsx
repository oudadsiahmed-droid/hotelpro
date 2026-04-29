import { useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function sget(k){try{const r=await getDoc(doc(db,"hotelpro",k));return r.exists()?r.data().val:null;}catch{return null;}}
async function sset(k,d){try{await setDoc(doc(db,"hotelpro",k),{val:d});}catch{}}

export default function ReviewPage({ hotelId }) {
  const [hotel, setHotel] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useState(()=>{
    sget(`saas:d:${hotelId}:settings`).then(s=>{
      if(s) setHotel(s);
    });
  },[]);

  const submit = async () => {
    if(!rating||!name.trim()) return alert("Veuillez mettre un nom et une note!");
    setLoading(true);
    const reviews = await sget(`saas:d:${hotelId}:reviews`) || [];
    const newReview = {
      id: Date.now().toString(),
      name: name.trim(),
      comment: comment.trim(),
      rating,
      date: new Date().toISOString().split("T")[0],
    };
    await sset(`saas:d:${hotelId}:reviews`, [newReview, ...reviews]);
    setLoading(false);
    setSent(true);
  };

  if(sent) return (
    <div style={{minHeight:"100vh",background:"#faf5ee",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
      <div style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:64,marginBottom:16}}>⭐</div>
        <h2 style={{color:"#1e3a8a",fontSize:28,marginBottom:8}}>Merci pour votre avis!</h2>
        <p style={{color:"#64748b",fontSize:15}}>{hotel?.hotelName||hotelId} vous remercie 🙏</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#faf5ee",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:20}}>
      <div style={{background:"#fff",borderRadius:20,padding:"40px 36px",maxWidth:480,width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,0.1)"}}>
        {hotel?.heroUrl && <img src={hotel.heroUrl} alt="hotel" style={{width:"100%",height:140,objectFit:"cover",borderRadius:12,marginBottom:20}}/>}
        <div style={{textAlign:"center",marginBottom:28}}>
          <h2 style={{color:"#1e3a8a",fontSize:24,fontWeight:700,margin:"0 0 4px"}}>{hotel?.hotelName||hotelId}</h2>
          <p style={{color:"#c9a84c",fontSize:12,letterSpacing:3,margin:0}}>DONNEZ VOTRE AVIS</p>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginTop:10}}>
            <div style={{height:1,width:30,background:"#c9a84c"}}/>
            <span style={{color:"#c9a84c"}}>✦</span>
            <div style={{height:1,width:30,background:"#c9a84c"}}/>
          </div>
        </div>

        {/* Stars */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:13,color:"#64748b",marginBottom:10}}>Votre note</div>
          <div style={{display:"flex",justifyContent:"center",gap:8}}>
            {[1,2,3,4,5].map(s=>(
              <span key={s} onClick={()=>setRating(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
                style={{fontSize:40,cursor:"pointer",color:(hover||rating)>=s?"#f59e0b":"#e2e8f0",transition:"all 0.15s"}}>★</span>
            ))}
          </div>
          {rating>0 && <div style={{color:"#f59e0b",fontSize:13,marginTop:6,fontWeight:600}}>
            {["","😞 Mauvais","😐 Passable","🙂 Bien","😊 Très bien","🤩 Excellent!"][rating]}
          </div>}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:10,color:"#64748b",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Votre nom</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Mohammed El Fassi"
              style={{width:"100%",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"11px 14px",color:"#1e293b",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div>
            <label style={{fontSize:10,color:"#64748b",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Commentaire (optionnel)</label>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Partagez votre expérience..." rows={4}
              style={{width:"100%",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"11px 14px",color:"#1e293b",fontSize:13,outline:"none",boxSizing:"border-box",resize:"none",fontFamily:"Georgia,serif"}}/>
          </div>
          <button onClick={submit} disabled={loading||!rating||!name.trim()}
            style={{background:"linear-gradient(135deg,#1e3a8a,#2d4fa8)",border:"none",borderRadius:10,padding:"14px",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"Georgia,serif",opacity:loading||!rating||!name.trim()?0.6:1}}>
            {loading?"⏳ Envoi...":"⭐ Envoyer mon avis"}
          </button>
        </div>
      </div>
    </div>
  );
}