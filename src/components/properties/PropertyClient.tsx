'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PropertyClient({ property }: { property: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [activeImg, setActiveImg] = useState(0)
  const [inquiry, setInq] = useState({ name: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const images = property.property_images?.map((i: any) => i.url) || property.images || []
  const agentPhone = property.profiles?.phone?.replace(/\D/g, '')
  
  const message = `Hi, I am interested in viewing *${property.title}* in ${property.sub_counties?.name || 'this area'}. Please let me know the next available slot for a private briefing.`;
  const encodedMessage = encodeURIComponent(message);

  const sendInquiry = async (e: any) => {
    e.preventDefault()
    setSending(true)
    const { error } = await supabase.from('inquiries').insert([{
      property_id: property.id, 
      agent_id: property.owner_id, 
      sender_name: inquiry.name, 
      sender_phone: inquiry.phone, 
      message: inquiry.message
    }])
    if (!error) setSent(true)
    setSending(false)
  }

  return (
    <div style={{ background: '#FDFCF9', minHeight: '100vh', color: '#1B1464', paddingBottom: '120px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; scroll-behavior: smooth; }
        
        .main-wrapper { 
          max-width: 1300px; margin: 0 auto; padding: 0 20px; 
          display: grid; grid-template-columns: 1fr 420px; gap: 60px; 
        }
        
        .gallery-main { 
          width: 100%; height: 600px; object-fit: cover; border-radius: 24px; 
          box-shadow: 0 30px 60px rgba(45,0,79,0.08); background: #f0f0f0; 
        }
        
        .thumb-bar { display: flex; gap: 10px; margin-top: 15px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: none; }
        .thumb-bar::-webkit-scrollbar { display: none; }
        .thumb { width: 90px; height: 65px; object-fit: cover; border-radius: 10px; cursor: pointer; opacity: 0.5; transition: 0.3s; border: 2px solid transparent; flex-shrink: 0; }
        .thumb.active { opacity: 1; border-color: #7B2CBF; transform: scale(1.05); }
        
        .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px; margin: 40px 0; }
        .spec-card { background: white; border: 1px solid #E5E7EB; padding: 20px; border-radius: 16px; text-align: center; }
        .spec-card b { display: block; font-size: 20px; color: #2D004F; font-family: 'Bebas Neue'; letter-spacing: 1px; margin-top: 5px; }
        .spec-card small { color: #6B7280; text-transform: uppercase; font-size: 9px; font-weight: 800; letter-spacing: 1.5px; }

        .sticky-sidebar { 
          position: sticky; top: 40px; background: white; border: 1px solid #E5E7EB; 
          border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.04);
          will-change: transform; backface-visibility: hidden;
        }
        
        .form-input { width: 100%; background: #F8F9FA; border: 1px solid #E5E7EB; padding: 16px; border-radius: 12px; color: #1B1464; margin-bottom: 12px; outline: none; font-weight: 500; transition: 0.3s; box-sizing: border-box; }
        .form-input:focus { border-color: #7B2CBF; background: white; }
        
        .btn-violet { background: #2D004F; color: #fff; border: none; padding: 18px; border-radius: 12px; font-weight: 800; cursor: pointer; width: 100%; transition: 0.3s; letter-spacing: 1px; text-transform: uppercase; }
        .btn-violet:hover { background: #7B2CBF; transform: translateY(-2px); }
        
        .tooltip-container { position: relative; display: inline-block; cursor: help; margin-bottom: 15px; }
        .tooltip-box { visibility: hidden; opacity: 0; position: absolute; bottom: 130%; left: 0; width: 260px; background: #2D004F; color: white; padding: 15px; border-radius: 12px; z-index: 100; font-size: 11px; line-height: 1.6; transition: 0.3s; transform: translateY(10px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); pointer-events: none; }
        .tooltip-container:hover .tooltip-box { visibility: visible; opacity: 1; transform: translateY(0); }

        /* Mobile Adjustments to fix the "Hang" and "Responsive" issues */
        @media (max-width: 1100px) {
          .main-wrapper { grid-template-columns: 1fr; gap: 30px; }
          .gallery-main { height: 350px; }
          .header-stack { flex-direction: column; align-items: flex-start !important; gap: 20px; }
          .price-block { text-align: left !important; border-top: 1px solid #F1F5F9; pt-5; width: 100%; }
          .desktop-sidebar { display: none; }
          .mobile-actions { display: flex !important; }
          .spec-grid { grid-template-columns: 1fr 1fr; }
        }

        .mobile-actions { 
          position: fixed; bottom: 0; left: 0; right: 0; 
          background: rgba(255,255,255,0.98); backdrop-filter: blur(10px); 
          padding: 15px 20px; display: none; gap: 10px; border-top: 1px solid #EEE; 
          z-index: 9999; box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
          will-change: transform;
        }
      `}</style>

      {/* ── RESPONSIVE HEADER ── */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 20px 20px' }}>
        <Link href="/listings" style={{ display: 'inline-block', background: '#FFF', border: '1px solid #E5E7EB', color: '#6B7280', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', marginBottom: '30px', fontWeight: '800', fontSize: '11px', letterSpacing: '1px' }}>
          ← BACK TO INVENTORY
        </Link>

        <div className="header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '30px' }}>
          <div style={{ flex: 1 }}>
            <div className="tooltip-container">
              <span style={{ background: '#F5EFFF', color: '#7B2CBF', padding: '4px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>
                VERIFIED ASSET ✓
              </span>
              <div className="tooltip-box">
                <b style={{ color: '#7B2CBF', display: 'block', marginBottom: '4px' }}>Betterment Verification</b>
                Official Betterment Group Limited listing. Title deed and site authenticity confirmed.
              </div>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, margin: '10px 0', lineHeight: 1, letterSpacing: '-1.5px', color: '#2D004F' }}>
                {property.title}
            </h1>
            <p style={{ color: '#6B7280', fontWeight: '600', fontSize: '15px' }}>📍 {property.sub_counties?.name || 'Private Location'}, {property.counties?.name}</p>
          </div>
          
          <div className="price-block" style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#7B2CBF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Market Valuation</p>
            <div style={{ color: '#2D004F', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: '800', fontFamily: 'Bebas Neue', lineHeight: 1 }}>
              KES {property.price?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="main-wrapper">
        {/* LEFT COLUMN */}
        <div>
          <img className="gallery-main" src={images[activeImg] || property.images?.[0]} alt="Asset Hero" />
          
          <div className="thumb-bar">
            {images.map((img: string, i: number) => (
              <img key={i} src={img} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} alt="Thumb" />
            ))}
          </div>

          <div className="spec-grid">
             {property.property_type !== 'land' && (
                <div className="spec-card"><span>🏠</span><small>Rooms</small><b>{property.bedrooms || '—'}</b></div>
             )}
             <div className="spec-card"><span>📏</span><small>Sizing</small><b>{property.sq_ft ? `${property.sq_ft} SqFt` : 'Standard'}</b></div>
             <div className="spec-card"><span>🏢</span><small>Category</small><b>{property.property_type?.replace('_', ' + ')}</b></div>
             <div className="spec-card"><span>🔑</span><small>Market</small><b>{property.listing_purpose}</b></div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#2D004F', borderBottom: '2px solid #F5EFFF', display: 'inline-block', marginBottom: '25px', paddingBottom: '5px' }}>Asset Overview</h2>
            <p style={{ color: '#444', lineHeight: '1.9', fontSize: '17px', whiteSpace: 'pre-line' }}>{property.description}</p>
          </div>

          {property.features && property.features.length > 0 && (
            <div style={{ marginTop: '50px', background: '#F8F9FB', padding: '30px', borderRadius: '24px', border: '1px solid #E5E7EB' }}>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#2D004F', marginBottom: '25px' }}>
                Specifications <span style={{ color: '#7B2CBF' }}>& Features</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                {property.features.map((feature: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1B1464', fontSize: '14px', fontWeight: '600', background: 'white', border: '1px solid #F1F5F9', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F5EFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B2CBF', fontSize: '10px' }}>✓</div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="desktop-sidebar">
           <div className="sticky-sidebar">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: '#2D004F' }}>Arrange Briefing</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '30px', fontWeight: '500' }}>Portfolio Lead: <b>{property.profiles?.full_name}</b></p>
              
              {sent ? (
                <div style={{ background: '#F0FDF4', color: '#166534', padding: '25px', borderRadius: '12px', textAlign: 'center', fontSize: '14px', border: '1px solid #BBF7D0' }}>
                   <b>INQUIRY SENT</b><br/>We will contact you shortly.
                </div>
              ) : (
                <form onSubmit={sendInquiry}>
                   <input required className="form-input" placeholder="Full Name" value={inquiry.name} onChange={e => setInq({...inquiry, name: e.target.value})} />
                   <input required className="form-input" placeholder="Contact Phone" value={inquiry.phone} onChange={e => setInq({...inquiry, phone: e.target.value})} />
                   <textarea rows={4} className="form-input" placeholder="I would like to request more details regarding this asset..." value={inquiry.message} onChange={e => setInq({...inquiry, message: e.target.value})} />
                   <button type="submit" className="btn-violet" disabled={sending}>{sending ? '...' : 'SEND REQUEST'}</button>
                </form>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                 <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1 }}><button style={{ width: '100%', background: 'white', color: '#2D004F', border: '1px solid #E5E7EB', padding: '15px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>CALL</button></a>
                 <a href={`https://wa.me/${agentPhone}?text=${encodedMessage}`} target="_blank" style={{ flex: 1 }}><button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>WHATSAPP</button></a>
              </div>
           </div>
        </div>
      </div>

      <div className="mobile-actions">
          <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#FFF', color: '#2D004F', border: '1px solid #DDD', padding: '18px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>CALL LEAD</button>
          </a>
          <a href={`https://wa.me/${agentPhone}?text=${encodedMessage}`} target="_blank" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '18px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>WHATSAPP</button>
          </a>
      </div>
    </div>
  )
}