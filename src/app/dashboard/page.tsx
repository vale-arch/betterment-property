'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'overview' | 'my-listings' | 'inquiries' | 'profile'

export default function AgentDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [profile, setProfile] = useState<any>(null)
  const [myListings, setMyListings] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [toast, setToast] = useState('')

  useEffect(() => { initDashboard() }, [])

  const initDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/auth/login')
    await fetchData(user.id)
  }

  const fetchData = async (userId: string) => {
    setLoading(true)
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single()
    const { data: props } = await supabase.from('properties').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
    const { data: inq } = await supabase.from('inquiries').select('*, properties(title)').eq('agent_id', userId).order('created_at', { ascending: false })

    setProfile(prof)
    setMyListings(props || [])
    setInquiries(inq || [])
    setLoading(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  const updateListingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('properties').update({ listing_status: status }).eq('id', id)
    if (!error) {
      showToast(`Success: Listing is now ${status}`)
      setMyListings(prev => prev.map(l => l.id === id ? { ...l, listing_status: status } : l))
    }
  }

  const deleteListing = async (id: string) => {
    if (!confirm("Are you sure? This will remove the listing permanently.")) return
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (!error) {
      showToast("Listing deleted")
      setMyListings(prev => prev.filter(l => l.id !== id))
    }
  }

  const updateProfile = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      phone: profile.phone,
      whatsapp: profile.phone, 
      agency_name: profile.agency_name,
      bio: profile.bio
    }).eq('id', profile.id)

    if (!error) showToast("✅ Profile Updated")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        :root {
          --terracotta: #A3432F;
          --gold: #C9A84C;
          --bone: #FDFCF9;
          --charcoal: #1A1A1A;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: var(--bone); color: var(--charcoal); }

        /* --- Sidebar & Layout --- */
        .sidebar { 
          width: 280px; 
          background: white; 
          border-right: 1px solid #EEE; 
          position: fixed; 
          height: 100vh; 
          z-index: 1000; 
          transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1); 
        }
        
        .main-content { 
          margin-left: 280px; 
          min-height: 100vh; 
          background: var(--bone);
        }

        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(4px); z-index: 900; display: none;
        }

        /* --- Nav Items --- */
        .nav-item { 
          display:flex; align-items:center; gap:14px; padding:16px 20px; 
          border-radius:14px; cursor:pointer; color: #666; 
          background:transparent; border:none; width:100%; text-align:left; 
          font-family:inherit; transition: 0.2s; margin-bottom: 4px; font-weight: 600;
        }
        .nav-item:hover { background: #F5F5F5; color: var(--terracotta); }
        .nav-item.active { background: rgba(163, 67, 47, 0.08); color: var(--terracotta); }

        /* --- UI Components --- */
        .card { 
          background: white; 
          border: 1px solid #EEE; 
          border-radius: 24px; 
          padding: 30px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }

        .btn-terracotta { background: var(--terracotta); color: #FFF; border: none; padding: 12px 24px; border-radius: 100px; font-weight: 700; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px; }
        .btn-terracotta:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(163, 67, 47, 0.2); }

        .btn-wa { background: #25D366; color: #fff; padding: 10px 18px; border-radius: 100px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-size: 12px; }

        input, textarea { 
          width: 100%; background: #F9F9F9; border: 1px solid #EEE; 
          border-radius: 14px; padding: 14px; color: var(--charcoal); margin-top: 8px; outline: none; transition: 0.3s; font-family: inherit;
        }
        input:focus { border-color: var(--terracotta); background: white; }

        .badge { font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 1px; }

        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .overlay.show { display: block; }
          .padding-container { padding: 20px !important; }
        }
      `}</style>

      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Dashboard Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: '35px', height: '35px', background: 'var(--terracotta)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>B</div>
            <div>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', letterSpacing: '1px', color: 'var(--charcoal)', display: 'block', lineHeight: 1 }}>AGENT PORTAL</span>
                <span style={{ color: 'var(--gold)', fontSize: '8px', fontWeight: '900', letterSpacing: '1px' }}>BETTERMENT GROUP</span>
            </div>
          </Link>

          <nav style={{ flex: 1 }}>
            <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => {setTab('overview'); setSidebarOpen(false)}}>📊 Overview</button>
            <button className={`nav-item ${tab === 'my-listings' ? 'active' : ''}`} onClick={() => {setTab('my-listings'); setSidebarOpen(false)}}>🏠 My Properties</button>
            <button className={`nav-item ${tab === 'inquiries' ? 'active' : ''}`} onClick={() => {setTab('inquiries'); setSidebarOpen(false)}}>✉️ Leads ({inquiries.length})</button>
            <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => {setTab('profile'); setSidebarOpen(false)}}>👤 Settings</button>
          </nav>

          <button onClick={handleSignOut} className="nav-item" style={{ color: '#ff4444', borderTop: '1px solid #EEE', paddingTop: '20px', marginTop: '20px' }}>🚪 Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <header style={{ 
          height: '80px', borderBottom: '1px solid #EEE', 
          display: 'flex', alignItems: 'center', padding: '0 40px', 
          justifyContent: 'space-between', background: 'white', 
          position: 'sticky', top: 0, zIndex: 100 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={{ background: '#F5F5F5', border: '1px solid #EEE', borderRadius: '10px', width: '40px', height: '40px', color: '#333', fontSize: '20px', cursor: 'pointer' }} onClick={() => setSidebarOpen(true)}>☰</button>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'Bebas Neue', letterSpacing: '1px', color: 'var(--terracotta)' }}>{tab.replace('-', ' ').toUpperCase()}</h2>
          </div>
          <Link href="/dashboard/add-property" className="btn-terracotta" style={{ textDecoration: 'none', fontSize: '11px' }}>
            + NEW LISTING
          </Link>
        </header>

        <div className="padding-container" style={{ padding: '40px' }}>
          {loading ? (
             <div style={{ textAlign: 'center', marginTop: '100px', color: '#999', fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>Loading Dashboard...</div>
          ) : (
            <>
              {/* --- OVERVIEW --- */}
              {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                  <div className="card">
                    <p style={{ color: '#999', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Properties</p>
                    <h1 style={{ fontSize: '4rem', fontFamily: 'Bebas Neue', color: 'var(--terracotta)', lineHeight: 1, marginTop: '10px' }}>{myListings.filter(l => l.listing_status === 'active').length}</h1>
                  </div>
                  <div className="card">
                    <p style={{ color: '#999', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Leads</p>
                    <h1 style={{ fontSize: '4rem', fontFamily: 'Bebas Neue', color: 'var(--gold)', lineHeight: 1, marginTop: '10px' }}>{inquiries.length}</h1>
                  </div>
                  <div className="card">
                    <p style={{ color: '#999', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Approvals</p>
                    <h1 style={{ fontSize: '4rem', fontFamily: 'Bebas Neue', color: '#CCC', lineHeight: 1, marginTop: '10px' }}>{myListings.filter(l => l.listing_status === 'pending').length}</h1>
                  </div>
                </div>
              )}

              {/* --- MY LISTINGS --- */}
              {tab === 'my-listings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myListings.length === 0 && <div className="card" style={{ textAlign: 'center', color: '#999' }}>No properties found. List your first property to get started.</div>}
                  {myListings.map(l => (
                    <div key={l.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                      <div>
                        <h4 style={{ color: 'var(--charcoal)', textTransform: 'capitalize', fontSize: '1.2rem', marginBottom: '5px', fontWeight: '700' }}>{l.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <span className="badge" style={{ 
                             background: l.listing_status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                             color: l.listing_status === 'active' ? '#22C55E' : '#F59E0B'
                           }}>{l.listing_status}</span>
                           <span style={{ fontSize: '12px', color: '#999' }}>ID: {l.id.slice(0,8)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {l.listing_status === 'pending' && (
                          <button className="btn-terracotta" style={{ padding: '8px 16px', fontSize: '10px', background: '#22C55E' }} onClick={() => updateListingStatus(l.id, 'active')}>Publish</button>
                        )}
                        {l.listing_status === 'active' && (
                          <button className="btn-terracotta" style={{ padding: '8px 16px', fontSize: '10px', background: 'var(--gold)' }} onClick={() => updateListingStatus(l.id, 'sold')}>Mark Sold</button>
                        )}
                        <button style={{ background: '#FFF', border: '1px solid #FF4444', color: '#FF4444', padding: '8px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }} onClick={() => deleteListing(l.id)}>REMOVE</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* --- INQUIRIES --- */}
              {tab === 'inquiries' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {inquiries.length === 0 && <div className="card" style={{ textAlign: 'center', color: '#999' }}>You have no customer inquiries yet.</div>}
                    {inquiries.map(i => (
                      <div key={i.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                          <div>
                             <h4 style={{ color: 'var(--terracotta)', fontSize: '1.3rem', marginBottom: '2px', fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>{i.sender_name}</h4>
                             <span style={{ fontSize: '11px', color: '#999', fontWeight: '700' }}>INTERESTED IN: {i.properties?.title?.toUpperCase()}</span>
                          </div>
                          <a href={`https://wa.me/${i.sender_phone.replace(/\D/g, '')}`} target="_blank" className="btn-wa">
                             WHATSAPP CLIENT
                          </a>
                        </div>
                        <div style={{ background: '#FDFCF9', padding: '20px', borderRadius: '16px', border: '1px solid #EEE', color: '#555', fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic' }}>
                          "{i.message}"
                        </div>
                        <div style={{ marginTop: '20px', fontSize: '11px', color: '#AAA', fontWeight: 'bold' }}>
                           RECEIVED: {new Date(i.created_at).toLocaleString()} • CONTACT: {i.sender_phone}
                        </div>
                      </div>
                    ))}
                 </div>
              )}

              {/* --- PROFILE TAB --- */}
              {tab === 'profile' && profile && (
                <form className="card" style={{ maxWidth: '600px', margin: '0 auto' }} onSubmit={updateProfile}>
                  <h3 style={{ marginBottom: '25px', fontSize: '1.8rem', fontFamily: 'Bebas Neue', color: 'var(--terracotta)' }}>Agent Profile</h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '10px', color: '#999', fontWeight: '900', letterSpacing: '1px' }}>FULL LEGAL NAME</label>
                    <input required value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '10px', color: '#999', fontWeight: '900', letterSpacing: '1px' }}>BUSINESS PHONE / WHATSAPP</label>
                    <input placeholder="254..." value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ fontSize: '10px', color: '#999', fontWeight: '900', letterSpacing: '1px' }}>AGENCY NAME</label>
                    <input value={profile.agency_name || ''} onChange={e => setProfile({...profile, agency_name: e.target.value})} />
                  </div>

                  <button type="submit" className="btn-terracotta" style={{ width: '100%' }}>SAVE ACCOUNT CHANGES</button>
                </form>
              )}
            </>
          )}
        </div>
      </main>

      {/* Luxury Toast */}
      {toast && (
        <div style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
          background: 'var(--gold)', color: '#FFF', padding: '14px 35px', 
          borderRadius: '100px', fontWeight: '800', zIndex: 2000, 
          boxShadow: '0 20px 40px rgba(201, 168, 76, 0.3)',
          fontSize: '12px', letterSpacing: '1px'
        }}>
          {toast.toUpperCase()}
        </div>
      )}
    </>
  )
}