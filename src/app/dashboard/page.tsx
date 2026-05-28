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

  useEffect(() => {
    initDashboard()
  }, [])

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

  // --- ACTIONS ---
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  const updateListingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('properties').update({ listing_status: status }).eq('id', id)
    if (!error) {
      showToast(`Listing marked as ${status}`)
      setMyListings(prev => prev.map(l => l.id === id ? { ...l, listing_status: status } : l))
    }
  }

  const deleteListing = async (id: string) => {
    if (!confirm("Are you sure? This property will be removed from the platform forever.")) return
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (!error) {
      showToast("Listing deleted successfully")
      // Instant UI removal
      setMyListings(prev => prev.filter(l => l.id !== id))
    } else {
      showToast("Error deleting listing")
    }
  }

  const updateProfile = async (e: any) => {
    e.preventDefault()
    // Merged logic: use profile.phone for both phone and whatsapp columns
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      phone: profile.phone,
      whatsapp: profile.phone, 
      agency_name: profile.agency_name,
      bio: profile.bio
    }).eq('id', profile.id)

    if (!error) {
        showToast("✅ Profile & Contact Info updated")
    } else {
        showToast("❌ Update failed")
    }
  }

  const deleteAccount = async () => {
    if (!confirm("CRITICAL: This will delete your profile and all your listings. This cannot be undone. Proceed?")) return
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
        body { font-family: 'Outfit', sans-serif; background: #080810; color: #fff; }
        .sidebar { width: 240px; background: #0c0c14; border-right: 1px solid rgba(255,255,255,0.07); position: fixed; top: 0; bottom: 0; left: 0; z-index: 500; transition: 0.3s; }
        .main-content { margin-left: 240px; min-height: 100vh; transition: 0.3s; }
        .nav-item { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:11px; cursor:pointer; color:rgba(255,255,255,0.5); background:transparent; border:none; width:100%; text-align:left; font-family:inherit; }
        .nav-item.active { background:rgba(201,168,76,0.12); color:#C9A84C; font-weight:600; }
        .card { background:#111118; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px; margin-bottom:12px; }
        input { width:100%; background:#080810; border:1.5px solid #222; border-radius:10px; padding:12px; color:#fff; margin-top:5px; outline: none; }
        input:focus { border-color: #C9A84C; }
        .btn-action { padding: 8px 16px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; transition: 0.2s; }
        .btn-wa { background:#25D366; color:#fff; padding:8px 16px; border-radius:8px; border:none; font-weight:800; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:6px; font-size:12px; }
        .btn-wa:hover { background:#1ebe5d; transform:translateY(-1px); }
        @media (max-width: 1024px) { .sidebar { transform: translateX(-100%); } .sidebar.open { transform: translateX(0); } .main-content { margin-left: 0; } .mobile-toggle { display: block !important; } }
      `}</style>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ marginBottom: '32px', fontFamily: 'Bebas Neue', fontSize: '24px', color: '#C9A84C', textAlign: 'center' }}>AGENT PANEL</div>
          <nav style={{ flex: 1 }}>
            <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>📊 Overview</button>
            <button className={`nav-item ${tab === 'my-listings' ? 'active' : ''}`} onClick={() => setTab('my-listings')}>🏠 My Listings</button>
            <button className={`nav-item ${tab === 'inquiries' ? 'active' : ''}`} onClick={() => setTab('inquiries')}>✉️ Leads ({inquiries.length})</button>
            <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>👤 Profile Settings</button>
          </nav>
          <button onClick={handleSignOut} className="nav-item" style={{ color: '#ff4444', borderTop: '1px solid #222', paddingTop: '20px' }}>🚪 Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <header style={{ height: '70px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', padding: '0 30px', justifyContent: 'space-between', background: '#0c0c14', position: 'sticky', top: 0, zIndex: 100 }}>
          <button className="mobile-toggle" style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '24px' }} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h2 style={{ textTransform: 'capitalize', fontSize: '18px', fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>{tab.replace('-', ' ')}</h2>
          <Link href="/dashboard/add-property">
            <button style={{ background: '#C9A84C', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>+ NEW LISTING</button>
          </Link>
        </header>

        <div style={{ padding: '30px' }}>
          {loading ? <p style={{color: '#666'}}>Loading...</p> : (
            <>
              {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div className="card">
                    <p style={{color: '#666', fontSize: '11px', fontWeight: 'bold'}}>ACTIVE PROPERTIES</p>
                    <h1 style={{ fontSize: '48px', fontFamily: 'Bebas Neue', color: '#4ade80' }}>{myListings.filter(l => l.listing_status === 'active').length}</h1>
                  </div>
                  <div className="card">
                    <p style={{color: '#666', fontSize: '11px', fontWeight: 'bold'}}>CUSTOMER LEADS</p>
                    <h1 style={{ fontSize: '48px', fontFamily: 'Bebas Neue', color: '#C9A84C' }}>{inquiries.length}</h1>
                  </div>
                </div>
              )}

              {tab === 'my-listings' && (
                <div>
                  {myListings.length === 0 && <p style={{color: '#555'}}>No listings found.</p>}
                  {myListings.map(l => (
                    <div key={l.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                      <div>
                        <h4 style={{ color: '#fff', textTransform: 'capitalize', marginBottom: '4px' }}>{l.title}</h4>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                            Status: <b style={{ color: l.listing_status === 'active' ? '#4ade80' : l.listing_status === 'pending' ? '#F59E0B' : '#888' }}>
                                {l.listing_status.toUpperCase()}
                            </b>
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {l.listing_status === 'pending' && (
                          <button className="btn-action" style={{ background: '#22C55E', color: '#000' }} onClick={() => updateListingStatus(l.id, 'active')}>Publish Now</button>
                        )}
                        {l.listing_status === 'active' && (
                          <button className="btn-action" style={{ background: '#C9A84C', color: '#000' }} onClick={() => updateListingStatus(l.id, 'sold')}>Mark Sold</button>
                        )}
                        <button className="btn-action" style={{ background: '#ff4444', color: '#fff' }} onClick={() => deleteListing(l.id)}>Delete Forever</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'profile' && profile && (
                <form className="card" style={{ maxWidth: '500px' }} onSubmit={updateProfile}>
                  <h3 style={{marginBottom: '20px', fontSize: '18px', fontFamily: 'Bebas Neue'}}>Contact Settings</h3>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>FULL NAME</label>
                    <input required value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>PHONE & WHATSAPP NUMBER</label>
                    <input placeholder="e.g. 254712345678" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
                    <small style={{color: '#444', fontSize: '10px', marginTop: '5px', display: 'block'}}>This number will be used for both calls and WhatsApp inquiries.</small>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>AGENCY NAME</label>
                    <input value={profile.agency_name || ''} onChange={e => setProfile({...profile, agency_name: e.target.value})} />
                  </div>
                  <button type="submit" style={{ background: '#C9A84C', border: 'none', padding: '14px', borderRadius: '10px', width: '100%', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>Update Profile</button>
                  
                  <div style={{ marginTop: '40px', borderTop: '1px solid #222', paddingTop: '20px' }}>
                    <button type="button" onClick={deleteAccount} style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Delete My Account</button>
                  </div>
                </form>
              )}
              
              {tab === 'inquiries' && (
                 <div>
                    {inquiries.length === 0 && <p style={{color: '#555'}}>No leads yet.</p>}
                    {inquiries.map(i => (
                      <div key={i.id} className="card">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                          <div>
                             <h4 style={{color: '#C9A84C', marginBottom: '2px'}}>{i.sender_name}</h4>
                             <span style={{fontSize: '10px', color: '#444'}}>{new Date(i.created_at).toLocaleString()}</span>
                          </div>
                          {/* WhatsApp Lead Button */}
                          <a 
                            href={`https://wa.me/${i.sender_phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            className="btn-wa"
                          >
                             💬 WhatsApp Lead
                          </a>
                        </div>
                        <p style={{fontSize: '14px', lineHeight: '1.6', color: '#ccc', background: '#080810', padding: '15px', borderRadius: '10px', border: '1px solid #222'}}>"{i.message}"</p>
                        <div style={{fontSize: '12px', color: '#666', marginTop: '15px', display: 'flex', gap: '20px'}}>
                           <span>🏠 Property: <b>{i.properties?.title}</b></span>
                           <span>📞 Phone: <b>{i.sender_phone}</b></span>
                        </div>
                      </div>
                    ))}
                 </div>
              )}
            </>
          )}
        </div>
      </main>

      {toast && <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#000', padding: '12px 30px', borderRadius: '50px', fontWeight: '800', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '2px solid #fff' }}>{toast}</div>}
    </>
  )
}