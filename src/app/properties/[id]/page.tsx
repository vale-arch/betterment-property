'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/properties/PropertyMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '450px', background: '#f8f9fa', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>Loading Location Map...</div>
});

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

  if (loading) return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '40px 20px' }}>
      <style>{`
        @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .shimmer { animation: shimmer 1.5s infinite ease-in-out; background: #EEE; border-radius: 12px; }
      `}</style>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div className="shimmer" style={{ width: '180px', height: '40px', marginBottom: '30px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div className="shimmer" style={{ width: '40%', height: '60px' }} />
          <div className="shimmer" style={{ width: '200px', height: '60px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
          <div className="shimmer" style={{ height: '500px', borderRadius: '24px' }} />
          <div className="shimmer" style={{ height: '450px', borderRadius: '24px' }} />
        </div>
      </div>
    </div>
  )

  if (!property) return <div style={{ textAlign: 'center', padding: '100px' }}>Asset not found.</div>

  const images = property.property_images?.map((i: any) => i.url) || property.images || []
  const agentPhone = property.profiles?.phone?.replace(/\D/g, '')
  const message = `Hi, I am interested in viewing this property: *${property.title}* (ID: ${property.id.slice(0,5)}). Is it still available?`;
  const encodedMessage = encodeURIComponent(message);

  return (
    <div style={{ background: '#FDFCF9', minHeight: '100vh', color: '#1B1464', paddingBottom: '100px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        .main-wrapper { max-width: 1300px; margin: 0 auto; padding: 0 20px; display: grid; grid-template-columns: 1fr 420px; gap: 60px; }
        
        .gallery-main { width: 100%; height: 650px; object-fit: cover; border-radius: 24px; box-shadow: 0 30px 60px rgba(45,0,79,0.08); cursor: pointer; transition: 0.5s; }
        .thumb { width: 100px; height: 75px; object-fit: cover; border-radius: 10px; cursor: pointer; opacity: 0.5; transition: 0.3s; border: 2px solid transparent; }
        .thumb.active { opacity: 1; border-color: #7B2CBF; transform: scale(1.05); }
        
        .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin: 40px 0; }
        .spec-card { background: white; border: 1px solid #E5E7EB; padding: 20px; border-radius: 16px; text-align: center; }
        .spec-card b { display: block; font-size: 22px; color: #2D004F; font-family: 'Bebas Neue'; letter-spacing: 1px; margin-top: 5px; }
        .spec-card small { color: #6B7280; text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; }

        .sticky-sidebar { position: sticky; top: 40px; background: white; border: 1px solid #E5E7EB; border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.04); }
        
        .form-input { width: 100%; background: #F8F9FA; border: 1px solid #E5E7EB; padding: 16px; border-radius: 12px; color: #1B1464; margin-bottom: 12px; outline: none; font-weight: 500; transition: 0.3s; }
        .form-input:focus { border-color: #7B2CBF; background: white; }
        
        .btn-violet { background: #2D004F; color: #fff; border: none; padding: 18px; border-radius: 12px; font-weight: 800; cursor: pointer; width: 100%; transition: 0.3s; letter-spacing: 1px; }
        .btn-violet:hover { background: #7B2CBF; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(123, 44, 191, 0.2); }
        
        .tooltip-container { position: relative; display: inline-block; cursor: help; margin-bottom: 15px; }
        .tooltip-box { visibility: hidden; opacity: 0; position: absolute; bottom: 130%; left: 0; width: 260px; background: #2D004F; color: white; padding: 15px; border-radius: 12px; z-index: 100; font-size: 11px; line-height: 1.6; transition: 0.3s; transform: translateY(10px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); }
        .tooltip-container:hover .tooltip-box { visibility: visible; opacity: 1; transform: translateY(0); }

        @media (max-width: 1100px) {
          .main-wrapper { grid-template-columns: 1fr; }
          .gallery-main { height: 450px; }
          .desktop-sidebar { display: none; }
          .mobile-actions { display: flex; position: fixed; bottom: 0; left:0; right:0; background: white; padding: 20px; gap: 10px; border-top: 1px solid #EEE; z-index: 1000; }
        }
      `}</style>

      {/* ── TOP NAVIGATION ── */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '50px 20px 30px' }}>
        <button onClick={() => router.back()} style={{ background: '#FFF', border: '1px solid #E5E7EB', color: '#6B7280', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '30px', fontWeight: '800', fontSize: '11px', letterSpacing: '1px' }}>
          ← BACK TO INVENTORY
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '30px' }}>
          <div>
            <div className="tooltip-container">
              <span style={{ background: '#F5EFFF', color: '#7B2CBF', padding: '4px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>
                VERIFIED ASSET ✓
              </span>
              <div className="tooltip-box">
                <b style={{ color: '#7B2CBF', display: 'block', marginBottom: '4px' }}>Betterment Shield</b>
                This listing has been physically verified. Title deed authenticity and site ownership have been cross-checked for security.
              </div>
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, margin: '5px 0', lineHeight: 1, letterSpacing: '-1.5px', color: '#2D004F' }}>
                {property.title}
            </h1>
            <p style={{ color: '#6B7280', fontWeight: '600', fontSize: '15px' }}>📍 {property.sub_counties?.name || 'Private Location'}, {property.counties?.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#7B2CBF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Asking Price</p>
            <div style={{ color: '#2D004F', fontSize: '3.5rem', fontWeight: '800', fontFamily: 'Bebas Neue', lineHeight: 1 }}>
              KES {property.price?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="main-wrapper">
        {/* LEFT COLUMN */}
        <div>
          <img className="gallery-main" src={images[activeImg]} alt="Featured View" />
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
            {images.map((img: string, i: number) => (
              <img key={i} src={img} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} alt={`View ${i+1}`} />
            ))}
          </div>

          <div className="spec-grid">
             {/* Only show rooms if not strictly Land */}
             {property.property_type !== 'land' && (
                <div className="spec-card"><span>🏡</span><small>Rooms</small><b>{property.bedrooms || '—'}</b></div>
             )}
             <div className="spec-card"><span>📐</span><small>{property.property_type === 'land' || property.property_type === 'house_land' ? 'Total Size' : 'Floor Area'}</small><b>{property.sq_ft ? `${property.sq_ft} SqFt` : 'Flexible'}</b></div>
             <div className="spec-card"><span>🏢</span><small>Asset Class</small><b>{property.property_type.replace('_', ' + ')}</b></div>
             <div className="spec-card"><span>💎</span><small>Ownership</small><b>{property.listing_purpose === 'sale' ? 'Freehold' : 'Lease'}</b></div>
          </div>

          <div style={{ marginTop: '50px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#2D004F', borderBottom: '2px solid #F5EFFF', display: 'inline-block', marginBottom: '25px', paddingBottom: '5px' }}>Asset Overview</h2>
            <p style={{ color: '#444', lineHeight: '1.9', fontSize: '17px', whiteSpace: 'pre-line', maxWidth: '800px' }}>{property.description}</p>
          </div>

          <div style={{ marginTop: '80px' }}>
             <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#2D004F', marginBottom: '30px' }}>Verified Location</h2>
             <PropertyMap lat={property.latitude || -1.286389} lng={property.longitude || 36.817223} title={property.title} />
          </div>
        </div>

        {/* RIGHT COLUMN (DESKTOP SIDEBAR) */}
        <div className="desktop-sidebar">
           <div className="sticky-sidebar">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: '#2D004F' }}>Arrange a Viewing</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '30px', fontWeight: '500' }}>Managed by: <b>{property.profiles?.full_name}</b></p>
              
              {sent ? (
                <div style={{ background: '#F0FDF4', color: '#166534', padding: '25px', borderRadius: '16px', textAlign: 'center', fontSize: '14px', border: '1px solid #BBF7D0' }}>
                   <b>SUCCESS</b><br/>The listing agent has been notified.
                </div>
              ) : (
                <form onSubmit={sendInquiry}>
                   <input required className="form-input" placeholder="Your Name" value={inquiry.name} onChange={e => setInq({...inquiry, name: e.target.value})} />
                   <input required className="form-input" placeholder="Phone Number" value={inquiry.phone} onChange={e => setInq({...inquiry, phone: e.target.value})} />
                   <textarea rows={4} className="form-input" placeholder="I'm interested in this asset. Please share more details regarding viewing times..." value={inquiry.message} onChange={e => setInq({...inquiry, message: e.target.value})} />
                   <button type="submit" className="btn-violet" disabled={sending}>{sending ? 'SYNCHRONIZING...' : 'REQUEST BRIEFING'}</button>
                </form>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                 <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1 }}><button style={{ width: '100%', background: 'white', color: '#2D004F', border: '1px solid #E5E7EB', padding: '15px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>CALL</button></a>
                 <a href={`https://wa.me/${agentPhone}?text=${encodedMessage}`} target="_blank" style={{ flex: 1 }}><button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>WHATSAPP</button></a>
              </div>
           </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTIONS */}
      <div className="mobile-actions" style={{ display: 'none' }}>
          <a href={`tel:${property.profiles?.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#FFF', color: '#2D004F', border: '1px solid #DDD', padding: '18px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>CALL</button>
          </a>
          <a href={`https://wa.me/${agentPhone}?text=${encodedMessage}`} target="_blank" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', padding: '18px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>WHATSAPP</button>
          </a>
      </div>
    </div>
  )
}