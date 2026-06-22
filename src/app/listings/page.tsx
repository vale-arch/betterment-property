'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabaseLoader } from '@/lib/image-loader'
import Image from 'next/image'
import SimilarProperties from '@/components/properties/SimilarProperties'
import PropertyClient from '@/components/properties/PropertyClient'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ListingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Pagination & Data States
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 6
  
  // UI Logic States
  const [filter, setFilter] = useState({ type: 'all', purpose: 'all' })
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchListings(true) // Reset listings whenever filters change
  }, [filter])

  const fetchListings = async (isReset = false) => {
    setLoading(true)
    const start = isReset ? 0 : page * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('properties')
      .select('*, property_images(url), counties(name), sub_counties(name)', { count: 'exact' })
      .eq('listing_status', 'active')

    if (filter.type !== 'all') query = query.eq('property_type', filter.type)
    if (filter.purpose !== 'all') query = query.eq('listing_purpose', filter.purpose)
    
    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end)

    if (data) {
      if (isReset) {
        setListings(data)
        setPage(1)
      } else {
        setListings(prev => [...prev, ...data])
        setPage(prev => prev + 1)
      }
      
      // Check if we've reached the end
      if (count && (isReset ? data.length : listings.length + data.length) >= count) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
    }
    setLoading(false)
  }

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  if (!mounted) return null

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', color: '#1B1464', paddingBottom: '120px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;800&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; margin: 0; }

        .back-btn {
          position: fixed; top: 25px; left: 25px; z-index: 1001;
          background: white; border: 1px solid #E5E7EB; border-radius: 12px;
          padding: 12px 24px; color: #2D004F; text-decoration: none;
          display: flex; align-items: center; gap: 8px; font-weight: 800;
          font-size: 11px; transition: 0.3s ease; box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          letter-spacing: 1px;
        }
        .back-btn:hover { background: #2D004F; color: #fff; transform: translateX(-5px); }

        .hero-section { 
          background: linear-gradient(rgba(248, 249, 250, 0.96), rgba(248, 249, 250, 1)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80'); 
          background-size: cover; background-position: center; 
          padding: 140px 20px 60px; text-align: center; 
        }

        .filter-grid { display: flex; gap: 15px; justify-content: center; margin-top: 40px; flex-wrap: wrap; }
        .custom-dropdown { position: relative; width: 280px; }
        
        .dropdown-trigger {
          background: white; border: 1px solid #E5E7EB;
          padding: 18px 25px; border-radius: 12px; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          font-weight: 700; font-size: 12px; transition: 0.3s;
          color: #2D004F;
        }

        .dropdown-content {
          position: absolute; top: 110%; left: 0; right: 0; 
          background: white; border-radius: 16px; border: 1px solid #E5E7EB;
          z-index: 100; overflow: hidden; max-height: 0; opacity: 0;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 20px 40px rgba(45, 0, 79, 0.08);
        }
        .dropdown-content.show { max-height: 450px; opacity: 1; padding: 10px; }

        .dropdown-item {
          padding: 12px 18px; border-radius: 8px; cursor: pointer; font-size: 13px;
          color: #6B7280; transition: 0.2s; font-weight: 600;
        }
        .dropdown-item:hover { background: #F5EFFF; color: #7B2CBF; }
        .dropdown-item.active { background: #2D004F; color: #fff; }

        .listings-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
          gap: 40px; padding: 0 40px; max-width: 1400px; margin: 0 auto; 
        }

        .p-card { 
          background: white; border-radius: 24px; border: 1px solid #E5E7EB; 
          overflow: hidden; transition: 0.5s; cursor: pointer;
          display: flex; flex-direction: column;
        }
        .p-card:hover { transform: translateY(-12px); border-color: #7B2CBF; box-shadow: 0 30px 60px rgba(45, 0, 79, 0.1); }

        .price-tag { 
          position: absolute; bottom: 20px; left: 20px; 
          background: #2D004F; color: #FFF; padding: 10px 22px; 
          border-radius: 10px; font-weight: 800; font-size: 24px; font-family: 'Bebas Neue'; 
          letter-spacing: 1px; z-index: 10;
        }

        .btn-load-more {
          background: white; color: #2D004F; border: 2px solid #2D004F;
          padding: 18px 45px; border-radius: 12px; font-weight: 800;
          font-size: 13px; cursor: pointer; transition: 0.3s;
          letter-spacing: 2px; text-transform: uppercase;
        }
        .btn-load-more:hover { background: #2D004F; color: white; transform: scale(1.05); }

        .shimmer { background: linear-gradient(90deg, #F3F4F6 25%, #FFFFFF 50%, #F3F4F6 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 768px) {
          .listings-grid { grid-template-columns: 1fr; padding: 0 20px; }
          .hero-section h1 { font-size: 3.5rem !important; }
        }
      `}</style>

      <Link href="/" className="back-btn">
        <span>←</span> EXIT TO HOME
      </Link>

      <section className="hero-section">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '5.5rem', letterSpacing: '1px', lineHeight: 0.85, color: '#2D004F' }}>
          Explore Our <span style={{ color: '#7B2CBF' }}>Inventory</span>
        </h1>
        <p style={{ color: '#6B7280', marginTop: '20px', fontWeight: '600', fontSize: '14px', letterSpacing: '0.5px' }}>
          DISCOVER HAND-PICKED ASSETS AND VERIFIED LISTINGS NATIONWIDE.
        </p>
        
        <div className="filter-grid">
          {/* Property Type Dropdown */}
          <div className="custom-dropdown">
             <div className="dropdown-trigger" onClick={() => toggleDropdown('type')}>
                <span>{filter.type === 'all' ? 'ALL CATEGORIES' : filter.type.replace('_', ' + ').toUpperCase()}</span>
                <span style={{ transition: '0.3s', transform: openDropdown === 'type' ? 'rotate(180deg)' : 'none' }}>▼</span>
             </div>
             <div className={`dropdown-content ${openDropdown === 'type' ? 'show' : ''}`}>
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'house', label: 'Houses' },
                  { id: 'apartment', label: 'Apartments' },
                  { id: 'land', label: 'Land / Plots' },
                  { id: 'house_land', label: 'House + Land' },
                  { id: 'commercial', label: 'Commercial' }
                ].map(item => (
                  <div key={item.id} className={`dropdown-item ${filter.type === item.id ? 'active' : ''}`} onClick={() => { setFilter({...filter, type: item.id}); setOpenDropdown(null); }}>
                    {item.label.toUpperCase()}
                  </div>
                ))}
             </div>
          </div>

          {/* Purpose Dropdown */}
          <div className="custom-dropdown">
             <div className="dropdown-trigger" onClick={() => toggleDropdown('purpose')}>
                <span>{filter.purpose === 'all' ? 'ANY STATUS' : filter.purpose === 'sale' ? 'FOR SALE' : 'FOR RENT'}</span>
                <span style={{ transition: '0.3s', transform: openDropdown === 'purpose' ? 'rotate(180deg)' : 'none' }}>▼</span>
             </div>
             <div className={`dropdown-content ${openDropdown === 'purpose' ? 'show' : ''}`}>
                {['all', 'sale', 'rent'].map(item => (
                  <div key={item} className={`dropdown-item ${filter.purpose === item ? 'active' : ''}`} onClick={() => { setFilter({...filter, purpose: item}); setOpenDropdown(null); }}>
                    {item === 'all' ? 'ALL STATUS' : item === 'sale' ? 'BUY ASSET' : 'RENTAL LEASE'}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      <div className="listings-grid">
        <AnimatePresence>
          {listings.map((p, index) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 6) * 0.1 }}
            >
              <Link href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
                <div className="p-card">
                  
                  <div style={{ position: 'relative', overflow: 'hidden', height: '280px', background: '#F1F5F9' }}>
  <Image 
    loader={supabaseLoader}
    src={p.property_images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} 
    alt={p.title}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    style={{ objectFit: 'cover' }}
    className="transition-transform duration-500 hover:scale-110"
    priority={index < 3} // Only the first 3 images load instantly, others are lazy-loaded
  />
  <div className="price-tag">KES {p.price?.toLocaleString()}</div>
</div>
                  
                  <div style={{ padding: '30px' }}>
                    <div style={{ color: '#7B2CBF', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px', background: '#F5EFFF', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>
                      VERIFIED ASSET ✓
                    </div>
                    <h3 style={{ color: '#1B1464', fontSize: '20px', margin: '0 0 12px', fontWeight: '800', lineHeight: 1.3 }}>
                      {p.title}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '20px', color: '#6B7280', fontSize: '13px', fontWeight: '600', marginBottom: '25px' }}>
                      {p.property_type !== 'land' && (
                        <span title="Total Rooms">🏡 {p.bedrooms || '—'} Rooms</span>
                      )}
                      <span title="Location">📍 {p.sub_counties?.name || 'Kenya'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F1F1', paddingTop: '20px' }}>
                      <span style={{ color: '#2D004F', fontWeight: '800', fontSize: '11px', letterSpacing: '1px' }}>VIEW PORTFOLIO →</span>
                      <span style={{ color: '#CBD5E1', fontSize: '10px', fontWeight: '700' }}>CLASS: {p.property_type.toUpperCase().replace('_', ' + ')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
           [1,2,3].map(i => <div key={i} className="shimmer" style={{ height: '450px', borderRadius: '24px' }}></div>)
        )}
      </div>

      {/* Pagination Controller */}
      {hasMore && listings.length > 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <button onClick={() => fetchListings(false)} className="btn-load-more">
            View Next Selection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
           <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#CBD5E1' }}>No matches in current inventory</h2>
           <button onClick={() => setFilter({type: 'all', purpose: 'all'})} style={{ color: '#7B2CBF', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
              RESET ALL FILTERS
           </button>
        </div>
      )}
    </div>
  )
}