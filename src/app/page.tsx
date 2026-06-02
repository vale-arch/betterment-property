'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  // --- UI & Animation States ---
  const [purpose, setPurpose] = useState('sale')
  const [scrolled, setScrolled] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const obsRefs = useRef<Record<string, HTMLElement | null>>({})

  // --- Data & Auth States ---
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [realListings, setRealListings] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
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
    const { data, error } = await supabase
      .from('properties')
      .select('*, property_images(url)')
      .eq('listing_status', 'active')
      .limit(6)
      .order('created_at', { ascending: false })

    if (data) setRealListings(data)
  }

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100)
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.id]: true }))
      }),
      { threshold: 0.1 }
    )
    Object.values(obsRefs.current).forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [realListings])

  const reg = (id: string) => (el: HTMLElement | null) => {
    if (el) { el.id = id; obsRefs.current[id] = el }
  }

  const anim = (id: string, delay = 0) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? 'translateY(0)' : 'translateY(40px)',
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    setMenuOpen(false)
  }

  const handleSearch = () => {
    router.push(`/listings?purpose=${purpose}&query=${encodeURIComponent(searchQuery)}`)
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Outfit', sans-serif; background: #0c0c0c; color: #fff; overflow-x: hidden; }
        
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes heroImg { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }
        @keyframes ticker { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }

        .nav-a { color:rgba(255,255,255,0.7); text-decoration:none; font-size:14px; font-weight:500; transition:all 0.2s; }
        .nav-a:hover { color:#C9A84C; }

        .listing-card { background:#141414; border-radius:24px; overflow:hidden; border:1px solid rgba(255,255,255,0.06); transition:all 0.4s; cursor:pointer; height: 100%; }
        .listing-card:hover { transform:translateY(-8px); border-color:#C9A84C; box-shadow:0 20px 40px rgba(0,0,0,0.5); }
        .listing-card img { width:100%; height:240px; object-fit:cover; display:block; transition: 0.5s; }
        .listing-card:hover img { transform: scale(1.05); }

        .btn { display:inline-flex; align-items:center; gap:8px; border:none; border-radius:14px; padding:12px 24px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.2s; }
        .btn-gold { background:#C9A84C; color:#000; }
        .btn-gold:hover { background:#E8C97A; transform:translateY(-2px); }
        .btn-logout { background: transparent; border: none; color: #ff4444; font-weight: 700; cursor: pointer; font-size: 13px; }

        .search-input { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px 18px; color:#fff; font-family:'Outfit',sans-serif; width:100%; outline:none; font-size: 15px; }
        .search-input:focus { border-color:#C9A84C; background:rgba(255,255,255,0.1); }

        /* Custom Select Arrow - remains the same */
.search-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23C9A84C'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 18px;
  padding-right: 40px !important;
}

/* The Container */
.search-card-responsive {
  background: rgba(12, 12, 12, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  margin: 0 auto;
}

/* The Layout Engine */
.search-layout-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 Column */
  gap: 16px;
}

/* LAPTOP VIEW FIX */
@media (min-width: 768px) {
  .search-layout-grid {
    grid-template-columns: 2fr 1fr 1fr; /* Laptop: 3 Columns in one row */
    align-items: flex-end; /* Keeps labels on top, inputs aligned at bottom */
    gap: 12px;
  }

  .input-wrapper {
    margin-bottom: 0 !important; /* Remove the mobile spacing on laptop */
  }
}

.input-label-premium {
  font-size: 10px;
  font-weight: 800;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  display: block;
}

        /* --- MOBILE PREMIUM FIXES --- */
        @media (max-width: 768px) {
          .nav-container { padding: 0 20px !important; }
          .desktop-nav { display:none !important; }
          .mobile-btn { display:flex !important; align-items: center; justify-content: center; }
          
          .hero-section { padding: 0 20px !important; text-align: center; justify-content: center !important; }
          .hero-title { font-size: 3.5rem !important; margin-bottom: 20px !important; line-height: 1 !important; }
          
          .search-card { 
            padding: 20px !important; 
            margin-top: 20px;
            width: 100% !important;
            border-radius: 24px !important;
          }
          .search-row-grid { 
            display: flex !important; 
            flex-direction: column !important; 
            gap: 15px !important; 
          }
          .search-btn-mobile { width: 100% !important; height: 55px !important; justify-content: center !important; font-size: 16px !important; }

          .section-pad { padding: 60px 20px !important; }
          .listings-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .section-header { flex-direction: column !important; align-items: center !important; text-align: center; gap: 20px; }
          
          .footer-container { padding: 40px 20px !important; }
          .footer-grid-mobile { grid-template-columns: 1fr !important; text-align: center; gap: 40px !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: '72px',
        display: 'flex', alignItems: 'center',
        background: scrolled ? 'rgba(12,12,12,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        transition: '0.4s ease'
      }}>
        <div className="nav-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 50px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: '#C9A84C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '20px', color: '#000' }}>B</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontFamily: 'Bebas Neue', fontSize: '18px', lineHeight: 1 }}>BETTERMENT GROUP</span>
              <span style={{ color: '#C9A84C', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>Property</span>
            </div>
          </Link>

          <div className="desktop-nav" style={{ display: 'flex', gap: '30px' }}>
            <Link href="/listings" className="nav-a">Browse</Link>
            <Link href="/listings?purpose=rent" className="nav-a">Rentals</Link>
            <Link href="/listings?type=land" className="nav-a">Land</Link>
          </div>

          <div className="desktop-nav" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {user ? (
              <>
                {(user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'agent') && (
                  <Link href={user.user_metadata?.role === 'admin' ? '/admin' : '/dashboard'}>
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #333', padding: '8px 16px', borderRadius: '10px', fontSize: '12px' }}>DASHBOARD</button>
                  </Link>
                )}
                <button onClick={handleSignOut} className="btn-logout">SIGN OUT</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="nav-a" style={{ fontSize: '13px' }}>Sign In</Link>
                <Link href="/auth/register"><button className="btn btn-gold" style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 'bold' }}>LIST PROPERTY</button></Link>
              </>
            )}
          </div>

          <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', width: '42px', height: '42px', color: '#C9A84C' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div style={{ position: 'fixed', inset: 0, top: '72px', background: '#0c0c0c', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '25px', zIndex: 999, animation: 'fadeIn 0.3s ease' }}>
             <Link href="/listings" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#fff' }} onClick={() => setMenuOpen(false)}>Browse All Properties</Link>
             {user ? (
               <>
                 <Link href="/dashboard" style={{ fontSize: '20px', color: '#C9A84C', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Go to Dashboard</Link>
                 <button onClick={handleSignOut} style={{ textAlign: 'left', fontSize: '18px' }} className="btn-logout">Logout Account</button>
               </>
             ) : (
               <>
                 <Link href="/auth/login" style={{ fontSize: '20px', color: '#fff', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Sign In</Link>
                 <Link href="/auth/register" onClick={() => setMenuOpen(false)} style={{ background: '#C9A84C', padding: '16px', textAlign: 'center', color: '#000', borderRadius: '14px', fontWeight: 'bold', textDecoration: 'none' }}>List Your Property</Link>
               </>
             )}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=85)`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'heroImg 1.5s ease both', zIndex: -1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0c0c0c 10%, transparent 80%), linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 100%)', zIndex: -1 }} />

        <div style={{ maxWidth: '900px', zIndex: 1 }}>
          <h1 className="hero-title" style={{ fontFamily: 'Bebas Neue', fontSize: '7rem', lineHeight: 0.85, marginBottom: '30px', animation: heroLoaded ? 'fadeIn 1s ease 0.2s both' : 'none' }}>
            Find Your <span style={{ color: '#C9A84C', background: 'linear-gradient(135deg,#C9A84C,#F0D98A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite', backgroundSize: '200%' }}>Dream Home</span> in Kenya
          </h1>

           <div className="search-card-responsive">
  <div className="search-layout-grid">
    
    {/* 1. Location Input */}
    <div className="input-wrapper">
      <label className="input-label-premium">Where are you looking?</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>📍</span>
        <input 
          className="search-input" 
          placeholder="e.g. Karen, Nairobi..." 
          style={{ paddingLeft: '44px', height: '54px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    {/* 2. Purpose Dropdown */}
    <div className="input-wrapper">
      <label className="input-label-premium">Purpose</label>
      <select 
        className="search-input search-select" 
        style={{ height: '54px', fontWeight: '600' }}
        onChange={(e) => setPurpose(e.target.value)}
      >
        <option value="sale">Buy House</option>
        <option value="rent">Rent House</option>
        <option value="land">Buy Land</option>
      </select>
    </div>

    {/* 3. Search Button */}
    <button 
      onClick={handleSearch} 
      className="btn-gold" 
      style={{ 
        width: '100%', 
        height: '54px', 
        borderRadius: '14px', 
        fontSize: '14px',
        fontWeight: '800',
        letterSpacing: '1px'
      }}
    >
      SEARCH
    </button>

  </div>
</div>
          </div>
        
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: '#C9A84C', padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'ticker 25s linear infinite' }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ color: '#000', fontWeight: '900', padding: '0 40px', fontSize: '12px', letterSpacing: '1px' }}>VERIFIED LISTINGS • ALL 47 COUNTIES • ZERO SCAMS • BETTERMENT GROUP PROPERTY •</span>
          ))}
        </div>
      </div>

      {/* ── LIVE DATA LISTINGS ── */}
      <section className="section-pad" style={{ padding: '100px 50px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
            <div>
               <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '4.5rem', lineHeight: 1 }}>Recent <span style={{ color: '#C9A84C' }}>Uploads</span></h2>
               <p style={{ color: '#555', marginTop: '10px', fontSize: '15px' }}>Explore the newest verified properties on the market today.</p>
            </div>
            <Link href="/listings"><button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #222', borderRadius: '12px' }}>VIEW ALL →</button></Link>
          </div>

          <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {realListings.length > 0 ? realListings.map((p, i) => (
              <Link href={`/properties/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <div className="listing-card" ref={reg(`card-${i}`)} style={{ ...anim(`card-${i}`, i * 100) }}>
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                     <img src={p.property_images?.[0]?.url || 'https://via.placeholder.com/600x400?text=No+Photo'} alt={p.title} />
                     <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{p.property_type.toUpperCase()}</div>
                  </div>
                  <div style={{ padding: '25px' }}>
                    <div style={{ color: '#C9A84C', fontWeight: '800', fontSize: '22px', fontFamily: 'Bebas Neue' }}>KES {p.price?.toLocaleString()}</div>
                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginTop: '5px' }}>{p.title}</h3>
                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '12px', color: '#444' }}>{p.listing_purpose === 'sale' ? 'For Sale' : 'For Rent'}</span>
                       <span style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 'bold' }}>VIEW DETAILS →</span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <p style={{ color: '#444', gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>Searching for verified properties...</p>
            )}
          </div>
        </div>
      </section>

      {/* ── PREMIUM FOOTER ── */}
      <footer className="footer-container" style={{ background: '#080808', borderTop: '1px solid #111', padding: '100px 50px 50px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '60px' }} className="footer-grid-mobile">
          <div>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: '#C9A84C', marginBottom: '20px' }}>BETTERMENT GROUP</h3>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.8, maxWidth: '350px' }}>
              Kenya's fastest-growing property platform. We connect serious buyers with verified agents to create a transparent real estate market.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', marginBottom: '20px', letterSpacing: '2px' }}>EXPLORE</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <Link href="/listings" style={{color: '#555', textDecoration: 'none', fontSize: '14px'}}>All Listings</Link>
               <Link href="/listings?purpose=rent" style={{color: '#555', textDecoration: 'none', fontSize: '14px'}}>Rentals</Link>
               <Link href="/auth/register" style={{color: '#555', textDecoration: 'none', fontSize: '14px'}}>Sell with us</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', marginBottom: '20px', letterSpacing: '2px' }}>LEGAL</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <span style={{color: '#555', fontSize: '14px'}}>Privacy Policy</span>
               <span style={{color: '#555', fontSize: '14px'}}>Terms of Service</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', marginBottom: '20px', letterSpacing: '2px' }}>CONTACT US</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <a href="mailto:info@bettermentgroup.co.ke" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>info@bettermentgroup.co.ke</a>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '60px auto 0', paddingTop: '30px', borderTop: '1px solid #111', color: '#333', fontSize: '12px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <span>© 2026 BETTERMENT GROUP PROPERTY LIMITED. ALL RIGHTS RESERVED.</span>
          <span style={{ color: '#C9A84C', fontWeight: 'bold' }}>MADE IN KENYA 🇰🇪</span>
        </div>
      </footer>
    </>
  )
}