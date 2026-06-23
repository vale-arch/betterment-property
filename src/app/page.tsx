'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SearchPill from '@/components/home/SearchPill';
import RollingShowcase from '@/components/home/RollingShowcase';
import MarketTicker from '@/components/home/MarketTicker'; 
import PropertyCard from '@/components/home/propertyCard'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [realListings, setRealListings] = useState<any[]>([])

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
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_images(url), counties(name), sub_counties(name)')
        .eq('listing_status', 'active')
        .limit(6)
        .order('created_at', { ascending: false });
      if (data) setRealListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  }

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (window.scrollY > 50 && menuOpen) setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.refresh()
  }

  if (!mounted) return null

  // --- Elite Clickable Logo ---
  const CorporateLogo = ({ scrolled }: { scrolled: boolean }) => (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
      <img src="/images/logo.jpg" alt="BGP Logo" style={{ height: '48px', width: 'auto', borderRadius: '6px' }} />
      <div style={{ textAlign: 'left' }}>
        <div style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontWeight: '900', 
          fontSize: '1.1rem', 
          lineHeight: 1, 
          letterSpacing: '-0.5px',
          color: scrolled ? '#2D004F' : '#FFFFFF' 
        }}>BETTERMENT</div>
        <div style={{ color: '#7B2CBF', fontSize: '8px', fontWeight: '800', letterSpacing: '2px' }}>GROUP PROPERTIES</div>
      </div>
    </Link>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap');
        
        :root {
          --violet-deep: #2D004F;
          --violet-accent: #7B2CBF;
          --arctic: #F8F9FA;
        }

        body { 
          font-family: 'Inter', sans-serif; 
          background: var(--arctic); 
          margin: 0; 
          -webkit-font-smoothing: antialiased;
        }

        /* --- Elite Floating Navbar --- */
        nav { position: fixed; top: 0; width: 100%; z-index: 1000; transition: 0.5s cubic-bezier(0.16, 1, 0.3, 1); padding: 20px 0; }
        
        .nav-scrolled { 
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(20px);
          margin: 15px 5%;
          width: 90% !important;
          border-radius: 20px;
          padding: 12px 0;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 20px 40px rgba(45, 0, 79, 0.08);
        }

        .btn-action { 
          background: var(--violet-deep); 
          color: white; 
          border: none; 
          padding: 12px 28px; 
          border-radius: 12px; 
          font-weight: 800; 
          cursor: pointer; 
          font-size: 11px;
          text-decoration: none;
          letter-spacing: 1px;
          transition: 0.3s;
        }
        .btn-action:hover { background: var(--violet-accent); transform: translateY(-2px); }

        .hamburger { display: none; flex-direction: column; gap: 6px; background: none; border: none; cursor: pointer; padding: 10px; }
        .hamburger div { width: 28px; height: 2px; background: white; transition: 0.3s; }
        .nav-scrolled .hamburger div { background: var(--violet-deep); }

        @media (max-width: 991px) {
          .desktop-links { display: none !important; }
          .hamburger { display: flex !important; }
          .nav-scrolled { width: 94% !important; margin: 10px 3%; }
        }

        .mobile-overlay {
          position: fixed; top: 0; right: 0; height: 100vh; width: 300px;
          background: white; z-index: 2000; display: flex; flex-direction: column; padding: 50px 40px; gap: 25px;
          transform: translateX(100%); transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: -20px 0 60px rgba(0,0,0,0.1);
        }
        .mobile-overlay.open { transform: translateX(0); }
      `}</style>

      {/* --- MOBILE NAV --- */}
      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => setMenuOpen(false)} style={{ alignSelf: 'flex-end', fontSize: '24px', border: 'none', background: 'none', color: 'var(--violet-deep)' }}>✕</button>
        <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontWeight: '900', textDecoration: 'none', color: 'var(--violet-deep)', fontSize: '24px', letterSpacing: '-1px' }}>HOME</Link>
        <Link href="/listings" onClick={() => setMenuOpen(false)} style={{ fontWeight: '900', textDecoration: 'none', color: 'var(--violet-deep)', fontSize: '24px', letterSpacing: '-1px' }}>MARKETPLACE</Link>
        <div style={{ height: '1px', background: '#eee', width: '100%', margin: '10px 0' }} />
        {user ? (
            <Link href="/dashboard" className="btn-action" style={{ textAlign: 'center' }}>GO TO DASHBOARD</Link>
        ) : (
            <Link href="/auth/login" className="btn-action" style={{ textAlign: 'center' }}>MEMBER SIGN IN</Link>
        )}
      </div>

      {/* --- FLOATING NAVBAR --- */}
      <nav className={scrolled ? 'nav-scrolled' : ''}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CorporateLogo scrolled={scrolled} />

          <div className="desktop-links" style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
            <Link href="/listings" style={{ 
              textDecoration: 'none', 
              color: scrolled ? 'var(--violet-deep)' : 'white', 
              fontWeight: '800', 
              fontSize: '12px',
              letterSpacing: '1px'
            }}>MARKETPLACE</Link>
            
            {user ? (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link href="/dashboard" className="btn-action">DASHBOARD</Link>
                <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: scrolled ? 'var(--violet-deep)' : 'white', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}>LOGOUT</button>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-action">SIGN IN</Link>
            )}
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(true)}> <div /> <div /> <div /> </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main style={{ position: 'relative' }}>
        <RollingShowcase />
        <div style={{ position: 'relative', marginTop: '-65px', zIndex: 10 }}>
          <SearchPill />
        </div>
      </main>

      {/* --- TRUST SIGNALS (Betterment Group Authority) --- */}
      <div style={{ background: 'white', padding: '50px 20px', borderBottom: '1px solid #f1f1f1' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
          {[
            { label: 'Verified Inventory', val: '1,200+' },
            { label: 'Market Presence', val: '10 Years' },
            { label: 'Security Audit', val: '100% Secure' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: 'var(--violet-accent)', letterSpacing: '2px', textTransform: 'uppercase' }}>{stat.label}</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: 'var(--violet-deep)', letterSpacing: '-1px' }}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      <MarketTicker />

      {/* --- LATEST OFFERS GRID --- */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
             <div>
               <span style={{ color: 'var(--violet-accent)', fontWeight: '900', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>Curated Selection</span>
               <h2 style={{ fontWeight: '900', fontSize: '3.5rem', color: 'var(--violet-deep)', margin: '5px 0 0', letterSpacing: '-2px' }}>Latest <span style={{ fontWeight: '300' }}>Portfolio</span></h2>
             </div>
             <Link href="/listings" style={{ 
               color: 'var(--violet-deep)', 
               fontWeight: '800', 
               textDecoration: 'none', 
               fontSize: '13px',
               borderBottom: '2px solid var(--violet-accent)',
               paddingBottom: '5px'
             }}>EXPLORE INVENTORY</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
            {realListings.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* --- WHY BETTERMENT (Clean logic, Violet theme) --- */}
      <section style={{ padding: '120px 20px', textAlign: 'center', background: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontWeight: '900', fontSize: '3rem', color: 'var(--violet-deep)', letterSpacing: '-1px' }}>The Standard of Excellence</h2>
          <div style={{ width: '60px', height: '4px', background: 'var(--violet-accent)', margin: '30px auto' }}></div>
          <p style={{ color: '#555', fontSize: '1.2rem', lineHeight: 1.8, fontWeight: '400' }}>
            Betterment Group Properties delivers a seamless investment experience. We specialize in verified, high-value assets across Kenya, providing institutional-grade transparency for every client.
          </p>
        </div>
      </section>

      {/* --- FOOTER (Deep Violet) --- */}
      <footer style={{ background: 'var(--violet-deep)', color: 'white', padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px' }}>
          <div>
             <CorporateLogo scrolled={false} />
             <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '25px', lineHeight: 1.6 }}>
                Delivering dreams and managing high-value property portfolios since 2014.
             </p>
          </div>
          <div>
             <h4 style={{ color: 'var(--violet-accent)', marginBottom: '25px', fontWeight: '900', letterSpacing: '1px' }}>LEGAL</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px' }}>
                <Link href="/privacy" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Privacy Policy</Link>
                <Link href="/terms" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Terms of Service</Link>
             </div>
          </div>
          <div>
             <h4 style={{ color: 'var(--violet-accent)', marginBottom: '25px', fontWeight: '900', letterSpacing: '1px' }}>CONTACT</h4>
             <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p>Nairobi, Kenya</p>
                <p>support@bettermentgroup.com</p>
                <p>+254 700 000 000</p>
             </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'rgba(255,255,255,0.2)', fontSize: '11px', letterSpacing: '2px', fontWeight: '800' }}>
          © {new Date().getFullYear()} BETTERMENT GROUP PROPERTIES. MADE IN KENYA.
        </div>
      </footer>
    </>
  )
}