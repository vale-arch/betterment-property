'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ListingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Data States
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // UI Logic States
  const [filter, setFilter] = useState({ type: 'all', purpose: 'all' })
  const [openDropdown, setOpenDropdown] = useState<string | null>(null) // 'type' | 'purpose' | null

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

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  if (!mounted) return null

  return (
    <div style={{ background: '#080810', minHeight: '100vh', color: '#fff', paddingBottom: '100px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; margin: 0; }

        /* --- Back Arrow --- */
        .back-btn {
          position: fixed; top: 25px; left: 25px; z-index: 1001;
          background: rgba(12, 12, 12, 0.5); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          padding: 10px 15px; color: #C9A84C; text-decoration: none;
          display: flex; align-items: center; gap: 8px; font-weight: 800;
          font-size: 12px; transition: 0.3s ease;
        }
        .back-btn:hover { background: #C9A84C; color: #000; transform: translateX(-5px); }

        /* --- Hero --- */
        .hero-section { 
          background: linear-gradient(to bottom, rgba(8,8,16,0.8), #080810), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'); 
          background-size: cover; background-position: center; 
          padding: 140px 20px 60px; text-align: center; 
        }

        /* --- Custom Premium Dropdown --- */
        .filter-grid { display: flex; gap: 15px; justify-content: center; margin-top: 30px; }
        
        .custom-dropdown { position: relative; width: 280px; }
        
        .dropdown-trigger {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          padding: 14px 20px; border-radius: 16px; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          font-weight: 700; font-size: 13px; letter-spacing: 0.5px; transition: 0.3s;
        }
        .dropdown-trigger:hover { border-color: #C9A84C; background: rgba(255,255,255,0.08); }

        .dropdown-content {
          position: absolute; top: 110%; left: 0; right: 0; 
          background: #111118; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1);
          z-index: 100; overflow: hidden;
          max-height: 0; opacity: 0; transform: translateY(-10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .dropdown-content.show { max-height: 400px; opacity: 1; transform: translateY(0); padding: 8px; }

        .dropdown-item {
          padding: 12px 18px; border-radius: 12px; cursor: pointer; font-size: 14px;
          color: rgba(255,255,255,0.6); transition: 0.2s; font-weight: 500;
        }
        .dropdown-item:hover { background: rgba(201,168,76,0.1); color: #C9A84C; }
        .dropdown-item.active { background: rgba(201,168,76,0.05); color: #C9A84C; font-weight: 700; }

        /* --- Cards --- */
        .listings-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); 
          gap: 35px; padding: 0 50px; max-width: 1400px; margin: 0 auto; 
        }

        .p-card { 
          background: #111118; border-radius: 30px; border: 1px solid rgba(255,255,255,0.04); 
          overflow: hidden; transition: all 0.4s cubic-bezier(0.2, 0, 0, 1); cursor: pointer;
        }
        .p-card:hover { transform: translateY(-12px); border-color: rgba(201,168,76,0.3); }

        .price-chip { 
          position: absolute; bottom: 20px; left: 20px; 
          background: #C9A84C; color: #000; padding: 8px 18px; 
          border-radius: 14px; font-weight: 900; font-size: 22px; font-family: 'Bebas Neue'; 
        }

        .shimmer { background: linear-gradient(90deg, #0c0c0c 25%, #16161c 50%, #0c0c0c 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 768px) {
          .back-btn { top: 15px; left: 15px; }
          .hero-section h1 { font-size: 3.2rem !important; }
          .filter-grid { flex-direction: column; padding: 0 20px; }
          .custom-dropdown { width: 100%; }
          .listings-grid { grid-template-columns: 1fr; padding: 0 20px; }
        }
      `}</style>

      {/* ── TOP NAV ACTION ── */}
      <Link href="/" className="back-btn">
        <span>←</span> HOME
      </Link>

      {/* ── HERO & CUSTOM FILTERS ── */}
      <section className="hero-section">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '6rem', letterSpacing: '-1px', lineHeight: 0.9 }}>
          Exclusive <span style={{ color: '#C9A84C' }}>Kenya</span> Properties
        </h1>
        <p style={{ color: '#555', marginTop: '15px' }}>Discover verified luxury homes and land across the country.</p>
        
        <div className="filter-grid">
          {/* Custom Property Type Dropdown */}
          <div className="custom-dropdown">
             <div className="dropdown-trigger" onClick={() => toggleDropdown('type')}>
                <span>{filter.type === 'all' ? 'ALL CATEGORIES' : filter.type.toUpperCase()}</span>
                <span style={{ color: '#C9A84C', transition: '0.3s', transform: openDropdown === 'type' ? 'rotate(180deg)' : 'none' }}>▼</span>
             </div>
             <div className={`dropdown-content ${openDropdown === 'type' ? 'show' : ''}`}>
                {['all', 'house', 'apartment', 'land', 'commercial'].map(item => (
                  <div key={item} className={`dropdown-item ${filter.type === item ? 'active' : ''}`} onClick={() => { setFilter({...filter, type: item}); setOpenDropdown(null); }}>
                    {item === 'all' ? 'VIEW ALL CATEGORIES' : item.toUpperCase()}
                  </div>
                ))}
             </div>
          </div>

          {/* Custom Purpose Dropdown */}
          <div className="custom-dropdown">
             <div className="dropdown-trigger" onClick={() => toggleDropdown('purpose')}>
                <span>{filter.purpose === 'all' ? 'ANY STATUS' : filter.purpose === 'sale' ? 'FOR SALE' : 'FOR RENT'}</span>
                <span style={{ color: '#C9A84C', transition: '0.3s', transform: openDropdown === 'purpose' ? 'rotate(180deg)' : 'none' }}>▼</span>
             </div>
             <div className={`dropdown-content ${openDropdown === 'purpose' ? 'show' : ''}`}>
                {['all', 'sale', 'rent'].map(item => (
                  <div key={item} className={`dropdown-item ${filter.purpose === item ? 'active' : ''}`} onClick={() => { setFilter({...filter, purpose: item}); setOpenDropdown(null); }}>
                    {item === 'all' ? 'ALL STATUS' : item === 'sale' ? 'BUY PROPERTY' : 'RENT PROPERTY'}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* ── LISTINGS FEED ── */}
      <div className="listings-grid">
        {loading ? (
           [1,2,3].map(i => <div key={i} className="shimmer" style={{ height: '400px', borderRadius: '30px' }}></div>)
        ) : listings.length > 0 ? (
          listings.map(p => (
            <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="p-card">
                <div style={{ position: 'relative', overflow: 'hidden', height: '260px' }}>
                  <img 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    src={p.property_images?.[0]?.url || 'https://via.placeholder.com/600x400?text=Listing+Photo'} 
                    alt={p.title}
                  />
                  <div className="price-chip">KES {p.price?.toLocaleString()}</div>
                </div>
                
                <div style={{ padding: '30px' }}>
                  <div style={{ color: '#4ade80', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', marginBottom: '10px' }}>
                    VERIFIED ASSET
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '22px', margin: '0 0 10px', textTransform: 'capitalize', fontFamily: 'Outfit' }}>
                    {p.title}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '20px', color: '#444', fontSize: '13px', fontWeight: 'bold' }}>
                    <span>🛏 {p.bedrooms || 0} BEDS</span>
                    <span>🚿 {p.bathrooms || 0} BATHS</span>
                  </div>

                  <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#C9A84C', fontWeight: '900', fontSize: '11px', letterSpacing: '1.5px' }}>VIEW LISTING →</span>
                    <span style={{ color: '#222', fontSize: '10px' }}>{new Date(p.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#444' }}>
             No properties match your current filters.
          </div>
        )}
      </div>
    </div>
  )
}