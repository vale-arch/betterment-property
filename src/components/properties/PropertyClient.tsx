'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function PropertyClient({ property }: { property: any }) {
  const [activeImg, setActiveImg] = useState(0)
  const [inquiry, setInq] = useState({ name: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const images = property.property_images?.map((i: any) => i.url) || property.images || []
  const agentPhone = property.profiles?.phone?.replace(/\D/g, '')
  
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const message = `Hi, I am interested in viewing *${property.title}* in ${property.sub_counties?.name || 'this area'}. \n\nProperty Link: ${currentUrl}`;
  const encodedMessage = encodeURIComponent(message);

  const sendInquiry = async (e: any) => {
    e.preventDefault()
    setSending(true)
    await supabase.from('inquiries').insert([{
      property_id: property.id, agent_id: property.owner_id, 
      sender_name: inquiry.name, sender_phone: inquiry.phone, message: inquiry.message
    }])
    setSent(true)
    setSending(false)
  }

  return (
    <div style={{ background: '#FDFCF9', minHeight: '100vh', color: '#1B1464', paddingBottom: '120px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        body { font-family: 'Inter', sans-serif; margin: 0; width: 100%; overflow-x: hidden; }

        /* --- THE ELITE GRID LOGIC --- */
        .main-wrapper { 
          max-width: 1400px; 
          margin: 0 auto; 
          display: grid; 
          grid-template-columns: 1fr 400px; /* Sidebar is exactly 400px on desktop */
          gap: 60px; 
          padding: 0 40px;
        }

        .gallery-main { 
          width: 100%; 
          height: 600px; 
          object-fit: cover; 
          border-radius: 24px; 
          box-shadow: 0 30px 60px rgba(45,0,79,0.1); 
        }

        .thumb-bar { 
          display: flex; 
          gap: 12px; 
          margin-top: 20px; 
          overflow-x: auto; 
          padding: 5px 5px 15px; 
          scrollbar-width: none; 
          -webkit-overflow-scrolling: touch;
        }
        .thumb-bar::-webkit-scrollbar { display: none; }
        
        .thumb { 
          width: 120px; height: 90px; flex-shrink: 0; border-radius: 12px; 
          object-fit: cover; cursor: pointer; opacity: 0.5; transition: 0.3s; border: 2px solid transparent; 
        }
        .thumb.active { opacity: 1; border-color: #7B2CBF; transform: scale(1.05); }

        .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin: 40px 0; }
        .spec-card { background: white; border: 1px solid #E5E7EB; padding: 25px; border-radius: 20px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.02); }

        .sticky-sidebar { position: sticky; top: 40px; background: white; border: 1px solid #E5E7EB; border-radius: 32px; padding: 40px; box-shadow: 0 25px 50px rgba(45,0,79,0.05); }

        /* --- MOBILE BREAKPOINT --- */
        @media (max-width: 1150px) {
          .main-wrapper { grid-template-columns: 1fr; padding: 0 20px; width: 100%; }
          .gallery-main { height: 350px; border-radius: 16px; }
          .header-stack { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 20px !important; }
          .price-box { text-align: left !important; width: 100%; border-top: 1px solid #eee; padding-top: 20px; margin-top: 10px; }
          .desktop-sidebar { display: none; }
          .mobile-actions { display: flex !important; }
          .spec-grid { grid-template-columns: 1fr 1fr; }
        }

        .mobile-actions { 
          position: fixed; bottom: 0; left: 0; right: 0; 
          background: rgba(255,255,255,0.98); backdrop-filter: blur(15px); 
          padding: 15px 20px; display: none; gap: 10px; border-top: 1px solid #EEE; 
          z-index: 9999; box-shadow: 0 -15px 30px rgba(0,0,0,0.08);
        }
      `}</style>

      {/* ── HEADER NAVIGATION ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 40px 20px' }}>
        <Link href="/listings" style={{ 
            display: 'inline-block', background: '#FFF', border: '1px solid #E5E7EB', 
            color: '#6B7280', padding: '12px 24px', borderRadius: '10px', 
            textDecoration: 'none', marginBottom: '30px', fontWeight: '800', fontSize: '11px', letterSpacing: '1px' 
        }}>
          ← BACK TO MARKETPLACE
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }} className="header-stack">
          <div>
            <span style={{ background: '#F5EFFF', color: '#7B2CBF', padding: '5px 15px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>VERIFIED ASSET ✓</span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '10px 0', lineHeight: 1, color: '#2D004F', letterSpacing: '-2px' }}>{property.title}</h1>
            <p style={{ color: '#6B7280', fontWeight: '600', fontSize: '16px' }}>📍 {property.sub_counties?.name || 'Private Area'}, {property.counties?.name}</p>
          </div>
          
          <div className="price-box" style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#7B2CBF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Asking Price</p>
            <div style={{ color: '#2D004F', fontSize: '3.2rem', fontWeight: '800', fontFamily: 'Bebas Neue', lineHeight: 1 }}>KES {property.price?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="main-wrapper">
        {/* LEFT COLUMN: Media & Info */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <img className="gallery-main" src={images[activeImg] || property.images?.[0]} alt="Property Gallery" />
          
          <div className="thumb-bar">
            {images.map((img: string, i: number) => (
              <img key={i} src={img} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} alt="Preview" />
            ))}
          </div>

          <div className="spec-grid">
             {property.property_type !== 'land' && (
                <div className="spec-card">
                  <span style={{fontSize:'26px'}}>🏠</span>
                  <small style={{display:'block', fontSize:'10px', color:'#999', fontWeight:800, textTransform:'uppercase', marginTop:'5px'}}>Total Rooms</small>
                  <b style={{fontSize:'22px', fontFamily:'Bebas Neue'}}>{property.bedrooms || '—'}</b>
                </div>
             )}
             <div className="spec-card">
                 <span style={{fontSize:'26px'}}>📐</span>
                 <small style={{display:'block', fontSize:'10px', color:'#999', fontWeight:800, textTransform:'uppercase', marginTop:'5px'}}>Sizing</small>
                 <b style={{fontSize:'22px', fontFamily:'Bebas Neue'}}>{property.sq_ft ? `${property.sq_ft} SqFt` : 'Standard'}</b>
             </div>
             <div className="spec-card">
                 <span style={{fontSize:'26px'}}>🏢</span>
                 <small style={{display:'block', fontSize:'10px', color:'#999', fontWeight:800, textTransform:'uppercase', marginTop:'5px'}}>Category</small>
                 <b style={{fontSize:'22px', fontFamily:'Bebas Neue'}}>{property.property_type.replace('_', ' + ')}</b>
             </div>
          </div>

          <div style={{ marginTop: '50px', paddingBottom: '50px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#2D004F', borderBottom: '2px solid #F5EFFF', display: 'inline-block', marginBottom: '25px', paddingBottom: '5px' }}>Asset Overview</h2>
            <p style={{ color: '#444', lineHeight: '1.9', fontSize: '18px', whiteSpace: 'pre-line' }}>{property.description}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Sticky Sidebar */}
        <div className="desktop-sidebar">
           <div className="sticky-sidebar">
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px', color: '#2D004F' }}>Arrange Briefing</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '30px' }}>Portfolio Lead: <b>{property.profiles?.full_name}</b></p>
              
              {sent ? (
                <div style={{ background: '#F0FDF4', color: '#166534', padding: '25px', borderRadius: '16px', textAlign: 'center', border: '1px solid #BBF7D0' }}><b>INQUIRY SENT</b><br/>Our team will contact you.</div>
              ) : (
                <form onSubmit={sendInquiry}>
                   <input required style={{width:'100%', padding:'18px', borderRadius:'14px', border:'1px solid #E5E7EB', marginBottom:'12px', fontSize:'16px'}} placeholder="Full Name" onChange={e => setInq({...inquiry, name: e.target.value})} />
                   <input required style={{width:'100%', padding:'18px', borderRadius:'14px', border:'1px solid #E5E7EB', marginBottom:'20px', fontSize:'16px'}} placeholder="Phone Number" onChange={e => setInq({...inquiry, phone: e.target.value})} />
                   <button type="submit" style={{width:'100%', padding:'20px', borderRadius:'14px', border:'none', background:'#2D004F', color:'white', fontWeight:800, cursor:'pointer', letterSpacing:'1px'}} disabled={sending}>REQUEST BRIEFING</button>
                </form>
              )}
              
              <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                 <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1 }}><button style={{ width: '100%', background: 'white', color: '#2D004F', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>CALL</button></a>
                 <a href={`https://wa.me/${agentPhone}?text=${encodedMessage}`} target="_blank" style={{ flex: 1 }}><button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>WHATSAPP</button></a>
              </div>
           </div>
        </div>
      </div>

      {/* MOBILE STICKY BAR */}
      <div className="mobile-actions">
          <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#FFF', color: '#2D004F', border: '1.5px solid #2D004F', padding: '18px', borderRadius: '14px', fontSize: '13px', fontWeight: '800' }}>CALL LEAD</button>
          </a>
          <a href={`https://wa.me/${agentPhone}?text=${encodedMessage}`} target="_blank" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '18px', borderRadius: '14px', fontSize: '13px', fontWeight: '800' }}>WHATSAPP</button>
          </a>
      </div>
    </div>
  )
}