'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

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

  if (loading) return <div style={{ background: '#080810', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C' }}>Loading details...</div>
  if (!property) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Property not found.</div>

  const images = property.property_images?.map((i: any) => i.url) || []
  const agentPhone = property.profiles?.phone?.replace(/\D/g, '')

  return (
    <div style={{ background: '#080810', minHeight: '100vh', color: '#fff', paddingBottom: '120px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Outfit', sans-serif; margin: 0; }
        
        .main-wrapper { max-width: 1200px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
        
        .gallery-main { width: 100%; height: 500px; object-fit: cover; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); }
        .thumb { width: 80px; height: 60px; object-fit: cover; border-radius: 10px; cursor: pointer; opacity: 0.5; transition: 0.3s; border: 2px solid transparent; flex-shrink: 0; }
        .thumb.active { opacity: 1; border-color: #C9A84C; }
        
        .spec-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 30px; }
        .spec-card { background: #111118; border: 1px solid rgba(255,255,255,0.05); padding: 20px 10px; border-radius: 18px; text-align: center; }
        .spec-card b { display: block; font-size: 18px; color: #fff; }
        .spec-card small { color: #555; text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }

        .sticky-sidebar { position: sticky; top: 100px; background: #111118; border: 1px solid rgba(201,168,76,0.2); border-radius: 24px; padding: 24px; }
        
        .form-input { width: 100%; background: #080810; border: 1px solid #222; padding: 14px; border-radius: 12px; color: #fff; margin-bottom: 10px; outline: none; font-family: inherit; }
        .form-input:focus { border-color: #C9A84C; }
        
        .btn-gold { background: #C9A84C; color: #000; border: none; padding: 14px; border-radius: 12px; font-weight: 800; cursor: pointer; width: 100%; transition: 0.3s; }
        
        /* Mobile Sticky Actions */
        .mobile-actions { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(12,12,20,0.8); backdrop-filter: blur(20px); padding: 15px 20px; display: none; gap: 10px; z-index: 1000; border-top: 1px solid rgba(255,255,255,0.1); }

        @media (max-width: 1000px) {
          .main-wrapper { grid-template-columns: 1fr; padding: 15px; }
          .gallery-main { height: 300px; border-radius: 15px; }
          .spec-grid { grid-template-columns: repeat(2, 1fr); }
          .desktop-sidebar { display: none; }
          .mobile-actions { display: flex; }
          .header-area { padding-top: 80px !important; }
        }
      `}</style>

      {/* Header / Nav area */}
      <div className="header-area" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 20px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' }}>← Back to Listings</button>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '5px', lineHeight: 1 }}>{property.title}</h1>
        <div style={{ color: '#C9A84C', fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'Bebas Neue' }}>KES {property.price?.toLocaleString()}</div>
      </div>

      <div className="main-wrapper">
        {/* Left Side: Media & Info */}
        <div style={{ overflow: 'hidden' }}>
          <img className="gallery-main" src={images[activeImg]} alt="Property Main" />
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {images.map((img: string, i: number) => (
              <img key={i} src={img} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} alt="Thumb" />
            ))}
          </div>

          <div className="spec-grid">
             <div className="spec-card"><span>🛏</span><b>{property.bedrooms || 0}</b><small>Bedrooms</small></div>
             <div className="spec-card"><span>🚿</span><b>{property.bathrooms || 0}</b><small>Bathrooms</small></div>
             <div className="spec-card"><span>🏗</span><b>{property.property_type}</b><small>Type</small></div>
             <div className="spec-card"><span>📐</span><b>{property.listing_purpose}</b><small>Purpose</small></div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#C9A84C', marginBottom: '15px' }}>Description</h2>
            <p style={{ color: '#888', lineHeight: '1.7', fontSize: '15px', whiteSpace: 'pre-line' }}>{property.description}</p>
          </div>
          
          {/* On Mobile, the form goes here as well for those who scroll */}
          <div style={{ marginTop: '40px' }} className="mobile-only-form">
              <div style={{ background: '#111118', padding: '20px', borderRadius: '20px', border: '1px solid #222' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Inquire About This Property</h3>
                  {sent ? (
                    <div style={{ color: '#4ade80', fontWeight: 'bold' }}>✅ Inquiry sent! The agent will reach out.</div>
                  ) : (
                    <form onSubmit={sendInquiry}>
                        <input required className="form-input" placeholder="Your Name" value={inquiry.name} onChange={e => setInq({...inquiry, name: e.target.value})} />
                        <input required className="form-input" placeholder="Phone" value={inquiry.phone} onChange={e => setInq({...inquiry, phone: e.target.value})} />
                        <textarea rows={3} className="form-input" placeholder="Message..." value={inquiry.message} onChange={e => setInq({...inquiry, message: e.target.value})} />
                        <button type="submit" className="btn-gold" disabled={sending}>{sending ? 'Sending...' : 'Send Inquiry'}</button>
                    </form>
                  )}
              </div>
          </div>
        </div>

        {/* Right Side: Desktop Sidebar */}
        <div className="desktop-sidebar">
           <div className="sticky-sidebar">
              <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>Agent Information</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Listed by <b>{property.profiles?.full_name}</b></p>
              
              {sent ? (
                <div style={{ background: '#22C55E15', color: '#22C55E', padding: '10px', borderRadius: '12px', textAlign: 'center', fontSize: '14px' }}>
                   <b>Sent!</b> We'll be in touch.
                </div>
              ) : (
                <form onSubmit={sendInquiry}>
                   <input required className="form-input" placeholder="Name" value={inquiry.name} onChange={e => setInq({...inquiry, name: e.target.value})} />
                   <input required className="form-input" placeholder="Phone" value={inquiry.phone} onChange={e => setInq({...inquiry, phone: e.target.value})} />
                   <textarea rows={3} className="form-input" placeholder="Interested in this property..." value={inquiry.message} onChange={e => setInq({...inquiry, message: e.target.value})} />
                   <button type="submit" className="btn-gold" disabled={sending}>{sending ? 'Sending...' : 'Contact Agent'}</button>
                </form>
              )}

              <div style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                 <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1 }}><button style={{ width: '100%', background: '#3B82F6', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Call</button></a>
                 <a href={`https://wa.me/${agentPhone}`} target="_blank" style={{ flex: 1 }}><button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp</button></a>
              </div>
           </div>
        </div>
      </div>

      {/* ── MOBILE STICKY BAR ── */}
      <div className="mobile-actions">
          <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#3B82F6', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '14px', fontWeight: '800' }}>📞 CALL AGENT</button>
          </a>
          <a href={`https://wa.me/${agentPhone}`} target="_blank" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '14px', fontWeight: '800' }}>💬 WHATSAPP</button>
          </a>
      </div>
    </div>
  )
}