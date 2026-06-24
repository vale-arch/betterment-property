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
  
  const message = `Hi, I am interested in *${property.title}* in ${property.sub_counties?.name || 'this area'}. \n\nLink: ${currentUrl}`;
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
        
        body { font-family: 'Inter', sans-serif; margin: 0; width: 100vw; overflow-x: hidden; }

        /* ELITE MOBILE-FIRST LAYOUT */
        .main-wrapper { 
          max-width: 1300px; 
          margin: 0 auto; 
          display: grid; 
          grid-template-columns: 1fr 400px; 
          gap: 60px; 
          padding: 0 20px;
        }

        .gallery-main { 
          width: 100%; 
          height: 550px; 
          object-fit: cover; 
          border-radius: 24px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.05); 
        }

        /* THE HORIZONTAL SCROLL FIX */
        .thumb-bar { 
          display: flex; 
          gap: 12px; 
          margin-top: 15px; 
          overflow-x: auto; 
          padding: 10px 5px 20px; 
          scrollbar-width: none; 
          -webkit-overflow-scrolling: touch; /* Smooth swipe on iPhone */
          max-width: 100vw;
        }
        .thumb-bar::-webkit-scrollbar { display: none; }
        
        .thumb { 
          width: 120px; 
          height: 90px; 
          flex-shrink: 0; /* Important: stops them from getting squashed */
          border-radius: 12px; 
          object-fit: cover; 
          cursor: pointer; 
          opacity: 0.5; 
          transition: 0.3s; 
          border: 2px solid transparent; 
        }
        .thumb.active { opacity: 1; border-color: #7B2CBF; transform: scale(1.05); }

        .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 30px 0; }
        .spec-card { background: white; border: 1px solid #E5E7EB; padding: 25px; border-radius: 20px; text-align: center; }

        .sticky-sidebar { position: sticky; top: 40px; background: white; border: 1px solid #E5E7EB; border-radius: 24px; padding: 35px; }

        /* PHONE VIEW OPTIMIZATIONS (The Fix) */
        @media (max-width: 850px) {
          .main-wrapper { grid-template-columns: 1fr; padding: 0 15px; width: 100%; }
          .gallery-main { height: 300px; border-radius: 15px; }
          .header-stack { flex-direction: column; align-items: flex-start !important; padding: 20px 15px !important; }
          .price-box { text-align: left !important; width: 100%; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px; }
          .desktop-sidebar { display: none; }
          .mobile-actions { display: flex !important; }
          .spec-grid { grid-template-columns: 1fr 1fr; }
          .sticky-sidebar { position: static; padding: 20px; }
          
          /* Text Size Fixes */
          h1 { font-size: 2.2rem !important; }
          .price-box div { font-size: 2.5rem !important; }
          p { font-size: 16px !important; line-height: 1.6; }
        }

        .mobile-actions { 
          position: fixed; bottom: 0; left: 0; right: 0; 
          background: rgba(255,255,255,0.98); backdrop-filter: blur(10px); 
          padding: 15px; display: none; gap: 10px; border-top: 1px solid #EEE; 
          z-index: 10000; box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
        }
      `}</style>

      {/* ── RESPONSIVE HEADER ── */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 20px' }} className="header-stack">
        <Link href="/listings" style={{ display: 'inline-block', background: '#FFF', border: '1px solid #E5E7EB', color: '#6B7280', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', marginBottom: '20px', fontWeight: '800', fontSize: '12px' }}>
          ← BACK TO INVENTORY
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }} className="header-stack">
          <div style={{ flex: 1 }}>
            <span style={{ background: '#F5EFFF', color: '#7B2CBF', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>VERIFIED ASSET ✓</span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '12px 0', lineHeight: 1, color: '#2D004F', letterSpacing: '-1.5px' }}>{property.title}</h1>
            <p style={{ color: '#6B7280', fontWeight: '600', fontSize: '15px' }}>📍 {property.sub_counties?.name || 'Private Location'}, {property.counties?.name}</p>
          </div>
          
          <div className="price-box" style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#7B2CBF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Listing Price</p>
            <div style={{ color: '#2D004F', fontSize: '3rem', fontWeight: '800', fontFamily: 'Bebas Neue', lineHeight: 1 }}>KES {property.price?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="main-wrapper">
        <div style={{width: '100%'}}>
          {/* Main Hero Photo */}
          <img className="gallery-main" src={images[activeImg] || property.images?.[0]} alt="Property" />
          
          {/* HORIZONTAL SWIPE GALLERY */}
          <div className="thumb-bar">
            {images.map((img: string, i: number) => (
              <img key={i} src={img} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} alt="Preview" />
            ))}
          </div>

          <div className="spec-grid">
             {property.property_type !== 'land' && (
                <div className="spec-card">
                  <span style={{fontSize:'28px'}}>🏠</span>
                  <small style={{display:'block', fontSize:'11px', color:'#999', fontWeight:800, textTransform:'uppercase', marginTop:'8px'}}>Rooms</small>
                  <b style={{fontSize:'22px', fontFamily:'Bebas Neue'}}>{property.bedrooms || '—'}</b>
                </div>
             )}
             <div className="spec-card">
                 <span style={{fontSize:'28px'}}>📏</span>
                 <small style={{display:'block', fontSize:'11px', color:'#999', fontWeight:800, textTransform:'uppercase', marginTop:'8px'}}>Sizing</small>
                 <b style={{fontSize:'22px', fontFamily:'Bebas Neue'}}>{property.sq_ft || 'Standard'}</b>
             </div>
             <div className="spec-card">
                 <span style={{fontSize:'28px'}}>🏢</span>
                 <small style={{display:'block', fontSize:'11px', color:'#999', fontWeight:800, textTransform:'uppercase', marginTop:'8px'}}>Category</small>
                 <b style={{fontSize:'22px', fontFamily:'Bebas Neue'}}>{property.property_type}</b>
             </div>
          </div>

          <div style={{ marginTop: '40px', paddingBottom: '40px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#2D004F', borderBottom: '2px solid #F5EFFF', display: 'inline-block', marginBottom: '20px' }}>Asset Overview</h2>
            <p style={{ color: '#444', lineHeight: '1.8', fontSize: '18px', whiteSpace: 'pre-line' }}>{property.description}</p>
          </div>
        </div>

        <div className="desktop-sidebar">
           <div className="sticky-sidebar">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', color: '#2D004F' }}>Inquire Now</h3>
              {sent ? (
                <div style={{ background: '#F0FDF4', color: '#166534', padding: '20px', borderRadius: '12px', textAlign: 'center' }}><b>Inquiry Sent!</b></div>
              ) : (
                <form onSubmit={sendInquiry}>
                   <input required style={{width:'100%', padding:'18px', borderRadius:'12px', border:'1px solid #eee', marginBottom:'10px', fontSize: '16px'}} placeholder="Full Name" onChange={e => setInq({...inquiry, name: e.target.value})} />
                   <input required style={{width:'100%', padding:'18px', borderRadius:'12px', border:'1px solid #eee', marginBottom:'15px', fontSize: '16px'}} placeholder="Phone" onChange={e => setInq({...inquiry, phone: e.target.value})} />
                   <button type="submit" style={{width:'100%', padding:'20px', borderRadius:'12px', border:'none', background:'#2D004F', color:'white', fontWeight:800, cursor:'pointer', fontSize: '14px'}} disabled={sending}>SEND REQUEST</button>
                </form>
              )}
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                 <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1 }}><button style={{ width: '100%', background: 'white', color: '#2D004F', border: '1px solid #E5E7EB', padding: '15px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>CALL</button></a>
                 <a href={`https://wa.me/${agentPhone}?text=${encodedMessage}`} target="_blank" style={{ flex: 1 }}><button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>WHATSAPP</button></a>
              </div>
           </div>
        </div>
      </div>

      {/* MOBILE BAR - Always visible on small screens */}
      <div className="mobile-actions">
          <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#FFF', color: '#2D004F', border: '2px solid #2D004F', padding: '18px', borderRadius: '14px', fontSize: '14px', fontWeight: '800' }}>CALL LEAD</button>
          </a>
          <a href={`https://wa.me/${agentPhone}?text=${encodedMessage}`} target="_blank" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '18px', borderRadius: '14px', fontSize: '14px', fontWeight: '800' }}>WHATSAPP</button>
          </a>
      </div>
    </div>
  )
}