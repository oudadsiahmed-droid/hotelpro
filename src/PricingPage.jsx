export default function PricingPage() {
  const CHECKOUT_URL = "https://hotelpro.lemonsqueezy.com/checkout/buy/6cfc42d5-3051-428f-bace-18cfee71232e";

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0d1f3c 0%,#1a3a5c 100%)",fontFamily:"'Inter','Segoe UI',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .plan-card:hover{transform:translateY(-4px)!important;box-shadow:0 20px 60px rgba(0,0,0,0.3)!important}
        .cta-btn:hover{transform:translateY(-2px)!important;box-shadow:0 8px 30px rgba(201,168,76,0.5)!important}
      `}</style>

      <div style={{maxWidth:1000,width:"100%"}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:60}}>
          <div style={{fontSize:48,marginBottom:16}}>🏨</div>
          <h1 style={{color:"#fff",fontSize:48,fontWeight:800,margin:"0 0 16px",letterSpacing:-1}}>
            HotelPro
          </h1>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:18,margin:0}}>
            Manage your hotel like a pro
          </p>
        </div>

        {/* Plans */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24,marginBottom:60}}>

          {/* Free Trial */}
          <div className="plan-card" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:36,transition:"all 0.3s"}}>
            <div style={{fontSize:36,marginBottom:16}}>🆓</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,letterSpacing:3,fontWeight:600,marginBottom:8}}>FREE TRIAL</div>
            <div style={{color:"#fff",fontSize:48,fontWeight:800,marginBottom:4}}>$0</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:14,marginBottom:28}}>14 days free</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
              {["✅ All features included","✅ Unlimited reservations","✅ Up to 20 rooms","✅ AI Assistant","✅ Landing page"].map(f=>(
                <div key={f} style={{color:"rgba(255,255,255,0.7)",fontSize:14}}>{f}</div>
              ))}
            </div>
            <a href="/" style={{display:"block",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:"14px",color:"#fff",fontWeight:600,fontSize:15,textAlign:"center",textDecoration:"none",transition:"all 0.2s"}}>
              Start Free Trial →
            </a>
          </div>

          {/* Pro Plan */}
          <div className="plan-card" style={{background:"linear-gradient(135deg,#c9a84c,#a8832a)",border:"none",borderRadius:24,padding:36,transition:"all 0.3s",position:"relative",overflow:"hidden",boxShadow:"0 8px 40px rgba(201,168,76,0.3)"}}>
            <div style={{position:"absolute",top:16,right:16,background:"rgba(0,0,0,0.2)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"#fff",fontWeight:700}}>MOST POPULAR</div>
            <div style={{fontSize:36,marginBottom:16}}>⭐</div>
            <div style={{color:"rgba(0,0,0,0.5)",fontSize:12,letterSpacing:3,fontWeight:600,marginBottom:8}}>PRO PLAN</div>
            <div style={{color:"#0d1f3c",fontSize:48,fontWeight:800,marginBottom:4}}>$99</div>
            <div style={{color:"rgba(0,0,0,0.5)",fontSize:14,marginBottom:28}}>per month</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
              {["✅ Everything in Free","✅ Unlimited rooms","✅ Landing page pro","✅ Reviews clients ⭐","✅ Revenue & Excel export","✅ iCal sync Booking.com","✅ QR Code booking"].map(f=>(
                <div key={f} style={{color:"rgba(0,0,0,0.8)",fontSize:14,fontWeight:500}}>{f}</div>
              ))}
            </div>
            <a href={CHECKOUT_URL} className="cta-btn" style={{display:"block",background:"#0d1f3c",border:"none",borderRadius:12,padding:"14px",color:"#c9a84c",fontWeight:700,fontSize:15,textAlign:"center",textDecoration:"none",transition:"all 0.3s"}}>
              Subscribe Now →
            </a>
          </div>

          {/* Enterprise */}
          <div className="plan-card" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:36,transition:"all 0.3s"}}>
            <div style={{fontSize:36,marginBottom:16}}>🏢</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,letterSpacing:3,fontWeight:600,marginBottom:8}}>ENTERPRISE</div>
            <div style={{color:"#fff",fontSize:48,fontWeight:800,marginBottom:4}}>$299</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:14,marginBottom:28}}>per month</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
              {["✅ Everything in Pro","🔜 Multi-hotel management","✅ Custom branding","✅ API access","✅ Dedicated support","✅ Custom integrations"].map(f=>(
                <div key={f} style={{color:"rgba(255,255,255,0.7)",fontSize:14}}>{f}</div>
              ))}
            </div>
            <a href="https://wa.me/212651645502?text=HotelPro Enterprise" style={{display:"block",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:"14px",color:"#fff",fontWeight:600,fontSize:15,textAlign:"center",textDecoration:"none",transition:"all 0.2s"}}>
              Contact Us →
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center"}}>
          <a href="/" style={{color:"rgba(255,255,255,0.4)",fontSize:13,textDecoration:"none"}}>← Back to HotelPro</a>
        </div>
      </div>
    </div>
  );
}