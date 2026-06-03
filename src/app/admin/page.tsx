'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
          width: 280px; background: white; border-right: 1px solid #EEE; 
          position: fixed; height: 100vh; z-index: 1000; 
          transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1); 
        }
        .main-content { margin-left: 280px; min-height: 100vh; background: var(--bone); transition: 0.4s; }
        
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(4px); z-index: 950; display: none; }
        
        .nav-item { 
          display:flex; align-items:center; gap:14px; padding:16px 20px; 
          border-radius:14px; cursor:pointer; color: #666; 
          background:transparent; border:none; width:100%; text-align:left; 
          font-family:inherit; transition: 0.2s; margin-bottom: 5px; font-weight: 600;
        }
        .nav-item:hover { background: #F5F5F5; color: var(--terracotta); }
        .nav-item.active { background: rgba(163, 67, 47, 0.08); color: var(--terracotta); }

        /* --- UI Components --- */
        .card { 
          background: white; border: 1px solid #EEE; 
          border-radius: 24px; padding: 30px; margin-bottom: 20px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }

        .btn-terracotta { background: var(--terracotta); color: #FFF; padding: 10px 18px; border-radius: 100px; font-weight: 700; cursor: pointer; border: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.3s; }
        .btn-terracotta:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(163, 67, 47, 0.2); }

        .btn-outline { background: transparent; border: 1px solid #EEE; color: #666; padding: 10px 18px; border-radius: 100px; font-weight: 700; cursor: pointer; font-size: 11px; transition: 0.2s; }
        .btn-outline:hover { border-color: var(--gold); color: var(--gold); }

        .btn-danger { background: #FFF; border: 1px solid #FF4444; color: #FF4444; padding: 10px 18px; border-radius: 100px; font-weight: 800; cursor: pointer; font-size: 11px; transition: 0.2s; }
        .btn-danger:hover { background: #FF4444; color: #FFF; }

        .stat-card h1 { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; color: var(--terracotta); line-height: 1; margin-top: 10px; }
        .stat-label { color: #999; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }

        /* --- Mobile Logic --- */
        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .overlay.show { display: block; }
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
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: '35px', height: '35px', background: 'var(--terracotta)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>B</div>
            <div>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', letterSpacing: '1px', color: 'var(--charcoal)', display: 'block', lineHeight: 1 }}>ADMIN PANEL</span>
                <span style={{ color: 'var(--gold)', fontSize: '8px', fontWeight: '900', letterSpacing: '1px' }}>BETTERMENT GROUP</span>
            </div>
          </Link>

          <nav style={{ flex: 1 }}>
            <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => { setTab('overview'); setSidebarOpen(false); }}>📊 System Overview</button>
            <button className={`nav-item ${tab === 'listings' ? 'active' : ''}`} onClick={() => { setTab('listings'); setSidebarOpen(false); }}>🏠 Manage Properties</button>
            <button className={`nav-item ${tab === 'agents' ? 'active' : ''}`} onClick={() => { setTab('agents'); setSidebarOpen(false); }}>👥 Verify Agents</button>
            <Link href="/" className="nav-item" style={{ textDecoration: 'none', borderTop: '1px solid #EEE', marginTop: '20px', paddingTop: '20px' }}>
              <span>🌐</span> <span>View Website</span>
            </Link>
          </nav>

          <button onClick={handleSignOut} className="nav-item" style={{ color: '#ff4444' }}>🚪 Close Session</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <header style={{ 
          height: '80px', background: 'white', borderBottom: '1px solid #EEE', 
          display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100
        }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={{ background: '#F5F5F5', border: '1px solid #EEE', borderRadius: '10px', width: '42px', height: '42px', color: '#333', fontSize: '20px', cursor: 'pointer' }} onClick={() => setSidebarOpen(true)}>☰</button>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'Bebas Neue', letterSpacing: '1px', color: 'var(--terracotta)' }}>{tab.toUpperCase()}</h2>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontSize: '10px', fontWeight: '900', padding: '6px 14px', borderRadius: '100px', letterSpacing: '1px' }}>SYSTEM SUPERUSER</div>
        </header>

        <div className="content-padding" style={{ padding: '40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '100px', color: '#999', fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>Syncing Database...</div>
          ) : (
            <>
              {/* --- OVERVIEW --- */}
              {tab === 'overview' && (
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                  <div className="card">
                    <p className="stat-label">PLATFORM LISTINGS</p>
                    <h1>{listings.length}</h1>
                  </div>
                  <div className="card">
                    <p className="stat-label">TOTAL AGENTS</p>
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
                        <h4 style={{ color: 'var(--charcoal)', textTransform: 'capitalize', fontSize: '1.2rem', marginBottom: '5px', fontWeight: '700' }}>{l.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#999' }}>
                            <span style={{ fontWeight: '700' }}>AGENT: {l.profiles?.full_name?.toUpperCase()}</span>
                            <span style={{ color: l.listing_status === 'active' ? '#22C55E' : '#F59E0B', fontWeight: '900' }}>● {l.listing_status.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                        {l.listing_status !== 'active' && (
                          <button onClick={() => updateListingStatus(l.id, 'active')} className="btn-terracotta" style={{ background: '#22C55E' }}>APPROVE</button>
                        )}
                        <button onClick={() => deleteProperty(l.id)} className="btn-danger">DELETE</button>
                      </div>
                    </div>
                  ))}
                  {listings.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>No property data found.</p>}
                </div>
              )}

              {/* --- AGENT MANAGEMENT --- */}
              {tab === 'agents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {agents.map(a => (
                     <div key={a.id} className="card card-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                           <h4 style={{ color: 'var(--charcoal)', fontSize: '1.2rem', fontWeight: '700' }}>{a.full_name} {a.is_verified ? '✅' : ''}</h4>
                           <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{a.email} | {a.agency_name || 'Independent'}</p>
                        </div>
                        <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => toggleVerification(a.id, a.is_verified)}
                            className="btn-outline"
                            style={{ 
                                background: a.is_verified ? 'transparent' : 'rgba(201, 168, 76, 0.05)',
                                borderColor: a.is_verified ? '#EEE' : 'var(--gold)' 
                            }}
                          >
                            {a.is_verified ? 'UNVERIFY' : 'VERIFY AGENT'}
                          </button>
                          <button onClick={() => deleteAgent(a.id)} className="btn-danger">REMOVE</button>
                        </div>
                     </div>
                   ))}
                   {agents.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>No agents found in system.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Luxury Notification */}
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