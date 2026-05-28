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
    <div style={{ background: '#080810', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Outfit', sans-serif; }
        .hero-bg { background: linear-gradient(rgba(8,8,16,0.8), rgba(8,8,16,1)), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'); background-size: cover; background-position: center; padding: 100px 20px 60px; text-align: center; }
        .filter-bar { display: flex; gap: 10px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }
        .filter-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 20px; border-radius: 12px; outline: none; cursor: pointer; transition: 0.3s; }
        .filter-select:hover { border-color: #C9A84C; }
        .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 30px; padding: 40px; max-width: 1300px; margin: 0 auto; }
        .p-card { background: #111118; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .p-card:hover { transform: translateY(-10px); border-color: #C9A84C; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .p-img { height: 240px; width: 100%; object-fit: cover; transition: 0.5s; }
        .p-card:hover .p-img { transform: scale(1.1); }
        .price-chip { position: absolute; bottom: 15px; left: 15px; background: #C9A84C; color: #000; padding: 6px 14px; border-radius: 10px; font-weight: 800; font-size: 18px; font-family: 'Bebas Neue'; }
        .tag { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        @media (max-width: 768px) { .grid-container { grid-template-columns: 1fr; padding: 20px; } .hero-bg h1 { font-size: 3rem; } }
      `}</style>

      <section className="hero-bg">
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '5rem', letterSpacing: '-1px' }}>Find Your <span style={{ color: '#C9A84C' }}>Next Property</span></h1>
        <p style={{ color: '#666' }}>Browse our selection of verified listings across Kenya</p>
        
        <div className="filter-bar">
          <select className="filter-select" onChange={(e) => setFilter({...filter, type: e.target.value})}>
            <option value="all">All Property Types</option>
            <option value="house">Houses</option>
            <option value="apartment">Apartments</option>
            <option value="land">Land/Plots</option>
          </select>
          <select className="filter-select" onChange={(e) => setFilter({...filter, purpose: e.target.value})}>
            <option value="all">Any Purpose</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>
      </section>

      <div className="grid-container">
        {loading ? (
           [1,2,3].map(i => <div key={i} style={{ height: '400px', background: '#111', borderRadius: '24px', opacity: 0.5 }}></div>)
        ) : listings.length > 0 ? (
          listings.map(p => (
            <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="p-card">
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img className="p-img" src={p.property_images?.[0]?.url || 'https://via.placeholder.com/600x400?text=No+Photo'} />
                  <div className="tag">{p.property_type}</div>
                  <div className="price-chip">KES {p.price?.toLocaleString()}</div>
                </div>
                <div style={{ padding: '25px' }}>
                  <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>{p.title}</h3>
                  <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '13px' }}>
                    <span>🛏 {p.bedrooms || 0} Beds</span>
                    <span>🚿 {p.bathrooms || 0} Baths</span>
                    <span>📍 {p.county_id ? 'Verified Loc' : 'Kenya'}</span>
                  </div>
                  <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#C9A84C', fontWeight: 'bold', fontSize: '13px' }}>
                    View Details →
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#444' }}>No listings found. Try changing filters.</p>
        )}
      </div>
    </div>
  )
}