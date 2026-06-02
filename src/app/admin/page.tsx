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

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: props } = await supabase.from('properties').select('*, profiles(full_name, agency_name)').order('created_at', { ascending: false })
    const { data: profs } = await supabase.from('profiles').select('*').eq('role', 'agent').order('created_at', { ascending: false })
    setListings(props || [])
    setAgents(profs || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  const deleteProperty = async (id: string) => {
    if (!confirm("Are you sure? This listing will be removed forever.")) return
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (!error) {
      setToast("Listing deleted")
      setListings(prev => prev.filter(l => l.id !== id))
    }
  }

  const deleteAgent = async (id: string) => {
    if (!confirm("Warning: This deletes the agent and all their properties. Proceed?")) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (!error) {
      setToast("Agent removed")
      setAgents(prev => prev.filter(a => a.id !== id))
      fetchData()
    }
  }

  const updateListingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('properties').update({ listing_status: status }).eq('id', id)
    if (!error) {
      setToast(`Status updated to ${status}`)
      fetchData()
    }
  }

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', id)
    if (!error) {
      setToast(!currentStatus ? "Agent Verified" : "Verification Removed")
      fetchData()
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #080810; color: #fff; }

        /* --- Layout --- */
        .sidebar { 
          width: 280px; background: #0c0c14; border-right: 1px solid rgba(255,255,255,0.05); 
          position: fixed; height: 100vh; z-index: 1000; 
          transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1); 
        }
        .main-content { margin-left: 280px; min-height: 100vh; transition: 0.4s; }
        
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 950; display: none; }
        
        .nav-item { 
          display:flex; align-items:center; gap:14px; padding:15px 20px; 
          border-radius:12px; cursor:pointer; color:rgba(255,255,255,0.4); 
          background:transparent; border:none; width:100%; text-align:left; 
          font:inherit; transition: 0.3s; margin-bottom: 5px;
        }
        .nav-item.active { background: rgba(201,168,76,0.1); color: #C9A84C; font-weight: 600; }

        /* --- Components --- */
        .card { 
          background: #111118; border: 1px solid rgba(255,255,255,0.06); 
          border-radius: 20px; padding: 24px; margin-bottom: 15px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .btn-gold { background: #C9A84C; color: #000; padding: 10px 18px; border-radius: 10px; font-weight: 800; cursor: pointer; border: none; font-size: 12px; }
        .btn-outline { background: transparent; border: 1px solid #333; color: #fff; padding: 10px 18px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 12px; }
        .btn-danger { background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.2); color: #ff4444; padding: 10px 18px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 12px; }

        .stat-card h1 { font-family: 'Bebas Neue', sans-serif; font-size: 3.5rem; color: #C9A84C; line-height: 1; margin-top: 5px; }

        /* --- Mobile Logic --- */
        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .overlay.show { display: block; }
          .desktop-only { display: none !important; }
          .mobile-header { display: flex !important; }
          .content-padding { padding: 20px !important; }
        }

        @media (max-width: 640px) {
          .card-flex { flex-direction: column; align-items: flex-start !important; gap: 15px; }
          .btn-group { width: 100%; display: flex; gap: 10px; }
          .btn-group button { flex: 1; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '40px 25px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ width: '35px', height: '35px', background: '#C9A84C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#000' }}>B</div>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '1px' }}>ADMIN SYSTEM</span>
          </div>

          <nav style={{ flex: 1 }}>
            <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => { setTab('overview'); setSidebarOpen(false); }}>📊 Dashboard Overview</button>
            <button className={`nav-item ${tab === 'listings' ? 'active' : ''}`} onClick={() => { setTab('listings'); setSidebarOpen(false); }}>🏠 Property Control</button>
            <button className={`nav-item ${tab === 'agents' ? 'active' : ''}`} onClick={() => { setTab('agents'); setSidebarOpen(false); }}>👥 Agent Management</button>
          </nav>

          <button onClick={handleSignOut} className="nav-item" style={{ color: '#ff4444', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>🚪 TERMINATE SESSION</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <header style={{ 
          height: '80px', background: 'rgba(12,12,20,0.5)', backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', 
          alignItems: 'center', padding: '0 40px', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100
        }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', width: '42px', height: '42px', color: '#fff', fontSize: '20px', cursor: 'pointer' }} onClick={() => setSidebarOpen(true)}>☰</button>
            <h2 style={{ fontSize: '18px', fontFamily: 'Bebas Neue', letterSpacing: '1px', textTransform: 'uppercase' }}>{tab}</h2>
          </div>
          <div style={{ background: '#EF4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '20px' }}>SUPER ADMIN</div>
        </header>

        <div className="content-padding" style={{ padding: '40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '100px', color: '#444' }}>Synchronizing platform data...</div>
          ) : (
            <>
              {/* --- OVERVIEW --- */}
              {tab === 'overview' && (
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                  <div className="card stat-card">
                    <p style={{ color: '#555', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>TOTAL LIVE LISTINGS</p>
                    <h1>{listings.length}</h1>
                  </div>
                  <div className="card stat-card">
                    <p style={{ color: '#555', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>REGISTERED AGENTS</p>
                    <h1>{agents.length}</h1>
                  </div>
                </div>
              )}

              {/* --- LISTINGS CONTROL --- */}
              {tab === 'listings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {listings.map(l => (
                    <div key={l.id} className="card card-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#fff', textTransform: 'capitalize', fontSize: '18px', marginBottom: '4px' }}>{l.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#555' }}>
                            <span>👤 {l.profiles?.full_name?.toUpperCase()}</span>
                            <span style={{ color: l.listing_status === 'active' ? '#4ade80' : '#F59E0B', fontWeight: 'bold' }}>● {l.listing_status.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="btn-group">
                        {l.listing_status !== 'active' && (
                          <button onClick={() => updateListingStatus(l.id, 'active')} className="btn-gold">APPROVE</button>
                        )}
                        <button onClick={() => deleteProperty(l.id)} className="btn-danger">DELETE</button>
                      </div>
                    </div>
                  ))}
                  {listings.length === 0 && <p style={{ color: '#444', textAlign: 'center' }}>Database connection active. No properties found.</p>}
                </div>
              )}

              {/* --- AGENT MANAGEMENT --- */}
              {tab === 'agents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {agents.map(a => (
                     <div key={a.id} className="card card-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                           <h4 style={{ color: '#fff', fontSize: '18px' }}>{a.full_name} {a.is_verified ? '✅' : ''}</h4>
                           <p style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>{a.email} | {a.agency_name || 'Independent'}</p>
                        </div>
                        <div className="btn-group">
                          <button 
                            onClick={() => toggleVerification(a.id, a.is_verified)}
                            className="btn-outline"
                            style={{ color: a.is_verified ? '#888' : '#C9A84C', borderColor: a.is_verified ? '#222' : '#C9A84C' }}
                          >
                            {a.is_verified ? 'UNVERIFY' : 'VERIFY AGENT'}
                          </button>
                          <button onClick={() => deleteAgent(a.id)} className="btn-danger">REMOVE</button>
                        </div>
                     </div>
                   ))}
                   {agents.length === 0 && <p style={{ color: '#444', textAlign: 'center' }}>No agents registered in system.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Notification Toast */}
      {toast && (
        <div style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
          background: '#C9A84C', color: '#000', padding: '15px 30px', 
          borderRadius: '50px', fontWeight: '900', zIndex: 2000, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '2px solid #fff',
          fontSize: '13px', letterSpacing: '0.5px'
        }}>
          {toast.toUpperCase()}
        </div>
      )}
    </>
  )
}