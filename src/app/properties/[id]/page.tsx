'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function PropertyDetailPage() {
  const { id } = useParams()
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

  if (loading) return <div style={{ background: '#080810', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  if (!property) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Property not found.</div>

  const images = property.property_images?.map((i: any) => i.url) || []

  return (
    <div style={{ background: '#080810', minHeight: '100vh', color: '#fff', paddingBottom: '100px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Outfit', sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; display: grid; grid-template-columns: 1fr 400px; gap: 40px; }
        .gallery-main { width: 100%; height: 500px; object-fit: cover; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); }
        .thumb { width: 100px; height: 70px; object-fit: cover; border-radius: 12px; cursor: pointer; opacity: 0.6; transition: 0.3s; }
        .thumb.active { opacity: 1; border: 2px solid #C9A84C; }
        .spec-card { background: #111118; border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; display: flex; flex-direction: column; gap: 5px; text-align: center; }
        .sticky-box { position: sticky; top: 100px; background: #111118; border: 1px solid #C9A84C33; border-radius: 24px; padding: 30px; }
        .form-input { width: 100%; background: #080810; border: 1px solid #222; padding: 15px; border-radius: 12px; color: #fff; margin-bottom: 12px; outline: none; }
        .form-input:focus { border-color: #C9A84C; }
        .btn-gold { background: #C9A84C; color: #000; border: none; padding: 15px; border-radius: 12px; font-weight: 800; cursor: pointer; width: 100%; transition: 0.3s; }
        .btn-gold:hover { transform: translateY(-2px); background: #E8C97A; }
        @media (max-width: 1000px) { .container { grid-template-columns: 1fr; } .gallery-main { height: 300px; } }
      `}</style>

      {/* Gallery Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 20px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '4rem', marginBottom: '10px' }}>{property.title}</h1>
        <div style={{ color: '#C9A84C', fontSize: '2rem', fontWeight: 'bold', fontFamily: 'Bebas Neue' }}>KES {property.price?.toLocaleString()}</div>
      </div>

      <div className="container">
        {/* Left Side */}
        <div>
          <img className="gallery-main" src={images[activeImg]} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
            {images.map((img: string, i: number) => (
              <img key={i} src={img} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '40px' }}>
             <div className="spec-card"><span style={{fontSize: '24px'}}>🛏</span><b>{property.bedrooms}</b><small style={{color: '#666'}}>Bedrooms</small></div>
             <div className="spec-card"><span style={{fontSize: '24px'}}>🚿</span><b>{property.bathrooms}</b><small style={{color: '#666'}}>Bathrooms</small></div>
             <div className="spec-card"><span style={{fontSize: '24px'}}>🏗</span><b>{property.property_type}</b><small style={{color: '#666'}}>Type</small></div>
             <div className="spec-card"><span style={{fontSize: '24px'}}>📐</span><b>{property.listing_purpose}</b><small style={{color: '#666'}}>Purpose</small></div>
          </div>

          <div style={{ marginTop: '50px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', marginBottom: '20px' }}>Description</h2>
            <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-line' }}>{property.description}</p>
          </div>
        </div>

        {/* Right Side Sticky Sidebar */}
        <div style={{ position: 'relative' }}>
           <div className="sticky-box">
              <h3 style={{ fontSize: '20px', marginBottom: '5px' }}>Contact Agent</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Listed by <b>{property.profiles?.full_name}</b></p>
              
              {sent ? (
                <div style={{ background: '#22C55E22', color: '#22C55E', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                   <b>Thank you!</b><br/>Your inquiry has been sent.
                </div>
              ) : (
                <form onSubmit={sendInquiry}>
                   <input required className="form-input" placeholder="Your Full Name" value={inquiry.name} onChange={e => setInq({...inquiry, name: e.target.value})} />
                   <input required className="form-input" placeholder="Phone Number" value={inquiry.phone} onChange={e => setInq({...inquiry, phone: e.target.value})} />
                   <textarea rows={4} className="form-input" placeholder="I am interested in this property..." value={inquiry.message} onChange={e => setInq({...inquiry, message: e.target.value})} />
                   <button type="submit" className="btn-gold" disabled={sending}>
                      {sending ? 'Sending...' : 'Send Message'}
                   </button>
                </form>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                 <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1 }}><button style={{ width: '100%', background: '#3B82F6', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>📞 Call</button></a>
                 <a href={`https://wa.me/${property.profiles?.phone?.replace(/\D/g, '')}`} target="_blank" style={{ flex: 1 }}><button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>💬 WhatsApp</button></a>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}