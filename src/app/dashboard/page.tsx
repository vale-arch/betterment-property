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

  const deleteAccount = async () => {
    if (!confirm("CRITICAL: Delete your entire account and all listings? This cannot be undone.")) return
    const { error } = await supabase.from('profiles').delete().eq('id', profile.id)
    if (!error) {
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #080810; color: #fff; -webkit-font-smoothing: antialiased; }

        /* --- Sidebar & Layout --- */
        .sidebar { 
          width: 280px; 
          background: #0c0c14; 
          border-right: 1px solid rgba(255,255,255,0.05); 
          position: fixed; 
          height: 100vh; 
          z-index: 1000; 
          transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1); 
        }
        
        .main-content { 
          margin-left: 280px; 
          min-height: 100vh; 
          background: linear-gradient(to bottom, #080810, #0c0c14);
          transition: margin-left 0.4s ease;
        }

        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 900; display: none;
        }

        /* --- Nav Items --- */
        .nav-item { 
          display:flex; align-items:center; gap:14px; padding:14px 20px; 
          border-radius:12px; cursor:pointer; color:rgba(255,255,255,0.4); 
          background:transparent; border:none; width:100%; text-align:left; 
          font-family:inherit; transition: all 0.2s ease; margin-bottom: 4px;
        }
        .nav-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
        .nav-item.active { background: rgba(201,168,76,0.1); color: #C9A84C; font-weight: 600; }

        /* --- UI Components --- */
        .card { 
          background: #111118; 
          border: 1px solid rgba(255,255,255,0.06); 
          border-radius: 20px; 
          padding: 24px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          transition: border-color 0.3s ease;
        }
        .card:hover { border-color: rgba(201,168,76,0.2); }

        .btn-gold { background: #C9A84C; color: #000; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .btn-gold:hover { background: #E8C97A; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(201,168,76,0.3); }

        .btn-action { padding: 10px 16px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s; }
        
        .btn-wa { background: #25D366; color: #fff; padding: 10px 18px; border-radius: 10px; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-size: 12px; }

        input, textarea { 
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 12px; padding: 14px; color: #fff; margin-top: 6px; outline: none; transition: 0.3s;
        }
        input:focus { border-color: #C9A84C; background: rgba(255,255,255,0.06); }

        .badge { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }

        /* --- MOBILE OPTIMIZATIONS --- */
        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .overlay.show { display: block; }
          .mobile-header { display: flex !important; }
          .desktop-title { display: none; }
          .padding-container { padding: 20px !important; }
        }

        @media (max-width: 640px) {
          .card-header-flex { flex-direction: column; align-items: flex-start !important; gap: 15px; }
          .btn-group { width: 100%; }
          .btn-group button { flex: 1; }
          .overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Overlay for mobile */}
      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ width: '32px', height: '32px', background: '#C9A84C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>B</div>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1px' }}>BETTERMENT AGENT</span>
          </div>

          <nav style={{ flex: 1 }}>
            <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => {setTab('overview'); setSidebarOpen(false)}}>📊 Dashboard Overview</button>
            <button className={`nav-item ${tab === 'my-listings' ? 'active' : ''}`} onClick={() => {setTab('my-listings'); setSidebarOpen(false)}}>🏠 My Properties</button>
            <button className={`nav-item ${tab === 'inquiries' ? 'active' : ''}`} onClick={() => {setTab('inquiries'); setSidebarOpen(false)}}>✉️ Customer Leads ({inquiries.length})</button>
            <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => {setTab('profile'); setSidebarOpen(false)}}>👤 Profile & Contact</button>
            <Link href="/" className="nav-item" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px', paddingBottom: '15px' }}>
            <span style={{ fontSize: '18px' }}>🌐</span> 
            <span>Home Page</span>
            </Link>
          </nav>

          <button onClick={handleSignOut} className="nav-item" style={{ color: '#ff4444', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', marginTop: '20px' }}>🚪 Logout Session</button>
        </div>
      </aside>

      <main className="main-content">
        {/* Header */}
        <header style={{ 
          height: '80px', borderBottom: '1px solid rgba(255,255,255,0.05)', 
          display: 'flex', alignItems: 'center', padding: '0 40px', 
          justifyContent: 'space-between', background: 'rgba(12,12,20,0.5)', 
          backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 
        }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', width: '40px', height: '40px', color: '#fff', fontSize: '20px', cursor: 'pointer' }} onClick={() => setSidebarOpen(true)}>☰</button>
            <h2 style={{ fontSize: '18px', fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>{tab.replace('-', ' ')}</h2>
          </div>
          <Link href="/dashboard/add-property">
            <button className="btn-gold" style={{ padding: '10px 18px', fontSize: '12px' }}>+ LIST PROPERTY</button>
          </Link>
        </header>

        <div className="padding-container" style={{ padding: '40px' }}>
          {loading ? (
             <div style={{ textAlign: 'center', marginTop: '100px', color: '#444' }}>Initialising secure dashboard...</div>
          ) : (
            <>
              {/* --- OVERVIEW --- */}
              {tab === 'overview' && (
                <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  <div className="card">
                    <p style={{ color: '#555', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Listings</p>
                    <h1 style={{ fontSize: '56px', fontFamily: 'Bebas Neue', color: '#4ade80', lineHeight: 1, marginTop: '8px' }}>{myListings.filter(l => l.listing_status === 'active').length}</h1>
                  </div>
                  <div className="card">
                    <p style={{ color: '#555', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Inbound Leads</p>
                    <h1 style={{ fontSize: '56px', fontFamily: 'Bebas Neue', color: '#C9A84C', lineHeight: 1, marginTop: '8px' }}>{inquiries.length}</h1>
                  </div>
                  <div className="card">
                    <p style={{ color: '#555', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending</p>
                    <h1 style={{ fontSize: '56px', fontFamily: 'Bebas Neue', color: '#F59E0B', lineHeight: 1, marginTop: '8px' }}>{myListings.filter(l => l.listing_status === 'pending').length}</h1>
                  </div>
                </div>
              )}

              {/* --- MY LISTINGS --- */}
              {tab === 'my-listings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myListings.length === 0 && <div className="card" style={{ textAlign: 'center', color: '#444' }}>No properties listed yet. Start by adding one.</div>}
                  {myListings.map(l => (
                    <div key={l.id} className="card card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: '#fff', textTransform: 'capitalize', fontSize: '18px', marginBottom: '4px' }}>{l.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <span className="badge" style={{ 
                             background: l.listing_status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.1)',
                             color: l.listing_status === 'active' ? '#4ade80' : '#F59E0B'
                           }}>● {l.listing_status}</span>
                           <span style={{ fontSize: '12px', color: '#444' }}>Uploaded: {new Date(l.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }} className="btn-group">
                        {l.listing_status === 'pending' && (
                          <button className="btn-action" style={{ background: '#4ade80', color: '#000' }} onClick={() => updateListingStatus(l.id, 'active')}>Publish</button>
                        )}
                        {l.listing_status === 'active' && (
                          <button className="btn-action" style={{ background: '#C9A84C', color: '#000' }} onClick={() => updateListingStatus(l.id, 'sold')}>Mark Sold</button>
                        )}
                        <button className="btn-action" style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }} onClick={() => deleteListing(l.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* --- PROFILE TAB --- */}
              {tab === 'profile' && profile && (
                <form className="card" style={{ maxWidth: '600px', margin: '0 auto' }} onSubmit={updateProfile}>
                  <h3 style={{ marginBottom: '25px', fontSize: '20px', fontFamily: 'Bebas Neue', letterSpacing: '1px', color: '#C9A84C' }}>Business Profile</h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', color: '#555', fontWeight: '800' }}>AGENT FULL NAME</label>
                    <input required value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', color: '#555', fontWeight: '800' }}>PHONE & WHATSAPP (CONSOLIDATED)</label>
                    <input placeholder="e.g. 254712345678" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
                    <p style={{ color: '#333', fontSize: '10px', marginTop: '6px' }}>Clients will use this number for both direct calls and WhatsApp messages.</p>
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ fontSize: '11px', color: '#555', fontWeight: '800' }}>AGENCY / BRAND NAME</label>
                    <input value={profile.agency_name || ''} onChange={e => setProfile({...profile, agency_name: e.target.value})} />
                  </div>

                  <button type="submit" className="btn-gold" style={{ width: '100%' }}>UPDATE PROFILE SETTINGS</button>
                  
                  <div style={{ marginTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                    <button type="button" onClick={deleteAccount} style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '12px', borderRadius: '12px', width: '100%', cursor: 'pointer', fontSize: '11px', fontWeight: '800' }}>DELETE ACCOUNT FOREVER</button>
                  </div>
                </form>
              )}
              
              {/* --- INQUIRIES --- */}
              {tab === 'inquiries' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {inquiries.length === 0 && <div className="card" style={{ textAlign: 'center', color: '#444' }}>No customer inquiries yet. Active listings generate leads.</div>}
                    {inquiries.map(i => (
                      <div key={i.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="card-header-flex">
                          <div>
                             <h4 style={{ color: '#C9A84C', fontSize: '18px', marginBottom: '2px' }}>{i.sender_name}</h4>
                             <span style={{ fontSize: '11px', color: '#444' }}>Received {new Date(i.created_at).toLocaleString()}</span>
                          </div>
                          <a href={`https://wa.me/${i.sender_phone.replace(/\D/g, '')}`} target="_blank" className="btn-wa">
                             💬 CHAT ON WHATSAPP
                          </a>
                        </div>
                        <div style={{ background: '#080810', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', color: '#bbb', fontSize: '14px', lineHeight: 1.6 }}>
                          "{i.message}"
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', fontSize: '11px', color: '#444', fontWeight: 'bold' }}>
                           <span>PROPERTY: {i.properties?.title?.toUpperCase()}</span>
                           <span>CALL: {i.sender_phone}</span>
                        </div>
                      </div>
                    ))}
                 </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
          background: '#C9A84C', color: '#000', padding: '14px 32px', 
          borderRadius: '50px', fontWeight: '900', zIndex: 2000, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '2px solid #fff',
          fontSize: '13px', letterSpacing: '0.5px'
        }}>
          {toast.toUpperCase()}
        </div>
      )}
    </>
  )
}