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

  // New Corporate Logo for Sidebar
  const CorporateLogo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img src="/images/logo.jpg" alt="Logo" style={{ height: '45px', width: 'auto', borderRadius: '4px' }} />
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: '900', fontSize: '1rem', color: '#1B1464', lineHeight: 1 }}>BETTERMENT</div>
        <div style={{ color: '#4834D4', fontSize: '7px', fontWeight: '800', letterSpacing: '1px' }}>AGENT PORTAL</div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
        
        :root {
          --navy: #1B1464;
          --purple: #4834D4;
          --arctic: #F8F9FA;
          --slate: #636E72;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: var(--arctic); color: var(--navy); }

        /* --- Sidebar --- */
        .sidebar { 
          width: 280px; 
          background: white; 
          border-right: 1px solid #E5E7EB; 
          position: fixed; 
          height: 100vh; 
          z-index: 1000; 
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        
        .main-content { 
          margin-left: 280px; 
          min-height: 100vh; 
          background: var(--arctic);
        }

        .overlay {
          position: fixed; inset: 0; background: rgba(27, 20, 100, 0.1); backdrop-filter: blur(4px); z-index: 900; display: none;
        }

        /* --- Navigation --- */
        .nav-item { 
          display:flex; align-items:center; gap:12px; padding:14px 18px; 
          border-radius:10px; cursor:pointer; color: #64748b; 
          background:transparent; border:none; width:100%; text-align:left; 
          font-family:inherit; transition: 0.2s; margin-bottom: 5px; font-weight: 600; font-size: 14px;
        }
        .nav-item:hover { background: #F1F5F9; color: var(--navy); }
        .nav-item.active { background: #EEF2FF; color: var(--purple); }

        /* --- UI Components --- */
        .card { 
          background: white; 
          border: 1px solid #E5E7EB; 
          border-radius: 16px; 
          padding: 25px; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .btn-corporate { 
          background: var(--navy); 
          color: #FFF; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 8px; 
          font-weight: 700; 
          cursor: pointer; 
          transition: 0.3s; 
          text-transform: uppercase; 
          font-size: 11px;
          letter-spacing: 0.5px; 
        }
        .btn-corporate:hover { background: var(--purple); transform: translateY(-1px); box-shadow: 0 10px 15px rgba(27, 20, 100, 0.1); }

        .btn-wa { background: #25D366; color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-size: 12px; }

        input, textarea { 
          width: 100%; background: #FFF; border: 1px solid #D1D5DB; 
          border-radius: 10px; padding: 12px; color: var(--navy); margin-top: 8px; outline: none; transition: 0.2s; font-family: inherit;
        }
        input:focus { border-color: var(--purple); ring: 2px solid var(--purple); }

        .badge { font-size: 10px; font-weight: 800; padding: 5px 12px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .overlay.show { display: block; }
        }
      `}</style>

      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Link href="/" style={{ textDecoration: 'none', marginBottom: '40px' }}>
            <CorporateLogo />
          </Link>

          <nav style={{ flex: 1 }}>
            <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => {setTab('overview'); setSidebarOpen(false)}}>📊 Overview</button>
            <button className={`nav-item ${tab === 'my-listings' ? 'active' : ''}`} onClick={() => {setTab('my-listings'); setSidebarOpen(false)}}>🏠 My Properties</button>
            <button className={`nav-item ${tab === 'inquiries' ? 'active' : ''}`} onClick={() => {setTab('inquiries'); setSidebarOpen(false)}}>✉️ Leads ({inquiries.length})</button>
            <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => {setTab('profile'); setSidebarOpen(false)}}>👤 Settings</button>
          </nav>

          <button onClick={handleSignOut} className="nav-item" style={{ color: '#EF4444', borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginTop: '20px' }}>🚪 Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <header style={{ 
          height: '70px', borderBottom: '1px solid #E5E7EB', 
          display: 'flex', alignItems: 'center', padding: '0 30px', 
          justifyContent: 'space-between', background: 'white', 
          position: 'sticky', top: 0, zIndex: 100 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={{ background: 'var(--arctic)', border: '1px solid #E5E7EB', borderRadius: '8px', width: '35px', height: '35px', color: 'var(--navy)', cursor: 'pointer' }} onClick={() => setSidebarOpen(true)}>☰</button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.replace('-', ' ')}</h2>
          </div>
          <Link href="/dashboard/add-property" className="btn-corporate" style={{ textDecoration: 'none' }}>
            + NEW LISTING
          </Link>
        </header>

        <div style={{ padding: '30px' }}>
          {loading ? (
             <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--slate)', fontWeight: '600' }}>Syncing with Betterment Cloud...</div>
          ) : (
            <>
              {/* --- OVERVIEW --- */}
              {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div className="card" style={{ borderLeft: '4px solid var(--purple)' }}>
                    <p style={{ color: 'var(--slate)', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Active Listings</p>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--navy)', marginTop: '5px' }}>{myListings.filter(l => l.listing_status === 'active').length}</h1>
                  </div>
                  <div className="card" style={{ borderLeft: '4px solid var(--navy)' }}>
                    <p style={{ color: 'var(--slate)', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Customer Leads</p>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--navy)', marginTop: '5px' }}>{inquiries.length}</h1>
                  </div>
                  <div className="card" style={{ borderLeft: '4px solid #CBD5E1' }}>
                    <p style={{ color: 'var(--slate)', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Pending Review</p>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#94A3B8', marginTop: '5px' }}>{myListings.filter(l => l.listing_status === 'pending').length}</h1>
                  </div>
                </div>
              )}

              {/* --- MY LISTINGS --- */}
              {tab === 'my-listings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {myListings.length === 0 && <div className="card" style={{ textAlign: 'center', color: 'var(--slate)' }}>No properties registered to your account.</div>}
                  {myListings.map(l => (
                    <div key={l.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                      <div>
                        <h4 style={{ color: 'var(--navy)', fontSize: '1rem', fontWeight: '800' }}>{l.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                           <span className="badge" style={{ 
                             background: l.listing_status === 'active' ? '#DCFCE7' : '#FEF3C7',
                             color: l.listing_status === 'active' ? '#166534' : '#92400E'
                           }}>{l.listing_status}</span>
                           <span style={{ fontSize: '11px', color: 'var(--slate)', fontWeight: '600' }}>UUID: {l.id.slice(0,8)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {l.listing_status === 'pending' && (
                          <button className="btn-corporate" style={{ padding: '8px 16px', background: '#10B981' }} onClick={() => updateListingStatus(l.id, 'active')}>Publish</button>
                        )}
                        {l.listing_status === 'active' && (
                          <button className="btn-corporate" style={{ padding: '8px 16px', background: 'var(--purple)' }} onClick={() => updateListingStatus(l.id, 'sold')}>Mark Sold</button>
                        )}
                        <button style={{ background: '#FFF', border: '1px solid #EF4444', color: '#EF4444', padding: '8px 16px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }} onClick={() => deleteListing(l.id)}>DELETE</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* --- INQUIRIES --- */}
              {tab === 'inquiries' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {inquiries.length === 0 && <div className="card" style={{ textAlign: 'center', color: 'var(--slate)' }}>No lead inquiries found.</div>}
                    {inquiries.map(i => (
                      <div key={i.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                             <h4 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: '800' }}>{i.sender_name}</h4>
                             <span style={{ fontSize: '10px', color: 'var(--purple)', fontWeight: '800' }}>PROPERTY: {i.properties?.title}</span>
                          </div>
                          <a href={`https://wa.me/${i.sender_phone.replace(/\D/g, '')}`} target="_blank" className="btn-wa">
                             WA CLIENT
                          </a>
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '10px', border: '1px solid #E2E8F0', color: 'var(--slate)', fontSize: '14px', lineHeight: 1.5 }}>
                          "{i.message}"
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '11px', color: '#94A3B8', fontWeight: '700' }}>
                           RECIEVED: {new Date(i.created_at).toLocaleDateString()} • CONTACT: {i.sender_phone}
                        </div>
                      </div>
                    ))}
                 </div>
              )}

              {/* --- PROFILE TAB --- */}
              {tab === 'profile' && profile && (
                <form className="card" style={{ maxWidth: '550px', margin: '0 auto' }} onSubmit={updateProfile}>
                  <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '800', color: 'var(--navy)' }}>Agent Account Information</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--slate)', fontWeight: '800' }}>FULL NAME</label>
                    <input required value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--slate)', fontWeight: '800' }}>DIRECT PHONE (INTERNATIONAL FORMAT)</label>
                    <input placeholder="254..." value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--slate)', fontWeight: '800' }}>REGISTERED AGENCY NAME</label>
                    <input value={profile.agency_name || ''} onChange={e => setProfile({...profile, agency_name: e.target.value})} />
                  </div>

                  <button type="submit" className="btn-corporate" style={{ width: '100%' }}>UPDATE PROFILE</button>
                </form>
              )}
            </>
          )}
        </div>
      </main>

      {/* Corporate Toast */}
      {toast && (
        <div style={{ 
          position: 'fixed', top: '20px', right: '20px', 
          background: 'var(--navy)', color: '#FFF', padding: '12px 25px', 
          borderRadius: '8px', fontWeight: '700', zIndex: 2000, 
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          fontSize: '12px', borderBottom: '3px solid var(--purple)'
        }}>
          {toast}
        </div>
      )}
    </>
  )
}