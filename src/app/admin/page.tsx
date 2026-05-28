'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Tab = 'overview' | 'listings' | 'agents'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [listings, setListings] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // 1. Fetch All Listings
    const { data: props, error: pError } = await supabase
      .from('properties')
      .select('*, profiles(full_name, agency_name)')
      .order('created_at', { ascending: false })

    if (pError) console.error("Properties Error:", pError.message)

    // 2. Fetch All Agents
    const { data: profs, error: aError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'agent')
      .order('created_at', { ascending: false })

    if (aError) console.error("Agents Error:", aError.message)

    setListings(props || [])
    setAgents(profs || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  // --- DELETE LOGIC ---

  const deleteProperty = async (id: string) => {
    if (!confirm("Are you sure? This listing will be gone forever.")) return
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (!error) {
      setToast("Listing deleted successfully")
      setListings(prev => prev.filter(l => l.id !== id))
    } else {
      alert("Error: " + error.message)
    }
  }

  const deleteAgent = async (id: string) => {
    if (!confirm("Warning: Deleting an agent will also remove all their property listings. Proceed?")) return
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (!error) {
      setToast("Agent and their listings removed")
      setAgents(prev => prev.filter(a => a.id !== id))
      fetchData() // Refresh listings as well
    } else {
      alert("Error: " + error.message)
    }
  }

  const updateListingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('properties')
      .update({ listing_status: status })
      .eq('id', id)

    if (!error) {
      setToast(`Listing marked as ${status}`)
      fetchData()
    }
  }

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', id)

    if (!error) {
      setToast(!currentStatus ? '✅ Agent Verified' : 'Agent Unverified')
      fetchData()
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
        
        .btn-del { background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-del:hover { background: #ff4444; color: #fff; }

        @media (max-width: 1024px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .main-content { margin-left: 0; }
            .mobile-toggle { display: block !important; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ marginBottom: '32px', fontFamily: 'Bebas Neue', fontSize: '24px', color: '#C9A84C', textAlign: 'center' }}>ADMIN PANEL</div>
          
          <nav style={{ flex: 1 }}>
            <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>📊 Overview</button>
            <button className={`nav-item ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>🏠 All Listings</button>
            <button className={`nav-item ${tab === 'agents' ? 'active' : ''}`} onClick={() => setTab('agents')}>👥 Agents</button>
          </nav>

          <button onClick={handleSignOut} className="nav-item" style={{ color: '#ff4444', marginTop: 'auto' }}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header style={{ height: '70px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', padding: '0 30px', justifyContent: 'space-between', background: '#0c0c14', position: 'sticky', top: 0, zIndex: 100 }}>
          <button className="mobile-toggle" style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '24px' }} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h2 style={{ textTransform: 'capitalize', fontSize: '18px' }}>{tab}</h2>
          <div style={{ background: '#EF4444', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>SUPER ADMIN</div>
        </header>

        <div style={{ padding: '30px' }}>
          {loading ? <p>Loading data...</p> : (
            <>
              {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div className="card">
                    <p style={{color: '#666', fontSize: '12px', marginBottom: '10px'}}>Total Properties</p>
                    <h1 style={{ fontSize: '48px', fontFamily: 'Bebas Neue', color: '#C9A84C' }}>{listings.length}</h1>
                  </div>
                  <div className="card">
                    <p style={{color: '#666', fontSize: '12px', marginBottom: '10px'}}>Total Agents</p>
                    <h1 style={{ fontSize: '48px', fontFamily: 'Bebas Neue', color: '#C9A84C' }}>{agents.length}</h1>
                  </div>
                </div>
              )}

              {tab === 'listings' && (
                <div>
                  {listings.map(l => (
                    <div key={l.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{flex: 1}}>
                        <h4 style={{ color: '#fff', marginBottom: '4px' }}>{l.title}</h4>
                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '15px' }}>
                            <span>👤 {l.profiles?.full_name}</span>
                            <span>Status: <b style={{ color: l.listing_status === 'active' ? '#4ade80' : '#F59E0B' }}>{l.listing_status.toUpperCase()}</b></span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {l.listing_status !== 'active' && (
                          <button onClick={() => updateListingStatus(l.id, 'active')} style={{ background: '#22C55E', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Approve</button>
                        )}
                        <button className="btn-del" onClick={() => deleteProperty(l.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {listings.length === 0 && <p>No listings found. Check RLS policies.</p>}
                </div>
              )}

              {tab === 'agents' && (
                <div>
                   {agents.map(a => (
                     <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                           <h4 style={{ color: '#fff', marginBottom: '4px' }}>{a.full_name} {a.is_verified ? '✅' : ''}</h4>
                           <p style={{ fontSize: '12px', color: '#666' }}>{a.email} | {a.agency_name || 'Independent Agent'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => toggleVerification(a.id, a.is_verified)}
                            style={{ 
                              background: 'rgba(255,255,255,0.05)', 
                              color: a.is_verified ? '#888' : '#C9A84C',
                              border: '1px solid #333',
                              padding: '8px 15px', 
                              borderRadius: '8px', 
                              fontWeight: 'bold', 
                              cursor: 'pointer' 
                            }}
                          >
                            {a.is_verified ? 'Unverify' : 'Verify'}
                          </button>
                          <button className="btn-del" onClick={() => deleteAgent(a.id)}>Delete Agent</button>
                        </div>
                     </div>
                   ))}
                   {agents.length === 0 && <p>No agents found.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {toast && <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', zIndex: 1000 }}>{toast}</div>}
    </>
  )
}