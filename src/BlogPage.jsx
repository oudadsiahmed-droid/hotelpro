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

export default function BlogPage({ hotelId }) {
  const [hotel, setHotel] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      sget(`saas:d:${hotelId}:settings`),
      sget(`saas:d:${hotelId}:blog`),
    ]).then(([s, b]) => {
      console.log("BLOG DEBUG:", s, b); if (s) setHotel(s);
      if (b && b.length > 0) setArticles(b);
      else generateArticles(s);
      setLoading(false);
    });
  }, [hotelId]);

  const generateArticles = async (hotelData) => {
    if (!hotelData) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are an SEO expert writing blog articles for hotels. Always respond with a valid JSON array only, no markdown.`,
          messages: [{
            role: "user",
            content: `Write 3 SEO blog articles for "${hotelData.hotelName}" hotel located in "${hotelData.city || hotelData.address || 'USA'}". 
Return ONLY a JSON array with this structure:
[{
  "slug": "url-friendly-title",
  "title": "Article Title",
  "metaDescription": "150 char description",
  "content": "Full article HTML content with h2, p tags, minimum 400 words",
  "keywords": ["keyword1", "keyword2"],
  "readTime": "5 min"
}]`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const arts = JSON.parse(clean);
      setArticles(arts);
      await sset(`saas:d:${hotelId}:blog`, arts);
      await sset(`saas:d:${hotelId}:blog_views`, { total: 0, articles: {} });
    } catch(e) {
      console.error(e);
    }
    setGenerating(false);
  };

  if (loading || generating) return (
    <div style={{minHeight:"100vh",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16,animation:"spin 2s linear infinite"}}>✍️</div>
        <div style={{color:"#1e293b",fontSize:18,fontWeight:600}}>{generating ? "AI is writing your blog..." : "Loading..."}</div>
        <div style={{color:"#64748b",fontSize:14,marginTop:8}}>This may take a few seconds</div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (selected) return (
    <div style={{minHeight:"100vh",background:"#fff",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:"#1e3a8a",padding:"16px 24px",display:"flex",alignItems:"center",gap:16}}>
        <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"8px 16px",color:"#fff",cursor:"pointer",fontSize:14}}>← Back</button>
        <div style={{color:"#fff",fontSize:14,opacity:0.8}}>{hotel?.hotelName}</div>
      </div>
      <div style={{maxWidth:800,margin:"0 auto",padding:"48px 24px"}}>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {selected.keywords?.map((k,i)=>(
            <span key={i} style={{background:"#eff6ff",color:"#1e40af",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:500}}>{k}</span>
          ))}
          <span style={{background:"#f1f5f9",color:"#64748b",padding:"4px 12px",borderRadius:20,fontSize:12}}>⏱ {selected.readTime}</span>
        </div>
        <h1 style={{fontSize:"clamp(24px,4vw,40px)",fontWeight:700,color:"#0f172a",lineHeight:1.3,marginBottom:16}}>{selected.title}</h1>
        <div style={{color:"#64748b",fontSize:15,marginBottom:32,paddingBottom:32,borderBottom:"1px solid #e2e8f0"}}>{selected.metaDescription}</div>
        <div style={{color:"#1e293b",fontSize:16,lineHeight:1.8}} dangerouslySetInnerHTML={{__html:selected.content}}/>
        <div style={{marginTop:48,padding:32,background:"linear-gradient(135deg,#1e3a8a,#1d4ed8)",borderRadius:16,textAlign:"center"}}>
          <div style={{color:"#fff",fontSize:22,fontWeight:700,marginBottom:8}}>Book your stay at {hotel?.hotelName}</div>
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:14,marginBottom:20}}>Check availability and reserve your room today</div>
          <a href={`/book/${hotelId}`} style={{background:"#c9a84c",color:"#0a0a0a",padding:"14px 32px",borderRadius:10,textDecoration:"none",fontWeight:700,fontSize:15,display:"inline-block"}}>
            Book Now →
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      
      <div style={{background:"linear-gradient(135deg,#1e3a8a,#1d4ed8)",padding:"48px 24px",textAlign:"center"}}>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:13,letterSpacing:2,marginBottom:12}}>TRAVEL BLOG</div>
        <h1 style={{color:"#fff",fontSize:"clamp(28px,5vw,48px)",fontWeight:700,marginBottom:12}}>{hotel?.hotelName}</h1>
        <p style={{color:"rgba(255,255,255,0.8)",fontSize:16,maxWidth:500,margin:"0 auto 24px"}}>
          Discover tips, guides and everything about {hotel?.city || "our destination"}
        </p>
        <a href={`/book/${hotelId}`} style={{background:"#c9a84c",color:"#0a0a0a",padding:"12px 28px",borderRadius:10,textDecoration:"none",fontWeight:700,fontSize:14,display:"inline-block"}}>
          Book a Room →
        </a>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"48px 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:24}}>
          {articles.map((art,i)=>(
            <div key={i} onClick={()=>setSelected(art)}
              style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",cursor:"pointer",transition:"all 0.2s",border:"1px solid #e2e8f0"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              <div style={{height:160,background:`linear-gradient(135deg,hsl(${i*60},60%,30%),hsl(${i*60+30},60%,50%))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>
                {["🏨","🗺️","✨"][i%3]}
              </div>
              <div style={{padding:20}}>
                <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                  {art.keywords?.slice(0,2).map((k,j)=>(
                    <span key={j} style={{background:"#eff6ff",color:"#1e40af",padding:"3px 10px",borderRadius:20,fontSize:11}}>{k}</span>
                  ))}
                  <span style={{background:"#f1f5f9",color:"#64748b",padding:"3px 10px",borderRadius:20,fontSize:11}}>⏱ {art.readTime}</span>
                </div>
                <h2 style={{fontSize:18,fontWeight:700,color:"#0f172a",lineHeight:1.4,marginBottom:10}}>{art.title}</h2>
                <p style={{color:"#64748b",fontSize:14,lineHeight:1.6,marginBottom:16}}>{art.metaDescription}</p>
                <div style={{color:"#1d4ed8",fontSize:13,fontWeight:600}}>Read more →</div>
              </div>
            </div>
          ))}
        </div>

        {articles.length === 0 && (
          <div style={{textAlign:"center",padding:60,color:"#64748b"}}>
            <div style={{fontSize:48,marginBottom:12}}>📝</div>
            <div style={{fontSize:16}}>No articles yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
