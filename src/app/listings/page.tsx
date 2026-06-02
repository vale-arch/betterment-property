'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ListingsPage() {
  const supabase = createClient()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState({ type: 'all', purpose: 'all' })

  useEffect(() => {
    setMounted(true)
    fetchListings()
  }, [filter])

  const fetchListings = async () => {
    setLoading(true)
    let query = supabase.from('properties').select('*, property_images(url)').eq('listing_status', 'active')
    if (filter.type !== 'all') query = query.eq('property_type', filter.type)
    if (filter.purpose !== 'all') query = query.eq('listing_purpose', filter.purpose)
    
    const { data } = await query.order('created_at', { ascending: false })
    if (data) setListings(data)
    setLoading(false)
  }

  if (!mounted) return null

  return (
    <div style={{ background: '#080810', minHeight: '100vh', color: '#fff', paddingBottom: '80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; margin: 0; }

        /* --- Hero & Filters --- */
        .hero-section { 
          background: linear-gradient(to bottom, rgba(8,8,16,0.7), #080810), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'); 
          background-size: cover; 
          background-position: center; 
          padding: 120px 20px 60px; 
          text-align: center; 
        }

        .filter-container {
          display: inline-flex;
          gap: 12px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(15px);
          padding: 10px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          margin-top: 30px;
        }

        .filter-select { 
          background: transparent; 
          border: none; 
          color: #fff; 
          padding: 10px 20px; 
          border-radius: 12px; 
          outline: none; 
          cursor: pointer; 
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 14px;
          transition: 0.3s; 
        }
        .filter-select:hover { background: rgba(255,255,255,0.05); }
        .filter-select option { background: #0c0c0c; color: #fff; }

        /* --- Grid & Cards --- */
        .listings-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
          gap: 30px; 
          padding: 0 40px; 
          max-width: 1400px; 
          margin: 0 auto; 
        }

        .p-card { 
          background: #111118; 
          border-radius: 28px; 
          border: 1px solid rgba(255,255,255,0.05); 
          overflow: hidden; 
          transition: all 0.4s cubic-bezier(0.2, 0, 0, 1);
          cursor: pointer;
        }
        .p-card:hover { 
          transform: translateY(-10px); 
          border-color: rgba(201,168,76,0.3); 
          box-shadow: 0 20px 40px rgba(0,0,0,0.6); 
        }

        .p-img-wrapper { height: 240px; width: 100%; position: relative; overflow: hidden; }
        .p-img { width: 100%; height: 100%; object-fit: cover; transition: 0.8s ease; }
        .p-card:hover .p-img { transform: scale(1.1); }

        .price-badge { 
          position: absolute; bottom: 15px; left: 15px; 
          background: #C9A84C; color: #000; 
          padding: 6px 16px; border-radius: 12px; 
          font-weight: 900; font-size: 20px; font-family: 'Bebas Neue'; 
          box-shadow: 0 4px 15px rgba(201,168,76,0.4);
        }

        .type-tag { 
          position: absolute; top: 15px; left: 15px; 
          background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); 
          padding: 5px 12px; border-radius: 8px; 
          font-size: 10px; font-weight: 800; 
          text-transform: uppercase; letter-spacing: 1px; 
          border: 1px solid rgba(255,255,255,0.1);
        }

        .verified-dot { color: #4ade80; font-size: 12px; display: flex; align-items: center; gap: 4px; font-weight: bold; }

        /* --- Shimmer Effect --- */
        .shimmer {
          background: linear-gradient(90deg, #111 25%, #1a1a25 50%, #111 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* --- MOBILE OPTIMIZATIONS --- */
        @media (max-width: 768px) {
          .hero-section { padding: 100px 20px 40px; }
          .hero-section h1 { font-size: 3rem !important; line-height: 1; }
          
          .filter-container { 
            flex-direction: column; 
            width: 100%; 
            padding: 8px; 
            border-radius: 18px; 
            margin-top: 20px;
          }
          .filter-select { width: 100%; text-align: center; border: 1px solid rgba(255,255,255,0.05); }

          .listings-grid { grid-template-columns: 1fr; padding: 0 20px; gap: 20px; }
          .p-img-wrapper { height: 200px; }
        }
      `}</style>

      {/* ── HEADER & FILTERS ── */}
      <section className="hero-section">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '5.5rem', letterSpacing: '-1px', marginBottom: '8px' }}>
          Explore <span style={{ color: '#C9A84C' }}>Verified</span> Properties
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>Premium real estate listings curated for the Kenyan market</p>
        
        <div className="filter-container">
          <select className="filter-select" onChange={(e) => setFilter({...filter, type: e.target.value})}>
            <option value="all">ALL PROPERTY TYPES</option>
            <option value="house">HOUSES</option>
            <option value="apartment">APARTMENTS</option>
            <option value="land">LAND / PLOTS</option>
            <option value="commercial">COMMERCIAL</option>
          </select>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: 'auto' }} className="desktop-nav" />
          <select className="filter-select" onChange={(e) => setFilter({...filter, purpose: e.target.value})}>
            <option value="all">ANY PURPOSE</option>
            <option value="sale">FOR SALE</option>
            <option value="rent">FOR RENT</option>
          </select>
        </div>
      </section>

      {/* ── LISTINGS GRID ── */}
      <div className="listings-grid">
        {loading ? (
           // Premium Skeletons
           [1,2,3,4,5,6].map(i => (
             <div key={i} className="shimmer" style={{ height: '380px', borderRadius: '28px' }}></div>
           ))
        ) : listings.length > 0 ? (
          listings.map(p => (
            <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="p-card">
                <div className="p-img-wrapper">
                  <img 
                    className="p-img" 
                    src={p.property_images?.[0]?.url || 'https://via.placeholder.com/600x400?text=Betterment+Property'} 
                    alt={p.title}
                  />
                  <div className="type-tag">{p.property_type}</div>
                  <div className="price-badge">KES {p.price?.toLocaleString()}</div>
                </div>
                
                <div style={{ padding: '25px' }}>
                  <div className="verified-dot">
                     <span>✅</span> VERIFIED LISTING
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '20px', margin: '12px 0', textTransform: 'capitalize', fontWeight: '700' }}>
                    {p.title}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '15px', color: '#555', fontSize: '13px', fontWeight: 'bold' }}>
                    <span>🛏 {p.bedrooms || 0} BEDS</span>
                    <span>🚿 {p.bathrooms || 0} BATHS</span>
                    <span>📐 {p.listing_purpose === 'sale' ? 'FOR SALE' : 'FOR RENT'}</span>
                  </div>

                  <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#C9A84C', fontWeight: '900', fontSize: '12px', letterSpacing: '1px' }}>VIEW DETAILS →</span>
                    <span style={{ color: '#333', fontSize: '11px' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
             <p style={{ color: '#333', fontSize: '18px', fontWeight: '600' }}>No active listings found matching your search.</p>
             <button onClick={() => setFilter({type: 'all', purpose: 'all'})} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  )
}