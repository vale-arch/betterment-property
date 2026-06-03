'use client'

import { useState, useEffect } from 'react'
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchListings()
  }, [filter])

  const fetchListings = async () => {
    setLoading(true)
    let query = supabase.from('properties').select('*, property_images(url), counties(name), sub_counties(name)').eq('listing_status', 'active')
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
    <div style={{ background: '#FDFCF9', minHeight: '100vh', color: '#1A1A1A', paddingBottom: '100px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; margin: 0; background: #FDFCF9; }

        /* --- Back Arrow --- */
        .back-btn {
          position: fixed; top: 25px; left: 25px; z-index: 1001;
          background: white; border: 1px solid #EEE; border-radius: 100px;
          padding: 10px 20px; color: #A3432F; text-decoration: none;
          display: flex; align-items: center; gap: 8px; font-weight: 800;
          font-size: 11px; transition: 0.3s ease; box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .back-btn:hover { background: #A3432F; color: #fff; transform: translateX(-5px); }

        /* --- Hero --- */
        .hero-section { 
          background: linear-gradient(rgba(253, 252, 249, 0.9), rgba(253, 252, 249, 1)), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'); 
          background-size: cover; background-position: center; 
          padding: 120px 20px 60px; text-align: center; 
        }

        /* --- Custom Premium Dropdown --- */
        .filter-grid { display: flex; gap: 15px; justify-content: center; margin-top: 30px; }
        
        .custom-dropdown { position: relative; width: 280px; }
        
        .dropdown-trigger {
          background: white; border: 1px solid #EEE;
          padding: 16px 25px; border-radius: 100px; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          font-weight: 700; font-size: 12px; letter-spacing: 0.5px; transition: 0.3s;
          box-shadow: 0 5px 15px rgba(0,0,0,0.02);
        }
        .dropdown-trigger:hover { border-color: #A3432F; }

        .dropdown-content {
          position: absolute; top: 110%; left: 0; right: 0; 
          background: white; border-radius: 20px; border: 1px solid #EEE;
          z-index: 100; overflow: hidden;
          max-height: 0; opacity: 0; transform: translateY(-10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .dropdown-content.show { max-height: 400px; opacity: 1; transform: translateY(0); padding: 10px; }

        .dropdown-item {
          padding: 12px 18px; border-radius: 12px; cursor: pointer; font-size: 13px;
          color: #666; transition: 0.2s; font-weight: 600;
        }
        .dropdown-item:hover { background: #FCFAF7; color: #A3432F; }
        .dropdown-item.active { background: rgba(163, 67, 47, 0.05); color: #A3432F; font-weight: 800; }

        /* --- Cards --- */
        .listings-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
          gap: 35px; padding: 0 40px; max-width: 1400px; margin: 0 auto; 
        }

        .p-card { 
          background: white; border-radius: 32px; border: 1px solid rgba(0,0,0,0.04); 
          overflow: hidden; transition: 0.4s; cursor: pointer;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }
        .p-card:hover { transform: translateY(-10px); border-color: #C9A84C; box-shadow: 0 30px 60px rgba(0,0,0,0.08); }

        .price-chip { 
          position: absolute; bottom: 20px; left: 20px; 
          background: #A3432F; color: #FFF; padding: 6px 18px; 
          border-radius: 12px; font-weight: 800; font-size: 22px; font-family: 'Bebas Neue'; 
          box-shadow: 0 10px 20px rgba(163, 67, 47, 0.2);
        }

        .shimmer { background: linear-gradient(90deg, #F5F5F5 25%, #FFF 50%, #F5F5F5 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 768px) {
          .back-btn { top: 15px; left: 15px; padding: 8px 15px; }
          .hero-section h1 { font-size: 3.5rem !important; }
          .filter-grid { flex-direction: column; padding: 0 20px; }
          .custom-dropdown { width: 100%; }
          .listings-grid { grid-template-columns: 1fr; padding: 0 20px; }
        }
      `}</style>

      {/* ── TOP NAV ACTION ── */}
      <Link href="/" className="back-btn">
        <span>←</span> BACK HOME
      </Link>

      {/* ── HERO & FILTERS ── */}
      <section className="hero-section">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '5.5rem', letterSpacing: '-1px', lineHeight: 0.9, color: '#1A1A1A' }}>
          Marketplace <span style={{ color: '#A3432F' }}>Inventory</span>
        </h1>
        <p style={{ color: '#888', marginTop: '15px', fontWeight: '500' }}>Hand-picked verified listings across Kenya's 47 counties.</p>
        
        <div className="filter-grid">
          {/* Custom Property Type Dropdown */}
          <div className="custom-dropdown">
             <div className="dropdown-trigger" onClick={() => toggleDropdown('type')}>
                <span style={{ color: '#999', fontSize: '10px', marginRight: '10px' }}>TYPE:</span>
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
                <span style={{ color: '#999', fontSize: '10px', marginRight: '10px' }}>STATUS:</span>
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
           [1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ height: '420px', borderRadius: '32px' }}></div>)
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
                  <div style={{ color: '#C9A84C', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', marginBottom: '8px' }}>
                    VERIFIED ✓
                  </div>
                  <h3 style={{ color: '#1A1A1A', fontSize: '20px', margin: '0 0 10px', textTransform: 'capitalize', fontWeight: '700' }}>
                    {p.title}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '15px', color: '#888', fontSize: '13px', fontWeight: '500' }}>
                    <span>🛏 {p.bedrooms || 0}</span>
                    <span>🚿 {p.bathrooms || 0}</span>
                    <span>📍 {p.sub_counties?.name || 'Kenya'}</span>
                  </div>

                  <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F5F5F5', paddingTop: '20px' }}>
                    <span style={{ color: '#A3432F', fontWeight: '800', fontSize: '11px', letterSpacing: '1px' }}>VIEW DETAILS →</span>
                    <span style={{ color: '#DDD', fontSize: '10px', fontWeight: '900' }}>ID: {p.id.slice(0,5)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#999', fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>
             No properties match your current filters.
          </div>
        )}
      </div>
    </div>
  )
}