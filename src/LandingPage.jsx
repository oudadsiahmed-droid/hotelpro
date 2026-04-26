import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function sget(k) {
  try {
    const r = await getDoc(doc(db, "hotelpro", k));
    return r.exists() ? r.data().val : null;
  } catch { return null; }
}

const AMENITY_ICONS = ["❄️","📶","🏊","🌿","🛁","🍳","🏔️","🅿️"];
const AMENITY_LABELS_FR = ["Climatisation","Wi-Fi","Vue piscine","Vue jardin","Baignoire","Kitchenette","Vue montagne","Parking"];

function getAmenityLabel(a) {
  if (typeof a === "number") return `${AMENITY_ICONS[a]||""} ${AMENITY_LABELS_FR[a]||""}`;
  return a;
}

// TEMPLATE 1: LUXE
function Template1({ hotel, rooms, onBook }) {
  return (
    <div style={{fontFamily:"'Cormorant Garamond','Georgia',serif",background:"#0a0a0a",color:"#f5f0e8",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        .t1-room:hover{transform:translateY(-8px)!important;box-shadow:0 20px 60px rgba(201,168,76,0.2)!important}
        .t1-btn:hover{background:#c9a84c!important;color:#0a0a0a!important}
        @keyframes t1fade{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .t1-anim{animation:t1fade 0.8s ease forwards}
      `}</style>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(10,10,10,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(201,168,76,0.15)",padding:"18px 60px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,letterSpacing:3,color:"#c9a84c"}}>{hotel?.hotelName||"HOTEL"}</div>
        <button className="t1-btn" onClick={onBook} style={{background:"transparent",border:"1px solid #c9a84c",color:"#c9a84c",padding:"10px 28px",fontSize:11,letterSpacing:2,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",transition:"all 0.3s"}}>RÉSERVER</button>
      </nav>
      <div style={{height:"100vh",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#111"}}>
        {hotel?.heroUrl && <img src={hotel.heroUrl} alt="hotel" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.5}}/>}
        {!hotel?.heroUrl && <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1a1a1a,#2a2a2a)"}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(10,10,10,0.3),rgba(10,10,10,0.7))"}}/>
        <div className="t1-anim" style={{textAlign:"center",position:"relative",zIndex:2,padding:"0 20px"}}>
          <div style={{fontSize:11,letterSpacing:8,color:"#c9a84c",marginBottom:24,fontFamily:"'Montserrat',sans-serif"}}>BIENVENUE AU</div>
          <h1 style={{fontSize:"clamp(48px,8vw,96px)",fontWeight:300,letterSpacing:4,margin:"0 0 24px",lineHeight:1.1}}>{hotel?.hotelName||"Grand Hôtel"}</h1>
          <div style={{width:60,height:1,background:"#c9a84c",margin:"0 auto 28px"}}/>
          {hotel?.description&&<p style={{fontSize:16,color:"rgba(245,240,232,0.8)",maxWidth:560,margin:"0 auto 40px",lineHeight:1.8,fontFamily:"'Montserrat',sans-serif"}}>{hotel.description}</p>}
          <button className="t1-btn" onClick={onBook} style={{background:"#c9a84c",border:"none",color:"#0a0a0a",padding:"16px 48px",fontSize:12,letterSpacing:3,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",fontWeight:600,transition:"all 0.3s"}}>RÉSERVER MAINTENANT</button>
        </div>
      </div>
      {(hotel?.phone||hotel?.email||hotel?.address)&&(
        <div style={{background:"#c9a84c",padding:"20px 60px",display:"flex",justifyContent:"center",gap:60,flexWrap:"wrap"}}>
          {hotel?.phone&&<div style={{display:"flex",alignItems:"center",gap:10,color:"#0a0a0a",fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:500}}>📞 {hotel.phone}</div>}
          {hotel?.email&&<div style={{display:"flex",alignItems:"center",gap:10,color:"#0a0a0a",fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:500}}>✉️ {hotel.email}</div>}
          {hotel?.address&&<div style={{display:"flex",alignItems:"center",gap:10,color:"#0a0a0a",fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:500}}>📍 {hotel.address}</div>}
        </div>
      )}
      <div style={{padding:"100px 60px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:70}}>
          <div style={{fontSize:11,letterSpacing:6,color:"#c9a84c",marginBottom:16,fontFamily:"'Montserrat',sans-serif"}}>NOS</div>
          <h2 style={{fontSize:48,fontWeight:300,letterSpacing:2,margin:"0 0 20px"}}>Chambres & Suites</h2>
          <div style={{width:60,height:1,background:"#c9a84c",margin:"0 auto"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:28}}>
          {rooms.filter(r=>r.cleanStatus!=="maintenance").map(r=>(
            <div key={r.id} className="t1-room" style={{background:"#111",border:"1px solid rgba(201,168,76,0.15)",borderRadius:2,overflow:"hidden",transition:"all 0.4s",cursor:"pointer"}} onClick={onBook}>
              <div style={{height:220,position:"relative",overflow:"hidden"}}>
                {r.image?<img src={r.image} alt={r.id} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#1a1a1a,#222)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🛏️</div>}
                <div style={{position:"absolute",top:16,right:16,background:"#c9a84c",color:"#0a0a0a",padding:"4px 12px",fontSize:10,letterSpacing:2,fontFamily:"'Montserrat',sans-serif",fontWeight:600}}>{r.type.toUpperCase()}</div>
              </div>
              <div style={{padding:28}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <h3 style={{fontSize:22,fontWeight:400,margin:0,letterSpacing:1}}>Chambre {r.id}</h3>
                  <div style={{textAlign:"right"}}><div style={{fontSize:28,color:"#c9a84c",fontWeight:300}}>${r.price}</div><div style={{fontSize:11,color:"rgba(245,240,232,0.5)",fontFamily:"'Montserrat',sans-serif",letterSpacing:1}}>/ NUIT</div></div>
                </div>
                {r.amenities?.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>{r.amenities.map((a,i)=><span key={i} style={{fontSize:11,color:"rgba(245,240,232,0.5)",fontFamily:"'Montserrat',sans-serif"}}>{getAmenityLabel(a)}</span>)}</div>}
                <button className="t1-btn" onClick={onBook} style={{width:"100%",background:"transparent",border:"1px solid rgba(201,168,76,0.4)",color:"#c9a84c",padding:"12px",fontSize:11,letterSpacing:2,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",transition:"all 0.3s"}}>RÉSERVER</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#111",padding:"80px 60px",textAlign:"center"}}>
        <h2 style={{fontSize:40,fontWeight:300,letterSpacing:2,margin:"0 0 40px"}}>Réservez votre séjour</h2>
        <button className="t1-btn" onClick={onBook} style={{background:"#c9a84c",border:"none",color:"#0a0a0a",padding:"18px 60px",fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",fontWeight:600,transition:"all 0.3s"}}>RÉSERVER EN LIGNE</button>
      </div>
      <div style={{background:"#0a0a0a",borderTop:"1px solid rgba(201,168,76,0.15)",padding:"24px 60px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#c9a84c",letterSpacing:2}}>{hotel?.hotelName}</div>
        <div style={{color:"rgba(245,240,232,0.3)",fontSize:11,fontFamily:"'Montserrat',sans-serif",letterSpacing:1}}>© {new Date().getFullYear()} · TOUS DROITS RÉSERVÉS</div>
      </div>
    </div>
  );
}
// TEMPLATE 2: MODERNE
function Template2({ hotel, rooms, onBook }) {
  return (
    <div style={{fontFamily:"'Poppins','Segoe UI',sans-serif",background:"#ffffff",color:"#1a1a2e",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        .t2-room:hover{transform:translateY(-6px)!important;box-shadow:0 24px 48px rgba(0,0,0,0.12)!important}
        .t2-btn:hover{transform:translateY(-3px)!important;box-shadow:0 12px 30px rgba(99,102,241,0.4)!important}
      `}</style>
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid #f0f0f0",padding:"16px 48px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 20px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏨</div>
          <span style={{fontSize:18,fontWeight:700}}>{hotel?.hotelName||"Hotel"}</span>
        </div>
        <button className="t2-btn" onClick={onBook} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",color:"#fff",padding:"10px 24px",borderRadius:8,fontSize:13,cursor:"pointer",fontWeight:600,transition:"all 0.3s",boxShadow:"0 4px 15px rgba(99,102,241,0.3)"}}>Réserver →</button>
      </nav>
      <div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",minHeight:"85vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",padding:"80px 48px"}}>
        {hotel?.heroUrl&&<img src={hotel.heroUrl} alt="hotel" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.2}}/>}
        <div style={{position:"absolute",top:-100,right:-100,width:400,height:400,background:"rgba(99,102,241,0.15)",borderRadius:"50%",filter:"blur(60px)"}}/>
        <div style={{maxWidth:700,position:"relative",zIndex:2}}>
          <div style={{display:"inline-block",background:"rgba(99,102,241,0.2)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:20,padding:"6px 16px",fontSize:12,color:"#a5b4fc",marginBottom:24,fontWeight:500}}>⭐ Meilleur prix garanti</div>
          <h1 style={{fontSize:"clamp(36px,5vw,64px)",fontWeight:800,color:"#fff",margin:"0 0 20px",lineHeight:1.1}}>{hotel?.hotelName||"Bienvenue"}<br/><span style={{background:"linear-gradient(135deg,#6366f1,#a5b4fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>à votre hôtel</span></h1>
          {hotel?.description&&<p style={{color:"rgba(255,255,255,0.6)",fontSize:16,lineHeight:1.8,marginBottom:36}}>{hotel.description}</p>}
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            <button className="t2-btn" onClick={onBook} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",color:"#fff",padding:"15px 36px",borderRadius:12,fontSize:15,cursor:"pointer",fontWeight:600,transition:"all 0.3s",boxShadow:"0 8px 24px rgba(99,102,241,0.4)"}}>🛏️ Réserver maintenant</button>
          </div>
          <div style={{display:"flex",gap:32,marginTop:40}}>
            {[["🛏️",`${rooms.length}+`,"Chambres"],["⭐","5.0","Note"],["✅","100%","Satisfaction"]].map(([ico,val,label])=>(
              <div key={label}><div style={{color:"#fff",fontWeight:700,fontSize:22}}>{ico} {val}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:2}}>{label}</div></div>
            ))}
          </div>
        </div>
      </div>
      {(hotel?.phone||hotel?.email||hotel?.address)&&(
        <div style={{background:"#6366f1",padding:"20px 48px",display:"flex",justifyContent:"center",gap:40,flexWrap:"wrap"}}>
          {hotel?.phone&&<div style={{color:"#fff",fontSize:14}}>📞 {hotel.phone}</div>}
          {hotel?.email&&<div style={{color:"#fff",fontSize:14}}>✉️ {hotel.email}</div>}
          {hotel?.address&&<div style={{color:"#fff",fontSize:14}}>📍 {hotel.address}</div>}
        </div>
      )}
      <div style={{padding:"80px 48px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:50}}><h2 style={{fontSize:40,fontWeight:700,margin:"0 0 12px"}}>Nos Chambres</h2><p style={{color:"#6b7280",fontSize:16}}>Choisissez votre chambre idéale</p></div>
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {rooms.filter(r=>r.cleanStatus!=="maintenance").map(r=>(
            <div key={r.id} className="t2-room" style={{background:"#fff",border:"1px solid #f0f0f0",borderRadius:20,overflow:"hidden",display:"flex",transition:"all 0.3s",boxShadow:"0 4px 16px rgba(0,0,0,0.06)",cursor:"pointer"}} onClick={onBook}>
              <div style={{width:260,flexShrink:0,position:"relative"}}>
                {r.image?<img src={r.image} alt={r.id} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",minHeight:180,background:"linear-gradient(135deg,#e0e7ff,#c7d2fe)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🛏️</div>}
                <div style={{position:"absolute",top:12,left:12,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",borderRadius:8,padding:"4px 12px",fontSize:11,fontWeight:600}}>{r.type}</div>
              </div>
              <div style={{padding:"28px 32px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div><h3 style={{fontSize:22,fontWeight:700,margin:"0 0 4px"}}>Chambre {r.id}</h3><div style={{color:"#6b7280",fontSize:13}}>Étage {r.floor}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:32,fontWeight:700,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>${r.price}</div><div style={{color:"#9ca3af",fontSize:12}}>par nuit</div></div>
                  </div>
                  {r.amenities?.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>{r.amenities.map((a,i)=><span key={i} style={{background:"#f3f4f6",borderRadius:20,padding:"4px 12px",fontSize:12,color:"#4b5563",fontWeight:500}}>{getAmenityLabel(a)}</span>)}</div>}
                </div>
                <button className="t2-btn" onClick={onBook} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",color:"#fff",padding:"12px 28px",borderRadius:10,fontSize:14,cursor:"pointer",fontWeight:600,alignSelf:"flex-start",transition:"all 0.3s",boxShadow:"0 4px 15px rgba(99,102,241,0.3)"}}>Réserver →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",padding:"80px 48px",textAlign:"center"}}>
        <h2 style={{fontSize:42,fontWeight:700,color:"#fff",margin:"0 0 16px"}}>Prêt à réserver?</h2>
        <button className="t2-btn" onClick={onBook} style={{background:"#fff",border:"none",color:"#6366f1",padding:"16px 48px",borderRadius:12,fontSize:16,cursor:"pointer",fontWeight:700,transition:"all 0.3s"}}>🛏️ Réserver maintenant</button>
      </div>
      <div style={{background:"#1a1a2e",padding:"20px 48px",textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:12}}>© {new Date().getFullYear()} {hotel?.hotelName} · Tous droits réservés</div>
    </div>
  );
}
// TEMPLATE 3: NATURE
function Template3({ hotel, rooms, onBook }) {
  return (
    <div style={{fontFamily:"'Nunito','Segoe UI',sans-serif",background:"#fafaf7",color:"#2d3a2e",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .t3-room:hover{transform:translateY(-6px)!important;box-shadow:0 20px 50px rgba(0,0,0,0.1)!important}
        .t3-btn:hover{background:#2d6a4f!important;transform:translateY(-2px)!important}
      `}</style>
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(250,250,247,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(45,106,79,0.1)",padding:"16px 48px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>🌿</span>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#2d6a4f"}}>{hotel?.hotelName||"Resort"}</span>
        </div>
        <button className="t3-btn" onClick={onBook} style={{background:"#40916c",border:"none",color:"#fff",padding:"11px 28px",borderRadius:30,fontSize:14,cursor:"pointer",fontWeight:600,transition:"all 0.3s",boxShadow:"0 4px 15px rgba(64,145,108,0.3)"}}>🌿 Réserver</button>
      </nav>
      <div style={{position:"relative",height:"90vh",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {hotel?.heroUrl?<img src={hotel.heroUrl} alt="hotel" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1b4332,#2d6a4f,#40916c)"}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.5))"}}/>
        <div style={{textAlign:"center",position:"relative",zIndex:2,padding:"0 24px"}}>
          <div style={{display:"inline-block",background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:30,padding:"8px 20px",fontSize:13,color:"#fff",marginBottom:24,fontWeight:500}}>🌿 Séjour nature & bien-être</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(42px,7vw,88px)",fontWeight:700,color:"#fff",margin:"0 0 20px",lineHeight:1.1,textShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>{hotel?.hotelName||"Le Resort"}</h1>
          {hotel?.description&&<p style={{color:"rgba(255,255,255,0.85)",fontSize:17,maxWidth:560,margin:"0 auto 36px",lineHeight:1.8}}>{hotel.description}</p>}
          <button className="t3-btn" onClick={onBook} style={{background:"#40916c",border:"none",color:"#fff",padding:"15px 40px",borderRadius:30,fontSize:15,cursor:"pointer",fontWeight:700,transition:"all 0.3s",boxShadow:"0 8px 24px rgba(64,145,108,0.4)"}}>Réserver maintenant 🌿</button>
        </div>
      </div>
      {(hotel?.phone||hotel?.email||hotel?.address)&&(
        <div style={{background:"#2d6a4f",padding:"20px 48px",display:"flex",justifyContent:"center",gap:40,flexWrap:"wrap"}}>
          {hotel?.phone&&<div style={{color:"rgba(255,255,255,0.85)",fontSize:14}}>📞 {hotel.phone}</div>}
          {hotel?.email&&<div style={{color:"rgba(255,255,255,0.85)",fontSize:14}}>✉️ {hotel.email}</div>}
          {hotel?.address&&<div style={{color:"rgba(255,255,255,0.85)",fontSize:14}}>📍 {hotel.address}</div>}
        </div>
      )}
      <div style={{padding:"80px 48px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:700,margin:"0 0 12px",color:"#2d6a4f"}}>Nos Hébergements</h2><p style={{color:"#6b7280",fontSize:16}}>Chaque chambre, une expérience unique</p></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:24}}>
          {rooms.filter(r=>r.cleanStatus!=="maintenance").map(r=>(
            <div key={r.id} className="t3-room" style={{background:"#fff",borderRadius:24,overflow:"hidden",transition:"all 0.4s",boxShadow:"0 4px 20px rgba(0,0,0,0.07)",cursor:"pointer",border:"1px solid rgba(64,145,108,0.1)"}} onClick={onBook}>
              <div style={{height:200,position:"relative"}}>
                {r.image?<img src={r.image} alt={r.id} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#d8f3dc,#b7e4c7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🌿</div>}
                <div style={{position:"absolute",top:12,left:12,background:"#40916c",color:"#fff",borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:600}}>{r.type}</div>
              </div>
              <div style={{padding:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,margin:0}}>Chambre {r.id}</h3>
                  <div style={{color:"#40916c",fontWeight:700,fontSize:22}}>${r.price}<span style={{color:"#9ca3af",fontSize:12,fontWeight:400}}>/nuit</span></div>
                </div>
                {r.amenities?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>{r.amenities.map((a,i)=><span key={i} style={{background:"#f0f4f0",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#2d6a4f",fontWeight:500}}>{getAmenityLabel(a)}</span>)}</div>}
                <button className="t3-btn" onClick={onBook} style={{width:"100%",background:"#40916c",border:"none",color:"#fff",padding:"12px",borderRadius:14,fontSize:14,cursor:"pointer",fontWeight:600,transition:"all 0.3s"}}>Réserver →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"linear-gradient(135deg,#1b4332,#2d6a4f)",padding:"80px 48px",textAlign:"center"}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:42,color:"#fff",margin:"0 0 16px",fontWeight:700}}>Votre escapade vous attend</h2>
        <button className="t3-btn" onClick={onBook} style={{background:"#74c69d",border:"none",color:"#1b4332",padding:"16px 48px",borderRadius:30,fontSize:16,cursor:"pointer",fontWeight:700,transition:"all 0.3s"}}>🌿 Réserver maintenant</button>
      </div>
      <div style={{background:"#1b4332",padding:"20px 48px",textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:12}}>© {new Date().getFullYear()} {hotel?.hotelName} · Tous droits réservés</div>
    </div>
  );
}
// TEMPLATE SELECTOR
function TemplateSelector({ onSelect, current }) {
  const templates = [
    { id:1, name:"Luxe & Élégance", desc:"Design sombre et raffiné", emoji:"🥂", preview:"#0a0a0a", accent:"#c9a84c" },
    { id:2, name:"Moderne & Dynamique", desc:"Design coloré et contemporain", emoji:"🏙️", preview:"#1a1a2e", accent:"#6366f1" },
    { id:3, name:"Nature & Resort", desc:"Design naturel et apaisant", emoji:"🌿", preview:"#1b4332", accent:"#40916c" },
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:24,padding:40,maxWidth:700,width:"100%",boxShadow:"0 40px 80px rgba(0,0,0,0.5)"}}>
        <h2 style={{margin:"0 0 8px",fontSize:28,fontWeight:700,textAlign:"center"}}>Choisissez votre style</h2>
        <p style={{color:"#6b7280",textAlign:"center",marginBottom:32,fontSize:14}}>Sélectionnez le design de votre page hôtel</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16,marginBottom:24}}>
          {templates.map(t=>(
            <div key={t.id} onClick={()=>onSelect(t.id)} style={{cursor:"pointer",borderRadius:16,overflow:"hidden",border:`2px solid ${current===t.id?t.accent:"#e5e7eb"}`,transition:"all 0.2s",transform:current===t.id?"scale(1.02)":"scale(1)"}}>
              <div style={{height:100,background:t.preview,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>{t.emoji}</div>
              <div style={{padding:"14px 16px",background:current===t.id?`${t.accent}15`:"#fff"}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:current===t.id?t.accent:"#1a1a2e"}}>{t.name}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>onSelect(current||1)} style={{width:"100%",background:"linear-gradient(135deg,#1e3a8a,#1d4ed8)",border:"none",color:"#fff",padding:"14px",borderRadius:12,fontSize:15,cursor:"pointer",fontWeight:600}}>
          ✅ Confirmer ce style
        </button>
      </div>
    </div>
  );
}

// MAIN LANDING PAGE
export default function LandingPage({ hotelId }) {
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    Promise.all([
      sget(`saas:d:${hotelId}:settings`),
      sget(`saas:d:${hotelId}:rooms`),
      sget(`saas:d:${hotelId}:landing`),
    ]).then(([s, r, l]) => {
      if (s) setHotel(s);
      if (r) setRooms(r);
      if (l?.template) setTemplate(l.template);
      else setShowSelector(true);
      setLoading(false);
    });
  }, [hotelId]);

  const saveTemplate = async (t) => {
    await setDoc(doc(db, "hotelpro", `saas:d:${hotelId}:landing`), { val: { template: t } });
    setTemplate(t);
    setShowSelector(false);
  };

  const goBook = () => { window.location.href = `/book/${hotelId}`; };

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🏨</div>
        <div style={{color:"#64748b",fontFamily:"sans-serif"}}>Chargement...</div>
      </div>
    </div>
  );

  const props = { hotel, rooms, onBook: goBook };

  return (
    <>
      {showSelector && <TemplateSelector onSelect={saveTemplate} current={template||1}/>}
      {!showSelector && (
        <button onClick={()=>setShowSelector(true)} style={{position:"fixed",bottom:24,right:24,zIndex:999,background:"#1e3a8a",border:"none",color:"#fff",borderRadius:30,padding:"12px 20px",fontSize:13,cursor:"pointer",fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
          🎨 Changer le style
        </button>
      )}
      {(template===1||!template) && <Template1 {...props}/>}
      {template===2 && <Template2 {...props}/>}
      {template===3 && <Template3 {...props}/>}
    </>
  );
}