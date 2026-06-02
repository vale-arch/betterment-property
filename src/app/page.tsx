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
  const [heroLoaded, setHeroLoaded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
    const { data } = await supabase
      .from('properties')
      .select('*, property_images(url)')
      .eq('listing_status', 'active')
      .limit(6)
      .order('created_at', { ascending: false })

    if (data) setRealListings(data)
  }

  useEffect(() => {
    const onScroll = () => {
        setScrolled(window.scrollY > 50)
        if (window.scrollY > 100 && menuOpen) setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

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
        @keyframes menuSlide { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }

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

        .search-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .search-layout-grid {
            grid-template-columns: 2fr 1fr 1fr;
            align-items: flex-end;
            gap: 12px;
          }
          .input-wrapper { margin-bottom: 0 !important; }
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

        .dropdown-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #1a1a1a;
          border-radius: 12px;
          margin-top: 5px;
          border: 1px solid rgba(255,255,255,0.05);
          position: absolute;
          width: 100%;
          z-index: 50;
        }
        .dropdown-content.open { max-height: 200px; padding: 5px 0; }
        .dropdown-item {
          padding: 12px 18px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        .dropdown-item:hover { background: rgba(201,168,76,0.1); color: #C9A84C; }

        @media (max-width: 768px) {
          .nav-container { padding: 0 20px !important; }
          .desktop-nav { display:none !important; }
          .mobile-btn { display:flex !important; align-items: center; justify-content: center; }
          .hero-section { padding: 0 20px !important; text-align: center; justify-content: center !important; }
          .hero-title { font-size: 3.5rem !important; margin-bottom: 20px !important; line-height: 1.1 !important; }
          .section-pad { padding: 60px 20px !important; }
          .listings-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
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

          <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', width: '42px', height: '42px', color: '#C9A84C', cursor: 'pointer' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div style={{ position: 'fixed', inset: 0, top: '72px', background: '#0c0c0c', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '25px', zIndex: 999 }}>
             <Link href="/listings" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#fff' }} onClick={() => setMenuOpen(false)}>Browse All Properties</Link>
             {user ? (
               <>
                 {(user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'agent') && (
                    <Link href={user.user_metadata?.role === 'admin' ? '/admin' : '/dashboard'} style={{ fontSize: '20px', color: '#C9A84C', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Go to Dashboard</Link>
                 )}
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

        <div style={{ maxWidth: '900px', zIndex: 1, margin: scrolled ? '0' : '0 auto', textAlign: scrolled ? 'left' : 'center' }}>
          <h1 className="hero-title" style={{ fontFamily: 'Bebas Neue', fontSize: '7rem', lineHeight: 0.85, marginBottom: '30px' }}>
            Find Your <span style={{ color: '#C9A84C', background: 'linear-gradient(135deg,#C9A84C,#F0D98A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite', backgroundSize: '200%' }}>Dream Home</span> in Kenya
          </h1>

          <div className="search-card-responsive">
            <div className="search-layout-grid">
              
              <div className="input-wrapper">
                <label className="input-label-premium">Where are you looking?</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>📍</span>
                  <input className="search-input" placeholder="e.g. Karen, Nairobi..." style={{ paddingLeft: '44px', height: '54px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div className="input-wrapper" style={{ position: 'relative' }}>
                <label className="input-label-premium">Purpose</label>
                <div className="search-input" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', height: '54px' }}>
                  <span>{purpose === 'sale' ? 'Buy House' : purpose === 'rent' ? 'Rent House' : 'Buy Land'}</span>
                  <span style={{ color: '#C9A84C', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</span>
                </div>
                <div className={`dropdown-content ${isDropdownOpen ? 'open' : ''}`}>
                  <div className="dropdown-item" onClick={() => { setPurpose('sale'); setIsDropdownOpen(false); }}>Buy House</div>
                  <div className="dropdown-item" onClick={() => { setPurpose('rent'); setIsDropdownOpen(false); }}>Rent House</div>
                  <div className="dropdown-item" onClick={() => { setPurpose('land'); setIsDropdownOpen(false); }}>Buy Land</div>
                </div>
              </div>

              <button onClick={handleSearch} className="btn btn-gold" style={{ height: '54px', fontWeight: '800', width: '100%' }}>SEARCH</button>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: '#C9A84C', padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'ticker 25s linear infinite' }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ color: '#000', fontWeight: '900', padding: '0 40px', fontSize: '12px' }}>VERIFIED LISTINGS • ALL 47 COUNTIES • ZERO SCAMS • BETTERMENT GROUP PROPERTY •</span>
          ))}
        </div>
      </div>

      <section className="section-pad" style={{ padding: '100px 50px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
            <div>
               <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '4.5rem', lineHeight: 1 }}>Recent <span style={{ color: '#C9A84C' }}>Uploads</span></h2>
               <p style={{ color: '#555', marginTop: '10px' }}>Explore the newest verified properties on the market today.</p>
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
               <Link href="/auth/register" style={{color: '#C9A84C', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold'}}>Join as Agent</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', marginBottom: '20px', letterSpacing: '2px' }}>LEGAL</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <Link href="/legal/privacy" style={{color: '#555', textDecoration: 'none', fontSize: '14px'}}>Privacy Policy</Link>
               <Link href="/legal/terms" style={{color: '#555', textDecoration: 'none', fontSize: '14px'}}>Terms of Use</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', marginBottom: '20px', letterSpacing: '2px' }}>CONTACT US</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <a href="mailto:info@bettermentgroup.co.ke" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>info@bettermentgroup.co.ke</a>
               <a href="tel:+254700000000" style={{ color: '#444', textDecoration: 'none', fontSize: '15px' }}>+254 700 000 000</a>
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