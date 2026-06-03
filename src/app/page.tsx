'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  // --- States ---
  const [purpose, setPurpose] = useState('sale')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [realListings, setRealListings] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
    
    // Auth Listener
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    fetchLatestListings()
    return () => subscription.unsubscribe()
  }, [])

  const fetchLatestListings = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*, property_images(url), counties(name), sub_counties(name)')
      .eq('listing_status', 'active')
      .limit(6)
      .order('created_at', { ascending: false })
    if (data) setRealListings(data)
  }

  // --- AUTO-CLOSE ON SCROLL LOGIC ---
  useEffect(() => {
    const onScroll = () => {
        setScrolled(window.scrollY > 40)
        // If user scrolls more than 50px while menu is open, close it
        if (window.scrollY > 50 && menuOpen) {
            setMenuOpen(false)
        }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen]) // Dependency added to track menu state

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.refresh()
  }

  const handleSearch = () => {
    router.push(`/listings?purpose=${purpose}&query=${encodeURIComponent(searchQuery)}`)
  }

  if (!mounted) return null

  // --- Reusable Logo Component ---
  const SavannahLogo = ({ scrolled }: { scrolled: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
        <path d="M20 55 C 20 20, 80 20, 80 55" stroke="#C9A84C" strokeWidth="3" fill="none" />
        <path d="M25 65 L40 50 L55 65 V80 H25 V65Z" fill="#A3432F" />
        <path d="M40 55 L55 40 L70 55 V80 H40 V55Z" fill="#A3432F" />
        <path d="M55 65 L65 55 L75 65 V80 H55 V65Z" fill="#A3432F" />
        <circle cx="50" cy="72" r="3" fill="#222" />
        <circle cx="45" cy="74" r="2.5" fill="#222" />
        <circle cx="55" cy="74" r="2.5" fill="#222" />
      </svg>
      <div style={{ textAlign: 'left' }}>
        <div style={{ 
          fontFamily: 'Bebas Neue', 
          fontSize: '1.4rem', 
          lineHeight: 1, 
          color: scrolled ? '#1A1A1A' : '#FFFFFF' 
        }}>BETTERMENT GROUP</div>
        <div style={{ color: '#C9A84C', fontSize: '8px', fontWeight: '900', letterSpacing: '1.5px' }}>PROPERTY</div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        :root {
          --terracotta: #A3432F;
          --gold: #C9A84C;
          --charcoal: #1A1A1A;
        }

        body { font-family: 'Outfit', sans-serif; background: #FFF; color: var(--charcoal); margin: 0; }

        /* --- HERO --- */
        .hero-full {
          position: relative; height: 100vh; width: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80');
          background-size: cover; background-position: center;
        }

        .hero-title { font-family: 'Bebas Neue'; font-size: clamp(3rem, 10vw, 7.5rem); color: white; line-height: 0.9; text-align: center; margin-bottom: 30px; }

        /* --- NAV --- */
        nav { position: fixed; top: 0; width: 100%; z-index: 1000; transition: 0.4s; padding: 20px 0; }
        .nav-scrolled { background: white; padding: 12px 0; border-bottom: 1px solid #eee; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }

        .desktop-links { display: flex; gap: 30px; align-items: center; }
        
        /* --- HAMBURGER --- */
        .hamburger { display: none; cursor: pointer; flex-direction: column; gap: 6px; background: none; border: none; padding: 10px; }
        .hamburger div { width: 28px; height: 3px; background: white; transition: 0.3s; }
        .nav-scrolled .hamburger div { background: #1A1A1A; }

        @media (max-width: 991px) {
          .desktop-links { display: none !important; }
          .hamburger { display: flex !important; }
        }

        /* --- REFINED OVERLAY --- */
        .mobile-overlay {
          position: fixed; top: 0; right: 0; height: 100vh; width: 70%; /* Shrink width */
          max-width: 320px; background: white;
          z-index: 2000; display: flex; flex-direction: column; padding: 40px 30px; gap: 20px;
          transform: translateX(100%); transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        }
        .mobile-overlay.open { transform: translateX(0); }

        /* --- SEARCH --- */
        .search-v5 {
          background: white; padding: 20px; border-radius: 24px;
          max-width: 900px; width: 90%; display: flex; flex-direction: column; gap: 15px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
        }
        @media (min-width: 992px) { .search-v5 { flex-direction: row; border-radius: 100px; padding: 10px; } }

        .type-selector { display: flex; background: #f8f8f8; border-radius: 100px; padding: 5px; gap: 5px; }
        .type-btn { 
          flex: 1; padding: 12px 10px; border-radius: 100px; border: none; background: transparent; 
          font-family: 'Outfit'; font-weight: 700; font-size: 11px; cursor: pointer; transition: 0.4s;
        }
        .type-btn.active { background: var(--terracotta); color: white; }

        .btn-action { background: var(--terracotta); color: white; border: none; padding: 14px 30px; border-radius: 100px; font-weight: 700; cursor: pointer; transition: 0.3s; text-decoration: none; display: inline-block; text-align: center; }

        /* --- TICKER --- */
        .ticker { background: var(--gold); padding: 15px 0; color: white; font-weight: 800; font-size: 11px; overflow: hidden; white-space: nowrap; }
        .ticker-inner { display: inline-block; animation: tick 40s linear infinite; }
        @keyframes tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>

      {/* --- MOBILE NAV OVERLAY --- */}
      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => setMenuOpen(false)} style={{ alignSelf: 'flex-end', fontSize: '30px', border: 'none', background: 'none' }}>✕</button>
        <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.8rem', fontFamily: 'Bebas Neue', textDecoration: 'none', color: '#1A1A1A' }}>Home</Link>
        <Link href="/listings" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.8rem', fontFamily: 'Bebas Neue', textDecoration: 'none', color: '#1A1A1A' }}>Marketplace</Link>
        <hr style={{ border: '0.5px solid #eee', width: '100%' }} />
        {user ? (
          <>
            {(user.user_metadata?.role === 'agent' || user.user_metadata?.role === 'admin') && (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.2rem', fontWeight: '700', textDecoration: 'none', color: 'var(--terracotta)' }}>Dashboard</Link>
            )}
            <button onClick={handleSignOut} style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: '700', color: 'red', cursor: 'pointer' }}>Sign Out</button>
          </>
        ) : (
          <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="btn-action">SIGN IN</Link>
        )}
      </div>

      {/* --- NAV --- */}
      <nav className={scrolled ? 'nav-scrolled' : ''}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <SavannahLogo scrolled={scrolled} />
          </Link>

          <div className="desktop-links">
            <Link href="/listings" style={{ textDecoration: 'none', color: scrolled ? '#1A1A1A' : 'white', fontWeight: '600', fontSize: '14px' }}>Marketplace</Link>
            {user ? (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {(user.user_metadata?.role === 'agent' || user.user_metadata?.role === 'admin') && (
                  <Link href="/dashboard" className="btn-action" style={{ padding: '8px 20px', fontSize: '12px' }}>DASHBOARD</Link>
                )}
                <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: scrolled ? '#1A1A1A' : 'white', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>SIGN OUT</button>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-action" style={{ padding: '8px 25px', fontSize: '12px' }}>SIGN IN</Link>
            )}
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(true)}> <div /> <div /> <div /> </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="hero-full">
        <div style={{ zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className="hero-title"> FIND YOUR <br /> <span style={{ color: 'var(--gold)' }}>DREAM HOME</span> <br /> IN KENYA </h1>

          <div className="search-v5">
            <div style={{ flex: 1, padding: '0 10px' }}>
              <label style={{ fontSize: '9px', fontWeight: '900', color: '#999', display: 'block', marginBottom: '5px' }}>LOCATION</label>
              <input placeholder="Karen, Runda, Nyali..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', fontWeight: '600' }} />
            </div>
            <div className="type-selector">
              <button className={`type-btn ${purpose === 'sale' ? 'active' : ''}`} onClick={() => setPurpose('sale')}>BUY</button>
              <button className={`type-btn ${purpose === 'rent' ? 'active' : ''}`} onClick={() => setPurpose('rent')}>RENT</button>
              <button className={`type-btn ${purpose === 'land' ? 'active' : ''}`} onClick={() => setPurpose('land')}>LAND</button>
            </div>
            <button onClick={handleSearch} className="btn-action">SEARCH</button>
          </div>
        </div>
      </section>

      {/* --- TICKER --- */}
      <div className="ticker">
        <div className="ticker-inner">
          {[...Array(8)].map((_, i) => (
            <span key={i} style={{ padding: '0 50px' }}>VERIFIED LISTINGS • ZERO FRAUD • ALL 47 COUNTIES • PREMIUM QUALITY • BETTERMENT GROUP PROPERTY •</span>
          ))}
        </div>
      </div>

      {/* --- RECENT OFFERS --- */}
      <section style={{ padding: '80px 20px', background: '#FDFDFD' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '15px' }}>
             <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '3.5rem', margin: 0 }}>Recent <span style={{ color: 'var(--terracotta)' }}>Offers</span></h2>
             <Link href="/listings" style={{ color: 'var(--terracotta)', fontWeight: '800', textDecoration: 'none', fontSize: '13px' }}>VIEW ALL PROPERTIES →</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {realListings.map((p) => (
              <Link href={`/properties/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: '0.4s' }}>
                  <img src={p.property_images?.[0]?.url} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  <div style={{ padding: '25px' }}>
                    <div style={{ color: 'var(--gold)', fontFamily: 'Bebas Neue', fontSize: '1.6rem' }}>KES {p.price?.toLocaleString()}</div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', margin: '5px 0', color: '#222' }}>{p.title}</div>
                    <div style={{ color: '#999', fontSize: '13px' }}>📍 {p.sub_counties?.name}, {p.counties?.name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- WHY BETTERMENT --- */}
      <section style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '3.5rem', marginBottom: '20px' }}>Why <span style={{ color: 'var(--terracotta)' }}>Betterment Group</span>?</h2>
        <p style={{ color: '#666', maxWidth: '750px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          The standard for Kenyan Real Estate. Verified listings, direct agent communication, and premium transparency.
        </p>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ background: '#111', color: 'white', padding: '80px 20px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '50px' }}>
          <div>
             <Link href="/" style={{ textDecoration: 'none' }}><SavannahLogo scrolled={false} /></Link>
             <p style={{ color: '#666', fontSize: '13px', marginTop: '15px' }}>The premium standard for Kenyan Real Estate.</p>
          </div>
          <div>
             <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', marginBottom: '15px', color: 'var(--gold)' }}>COMPANY</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#888' }}>
                <Link href="/listings" style={{ color: 'inherit', textDecoration: 'none' }}>Marketplace</Link>
                <Link href="/auth/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 'bold' }}>Join as Agent</Link>
             </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '60px', borderTop: '1px solid #222', paddingTop: '20px', color: '#444', fontSize: '10px' }}>
          © 2026 BETTERMENT GROUP PROPERTY. MADE IN KENYA 🇰🇪
        </div>
      </footer>
    </>
  )
}