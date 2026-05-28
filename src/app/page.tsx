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

  // 1. Initialize Auth and Mount status (Hydration Fix)
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

  // 2. Fetch Actual Listings from your Supabase Database
  const fetchLatestListings = async () => {
    // We join with property_images to get the first photo for each card
    const { data, error } = await supabase
      .from('properties')
      .select('*, property_images(url)')
      .eq('listing_status', 'active')
      .limit(6)
      .order('created_at', { ascending: false })

    if (data) setRealListings(data)
    if (error) console.error("Error fetching listings:", error.message)
  }

  // 3. Global Listeners
  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100)
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // 4. Intersection Observer for Scroll Animations
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

  // --- AUTH ACTIONS ---
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    setMenuOpen(false)
  }

  const handleSearch = () => {
    router.push(`/listings?purpose=${purpose}&query=${encodeURIComponent(searchQuery)}`)
  }

  // Prevents "Hydration Failed" by ensuring server/client initial render match
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

        .nav-a { color:rgba(255,255,255,0.7); text-decoration:none; font-size:14px; font-weight:500; transition:color 0.2s; }
        .nav-a:hover { color:#C9A84C; }

        .listing-card { background:#141414; border-radius:20px; overflow:hidden; border:1px solid rgba(255,255,255,0.06); transition:all 0.4s; cursor:pointer; height: 100%; }
        .listing-card:hover { transform:translateY(-8px); border-color:#C9A84C; box-shadow:0 20px 40px rgba(0,0,0,0.5); }
        .listing-card img { width:100%; height:220px; object-fit:cover; display:block; }

        .btn { display:inline-flex; align-items:center; gap:8px; border:none; border-radius:12px; padding:12px 24px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.2s; }
        .btn-gold { background:#C9A84C; color:#0c0c0c; }
        .btn-gold:hover { background:#E8C97A; transform:translateY(-2px); }
        .btn-ghost { background:transparent; border:1.5px solid rgba(255,255,255,0.2); color:#fff; }
        .btn-ghost:hover { border-color:#fff; }
        .btn-logout { background: transparent; border: none; color: #ff4444; font-weight: 700; cursor: pointer; font-size: 13px; }

        .search-input { background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 16px; color:#fff; font-family:'Outfit',sans-serif; width:100%; outline:none; }
        .search-input:focus { border-color:#C9A84C; }

        @media (max-width: 768px) {
          .desktop-nav { display:none !important; }
          .mobile-btn { display:block !important; }
          .section-pad { padding: 60px 24px !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: '70px',
        display: 'flex', alignItems: 'center',
        background: scrolled ? 'rgba(12,12,12,0.98)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
        transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 50px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ width: '38px', height: '38px', background: '#C9A84C', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '22px', color: '#000' }}>B</div>
            <div>
              <div style={{ color: '#fff', fontFamily: 'Bebas Neue', fontSize: '18px' }}>Betterment Group</div>
              <div style={{ color: '#C9A84C', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Property</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '30px' }}>
            <Link href="/listings" className="nav-a">Buy</Link>
            <Link href="/listings?purpose=rent" className="nav-a">Rent</Link>
            <Link href="/listings?type=land" className="nav-a">Land</Link>
            <Link href="/listings?type=commercial" className="nav-a">Commercial</Link>
          </div>

          {/* Desktop Auth */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {user ? (
              <>
              {(user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'agent') && (
                <Link href={user.user_metadata?.role === 'admin' ? '/admin' : '/dashboard'}>
                   <button className="btn btn-ghost" style={{padding: '8px 16px', fontSize: '12px'}}>Dashboard</button>
                </Link>
              )}
              {user.user_metadata?.role === 'buyer' && (
                <span style={{ fontSize: '13px', color: '#888' }}>Hello, {user.user_metadata?.full_name}</span>
              )}
                <button onClick={handleSignOut} className="btn-logout">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login"><button className="btn btn-ghost" style={{padding: '8px 16px', fontSize: '12px'}}>Sign In</button></Link>
                <Link href="/auth/register"><button className="btn btn-gold" style={{padding: '8px 16px', fontSize: '12px'}}>List Property</button></Link>
              </>
            )}
          </div>

          <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, background: '#111', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1000, borderBottom: '1px solid #333' }}>
             <Link href="/listings" onClick={() => setMenuOpen(false)}>Browse Listings</Link>
             {user ? (
               <>
                {(user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'agent') && (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                )}
                {user.user_metadata?.role === 'buyer' && (
                  <span style={{ fontSize: '13px', color: '#888' }}>Hello, {user.user_metadata?.full_name}</span>
                )}
                <button onClick={handleSignOut} style={{textAlign: 'left'}} className="btn-logout">Sign Out</button>
              </>
             ) : (
               <>
                 <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
                 <Link href="/auth/register" onClick={() => setMenuOpen(false)} style={{background: '#C9A84C', padding: '12px', textAlign: 'center', color: '#000', borderRadius: '8px', fontWeight: 'bold'}}>List Property</Link>
               </>
             )}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=85)`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'heroImg 1.5s ease both', zIndex: -1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0c0c0c 5%, transparent 60%), linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 100%)', zIndex: -1 }} />

        <div style={{ maxWidth: '900px' }}>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(4rem, 10vw, 8.5rem)', lineHeight: 0.9, marginBottom: '40px' }}>
            Find Your <span style={{ color: '#C9A84C', background: 'linear-gradient(135deg,#C9A84C,#F0D98A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite', backgroundSize: '200%' }}>Dream Home</span> in Kenya
          </h1>

          <div style={{ background: 'rgba(12,12,12,0.85)', backdropFilter: 'blur(15px)', padding: '24px', borderRadius: '20px', maxWidth: '800px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Search Area</label>
                <input className="search-input" placeholder="e.g. Karen, Westlands..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Purpose</label>
                <select className="search-input" onChange={(e) => setPurpose(e.target.value)}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <button onClick={handleSearch} className="btn btn-gold" style={{ height: '48px' }}>🔍 Find Property</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: '#C9A84C', padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'ticker 20s linear infinite' }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ color: '#000', fontWeight: '900', padding: '0 40px', fontSize: '13px' }}>VERIFIED LISTINGS • ALL 47 COUNTIES • ZERO SCAMS • BETTERMENT GROUP PROPERTY •</span>
          ))}
        </div>
      </div>

      {/* ── LIVE DATA LISTINGS ── */}
      <section className="section-pad" style={{ padding: '100px 50px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div ref={reg('listings-header')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', ...anim('listings-header') }}>
            <div>
               <p style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>Latest</p>
               <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '4rem' }}>Recent <span style={{ color: '#C9A84C' }}>Uploads</span></h2>
            </div>
            <Link href="/listings" className="btn btn-ghost">View All Properties →</Link>
          </div>

          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
            {realListings.length > 0 ? realListings.map((p, i) => (
              <Link href={`/properties/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <div className="listing-card" ref={reg(`card-${i}`)} style={{ ...anim(`card-${i}`, i * 100) }}>
                  <div style={{position: 'relative'}}>
                     <img src={p.property_images?.[0]?.url || 'https://via.placeholder.com/600x400?text=No+Photo'} alt={p.title} />
                     <div style={{position: 'absolute', top: '15px', right: '15px', background: '#C9A84C', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold'}}>{p.listing_purpose.toUpperCase()}</div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ color: '#C9A84C', fontWeight: '800', fontSize: '20px', marginBottom: '5px' }}>KES {p.price?.toLocaleString()}</div>
                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{p.title}</h3>
                    <p style={{ color: '#666', fontSize: '13px', marginTop: '10px' }}>📍 Location ID: {p.county_id} • {p.property_type}</p>
                  </div>
                </div>
              </Link>
            )) : (
              <p style={{ color: '#555' }}>No active listings to show. Check back later!</p>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#080808', borderTop: '1px solid #111', padding: '80px 50px 40px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '50px' }} className="grid-3">
          <div>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', marginBottom: '20px' }}>Betterment Group</h3>
            <p style={{ color: '#444', fontSize: '14px', lineHeight: 1.6, maxWidth: '300px' }}>Kenya's premium property platform. Dedicated to transparency, verified agents, and seamless search.</p>
          </div>
          {['Explore', 'Company', 'Support'].map(col => (
            <div key={col}>
              <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '20px', color: '#888' }}>{col.toUpperCase()}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <Link href="/listings" style={{color: '#444', textDecoration: 'none', fontSize: '14px'}}>Properties</Link>
                 <Link href="/auth/register" style={{color: '#444', textDecoration: 'none', fontSize: '14px'}}>List With Us</Link>
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: '1300px', margin: '40px auto 0', paddingTop: '30px', borderTop: '1px solid #111', color: '#333', fontSize: '12px' }}>
          © 2026 Betterment Group Ltd. All Rights Reserved. Kenya.
        </div>
      </footer>
    </>
  )
}