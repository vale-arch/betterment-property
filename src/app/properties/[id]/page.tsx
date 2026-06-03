'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [inquiry, setInq] = useState({ name: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    async function getData() {
      const { data } = await supabase.from('properties').select('*, profiles:owner_id (*), property_images(*)').eq('id', id).single()
      if (data) setProperty(data)
      setLoading(false)
    }
    if (id) getData()
  }, [id])

  const sendInquiry = async (e: any) => {
    e.preventDefault()
    setSending(true)
    const { error } = await supabase.from('inquiries').insert([{
      property_id: id, agent_id: property.owner_id, 
      sender_name: inquiry.name, sender_phone: inquiry.phone, message: inquiry.message
    }])
    if (!error) setSent(true)
    setSending(false)
  }

  if (loading) return <div style={{ background: '#FDFCF9', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A3432F', fontFamily: 'Bebas Neue', fontSize: '2rem' }}>Loading details...</div>
  if (!property) return <div style={{ background: '#FDFCF9', color: '#222', padding: '100px', textAlign: 'center' }}>Property not found.</div>

  const images = property.property_images?.map((i: any) => i.url) || []
  const agentPhone = property.profiles?.phone?.replace(/\D/g, '')

  return (
    <div style={{ background: '#FDFCF9', minHeight: '100vh', color: '#1A1A1A', paddingBottom: '120px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Outfit', sans-serif; margin: 0; }
        
        .main-wrapper { max-width: 1300px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: 1fr 400px; gap: 50px; }
        
        .gallery-main { width: 100%; height: 600px; object-fit: cover; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .thumb { width: 90px; height: 70px; object-fit: cover; border-radius: 12px; cursor: pointer; opacity: 0.6; transition: 0.3s; border: 2px solid transparent; }
        .thumb.active { opacity: 1; border-color: #C9A84C; }
        
        .spec-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 35px; }
        .spec-card { background: white; border: 1px solid rgba(0,0,0,0.04); padding: 25px 15px; border-radius: 24px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.02); }
        .spec-card span { font-size: 24px; display: block; margin-bottom: 8px; }
        .spec-card b { display: block; font-size: 20px; color: #1A1A1A; font-family: 'Bebas Neue'; letter-spacing: 1px; }
        .spec-card small { color: #A3432F; text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 1px; }

        .sticky-sidebar { position: sticky; top: 40px; background: white; border: 1px solid rgba(201,168,76,0.15); border-radius: 32px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); }
        
        .form-input { width: 100%; background: #F9F9F9; border: 1px solid #EEE; padding: 16px; border-radius: 16px; color: #1A1A1A; margin-bottom: 12px; outline: none; font-family: inherit; transition: 0.3s; box-sizing: border-box; }
        .form-input:focus { border-color: #A3432F; background: white; }
        
        .btn-terracotta { background: #A3432F; color: #fff; border: none; padding: 18px; border-radius: 100px; font-weight: 700; cursor: pointer; width: 100%; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px; }
        .btn-terracotta:hover { background: #8E3A26; transform: translateY(-2px); }
        
        /* Mobile Sticky Actions */
        .mobile-actions { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 20px; display: none; gap: 12px; z-index: 1000; border-top: 1px solid #EEE; }

        @media (max-width: 1100px) {
          .main-wrapper { grid-template-columns: 1fr; padding: 20px; }
          .gallery-main { height: 400px; }
          .desktop-sidebar { display: none; }
          .mobile-actions { display: flex; }
          .header-area { padding-top: 40px !important; }
          .spec-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* ── HEADER NAVIGATION ── */}
      <div className="header-area" style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 20px 20px' }}>
        <button 
          onClick={() => router.back()} 
          style={{ background: '#FFF', border: '1px solid #EEE', color: '#A3432F', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', marginBottom: '25px', fontWeight: '700', fontSize: '12px' }}
        >
          ← BACK TO MARKETPLACE
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginBottom: '5px', lineHeight: 0.9, color: '#1A1A1A' }}>
                {property.title}
            </h1>
            <p style={{ color: '#888', fontWeight: '500' }}>📍 {property.sub_counties?.name}, {property.counties?.name}</p>
          </div>
          <div style={{ color: '#C9A84C', fontSize: '3rem', fontWeight: 'bold', fontFamily: 'Bebas Neue', lineHeight: 1 }}>
            KES {property.price?.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="main-wrapper">
        {/* Left Side: Media & Info */}
        <div style={{ overflow: 'hidden' }}>
          <img className="gallery-main" src={images[activeImg]} alt="Property Main" />
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
            {images.map((img: string, i: number) => (
              <img key={i} src={img} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} alt="Thumb" />
            ))}
          </div>

          <div className="spec-grid">
             <div className="spec-card"><span>🛌</span><b>{property.bedrooms || 0}</b><small>Bedrooms</small></div>
             <div className="spec-card"><span>🛁</span><b>{property.bathrooms || 0}</b><small>Bathrooms</small></div>
             <div className="spec-card"><span>🏡</span><b>{property.property_type}</b><small>Type</small></div>
             <div className="spec-card"><span>🔑</span><b>{property.listing_purpose}</b><small>Purpose</small></div>
          </div>

          <div style={{ marginTop: '60px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#A3432F', marginBottom: '20px', letterSpacing: '1px' }}>Property Description</h2>
            <p style={{ color: '#555', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-line' }}>{property.description}</p>
          </div>
          
          {/* Mobile Only Inquiry Form */}
          <div style={{ marginTop: '50px' }} className="mobile-actions-form md:hidden">
              <div style={{ background: 'white', padding: '30px', borderRadius: '32px', border: '1px solid #EEE' }}>
                  <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', marginBottom: '20px' }}>Make an Inquiry</h3>
                  {sent ? (
                    <div style={{ color: '#22C55E', fontWeight: 'bold', textAlign: 'center' }}>✅ Inquiry sent successfully!</div>
                  ) : (
                    <form onSubmit={sendInquiry}>
                        <input required className="form-input" placeholder="Your Full Name" value={inquiry.name} onChange={e => setInq({...inquiry, name: e.target.value})} />
                        <input required className="form-input" placeholder="Phone Number" value={inquiry.phone} onChange={e => setInq({...inquiry, phone: e.target.value})} />
                        <textarea rows={4} className="form-input" placeholder="Message to agent..." value={inquiry.message} onChange={e => setInq({...inquiry, message: e.target.value})} />
                        <button type="submit" className="btn-terracotta" disabled={sending}>{sending ? 'SENDING...' : 'SEND INQUIRY'}</button>
                    </form>
                  )}
              </div>
          </div>
        </div>

        {/* Right Side: Desktop Sidebar */}
        <div className="desktop-sidebar">
           <div className="sticky-sidebar">
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', marginBottom: '5px', color: '#A3432F' }}>Contact Agent</h3>
              <p style={{ fontSize: '14px', color: '#888', marginBottom: '25px' }}>Listed by <b style={{ color: '#1A1A1A' }}>{property.profiles?.full_name}</b></p>
              
              {sent ? (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '20px', borderRadius: '20px', textAlign: 'center', fontSize: '14px' }}>
                   <b>Inquiry Sent!</b><br/>The agent will contact you soon.
                </div>
              ) : (
                <form onSubmit={sendInquiry}>
                   <input required className="form-input" placeholder="Full Name" value={inquiry.name} onChange={e => setInq({...inquiry, name: e.target.value})} />
                   <input required className="form-input" placeholder="Phone" value={inquiry.phone} onChange={e => setInq({...inquiry, phone: e.target.value})} />
                   <textarea rows={4} className="form-input" placeholder="I am interested in this property..." value={inquiry.message} onChange={e => setInq({...inquiry, message: e.target.value})} />
                   <button type="submit" className="btn-terracotta" disabled={sending}>{sending ? 'SENDING...' : 'CONTACT AGENT'}</button>
                </form>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                 <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1 }}><button style={{ width: '100%', background: 'white', color: '#1A1A1A', border: '1px solid #EEE', padding: '14px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>CALL</button></a>
                 <a href={`https://wa.me/${agentPhone}`} target="_blank" style={{ flex: 1 }}><button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '14px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>WHATSAPP</button></a>
              </div>
           </div>
        </div>
      </div>

      {/* ── MOBILE STICKY BAR ── */}
      <div className="mobile-actions">
          <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#FFF', color: '#1A1A1A', border: '1px solid #DDD', padding: '16px', borderRadius: '100px', fontSize: '13px', fontWeight: '800' }}>CALL AGENT</button>
          </a>
          <a href={`https://wa.me/${agentPhone}`} target="_blank" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '16px', borderRadius: '100px', fontSize: '13px', fontWeight: '800' }}>WHATSAPP</button>
          </a>
      </div>
    </div>
  )
}