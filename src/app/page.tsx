'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SearchPill from '@/components/home/SearchPill';
import RollingShowcase from '@/components/home/RollingShowcase';
import MarketTicker from '@/components/home/MarketTicker'; 
import SimilarProperties from '@/components/properties/SimilarProperties';

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  const [purpose, setPurpose] = useState('sale')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  // --- Clickable Deep Violet Logo Component ---
  const CorporateLogo = ({ scrolled }: { scrolled: boolean }) => (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
      {/* Path fixed: Removed /public */}
      <img src="/images/logo.jpg" alt="BGP Logo" style={{ height: '50px', width: 'auto', borderRadius: '4px' }} />
      <div style={{ textAlign: 'left' }}>
        <div style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontWeight: '900', 
          fontSize: '1.1rem', 
          lineHeight: 1, 
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
          --arctic: #FDFCF9;
        }

        body { font-family: 'Inter', sans-serif; background: var(--arctic); margin: 0; }

        nav { position: fixed; top: 0; width: 100%; z-index: 1000; transition: 0.4s; padding: 15px 0; }
        .nav-scrolled { background: white; border-bottom: 1px solid #eee; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }

        .btn-action { 
          background: var(--violet-deep); 
          color: white; 
          border: none; 
          padding: 10px 24px; 
          border-radius: 6px; 
          font-weight: 700; 
          cursor: pointer; 
          font-size: 11px;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .hamburger { display: flex !important; }
        }

        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 10px; }
        .hamburger div { width: 25px; height: 3px; background: white; transition: 0.3s; }
        .nav-scrolled .hamburger div { background: var(--violet-deep); }

        .mobile-overlay {
          position: fixed; top: 0; right: 0; height: 100vh; width: 280px;
          background: white; z-index: 2000; display: flex; flex-direction: column; padding: 40px; gap: 20px;
          transform: translateX(100%); transition: 0.5s;
        }
        .mobile-overlay.open { transform: translateX(0); }
      `}</style>

      {/* --- MOBILE NAV OVERLAY --- */}
      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => setMenuOpen(false)} style={{ alignSelf: 'flex-end', fontSize: '24px', border: 'none', background: 'none' }}>✕</button>
        <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontWeight: '800', textDecoration: 'none', color: 'var(--violet-deep)' }}>HOME</Link>
        <Link href="/listings" onClick={() => setMenuOpen(false)} style={{ fontWeight: '800', textDecoration: 'none', color: 'var(--violet-deep)' }}>MARKETPLACE</Link>
        {user ? (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontWeight: '800', textDecoration: 'none', color: 'var(--violet-accent)' }}>DASHBOARD</Link>
        ) : (
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="btn-action">SIGN IN</Link>
        )}
      </div>

      {/* --- NAV --- */}
      <nav className={scrolled ? 'nav-scrolled' : ''}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CorporateLogo scrolled={scrolled} />

          <div className="desktop-links" style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <Link href="/listings" style={{ textDecoration: 'none', color: scrolled ? 'var(--violet-deep)' : 'white', fontWeight: '700', fontSize: '12px' }}>MARKETPLACE</Link>
            {user ? (
              <div style={{ display: 'flex', gap: '15px' }}>
                <Link href="/dashboard" className="btn-action">DASHBOARD</Link>
                <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: scrolled ? 'var(--violet-deep)' : 'white', fontWeight: '700', cursor: 'pointer' }}>LOGOUT</button>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-action">SIGN IN</Link>
            )}
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(true)}> <div /> <div /> <div /> </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <main style={{ background: 'var(--violet-deep)' }}>
        <RollingShowcase />
        <div style={{ position: 'relative', marginTop: '-50px', zIndex: 10 }}>
          <SearchPill />
        </div>
      </main>

      <MarketTicker />

      {/* --- RECENT OFFERS (Now using Agent Uploads Only) --- */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
             <h2 style={{ fontWeight: '900', fontSize: '2.5rem', color: 'var(--violet-deep)' }}>Latest <span style={{ color: 'var(--violet-accent)' }}>Offers</span></h2>
             <Link href="/listings" style={{ color: 'var(--violet-deep)', fontWeight: '800', textDecoration: 'none', borderBottom: '2px solid var(--violet-accent)' }}>VIEW ALL</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {realListings.map((p) => (
              <Link href={`/properties/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                  <div style={{ height: '240px', background: '#f0f0f0' }}>
                    {/* Source actual agent images from Supabase */}
                    <img 
                        src={p.property_images?.[0]?.url || p.images?.[0] || '/images/placeholder-property.jpg'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt={p.title}
                    />
                  </div>
                  <div style={{ padding: '25px' }}>
                    <div style={{ color: 'var(--violet-accent)', fontWeight: '900', fontSize: '1.3rem' }}>KES {p.price?.toLocaleString()}</div>
                    <div style={{ fontWeight: '700', margin: '10px 0', color: 'var(--violet-deep)' }}>{p.title}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>📍 {p.sub_counties?.name || 'Savannah'}, {p.counties?.name || 'Kenya'}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- WHY BETTERMENT (Clean logic, Violet theme) --- */}
      <section style={{ padding: '80px 20px', textAlign: 'center', background: 'white' }}>
        <h2 style={{ fontWeight: '900', fontSize: '2.5rem', color: 'var(--violet-deep)' }}>Why Betterment Group?</h2>
        <p style={{ color: '#555', maxWidth: '650px', margin: '20px auto', lineHeight: 1.6 }}>
          Institutional-grade real estate transparency. We connect you with verified listings and professional agents across Kenya.
        </p>
      </section>

      {/* --- FOOTER (Deep Violet) --- */}
      <footer style={{ background: 'var(--violet-deep)', color: 'white', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '50px' }}>
          <div>
             <CorporateLogo scrolled={false} />
             <p style={{ color: '#ccc', fontSize: '13px', marginTop: '20px' }}>Premium real estate solutions since 2014.</p>
          </div>
          <div>
             <h4 style={{ color: 'var(--violet-accent)', marginBottom: '20px' }}>LEGAL</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <Link href="/privacy" style={{ color: 'white', textDecoration: 'none' }}>Privacy Policy</Link>
                <Link href="/terms" style={{ color: 'white', textDecoration: 'none' }}>Terms of Service</Link>
             </div>
          </div>
          <div>
             <h4 style={{ color: 'var(--violet-accent)', marginBottom: '20px' }}>CONTACT</h4>
             <div style={{ fontSize: '14px', color: '#ccc' }}>
                <p>Nairobi, Kenya</p>
                <p>support@bettermentgroup.com</p>
             </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '60px', color: '#666', fontSize: '12px' }}>
          © {new Date().getFullYear()} BETTERMENT GROUP PROPERTIES.
        </div>
      </footer>
    </>
  )
}