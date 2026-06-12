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
      setToast("Listing deleted successfully")
      setListings(prev => prev.filter(l => l.id !== id))
    }
  }

  const deleteAgent = async (id: string) => {
    if (!confirm("Warning: This deletes the agent and all their properties. Proceed?")) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (!error) {
      setToast("Agent removed from system")
      setAgents(prev => prev.filter(a => a.id !== id))
      fetchData()
    }
  }

  const updateListingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('properties').update({ listing_status: status }).eq('id', id)
    if (!error) {
      setToast(`Listing set to ${status.toUpperCase()}`)
      fetchData()
    }
  }

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', id)
    if (!error) {
      setToast(!currentStatus ? "Agent Verified" : "Verification Revoked")
      fetchData()
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600;700;800&display=swap');
        
        :root {
          --violet-deep: #2D004F;
          --violet-accent: #7B2CBF;
          --arctic: #F8F9FA;
          --midnight: #1B1464;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: var(--arctic); color: var(--midnight); }

        /* --- Sidebar & Layout --- */
        .sidebar { 
          width: 280px; background: white; border-right: 1px solid #E5E7EB; 
          position: fixed; height: 100vh; z-index: 1000; 
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .main-content { margin-left: 280px; min-height: 100vh; background: var(--arctic); transition: 0.4s; }
        
        .overlay { position: fixed; inset: 0; background: rgba(45, 0, 79, 0.1); backdrop-filter: blur(4px); z-index: 950; display: none; }
        
        .nav-item { 
          display:flex; align-items:center; gap:14px; padding:16px 20px; 
          border-radius:12px; cursor:pointer; color: #6B7280; 
          background:transparent; border:none; width:100%; text-align:left; 
          font-family:inherit; transition: 0.2s; margin-bottom: 5px; font-weight: 600; font-size: 14px;
        }
        .nav-item:hover { background: #F3F4F6; color: var(--violet-deep); }
        .nav-item.active { background: #F5EFFF; color: var(--violet-accent); }

        /* --- UI Components --- */
        .card { 
          background: white; border: 1px solid #E5E7EB; 
          border-radius: 16px; padding: 30px; margin-bottom: 20px; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
        }

        .btn-violet { 
          background: var(--violet-deep); color: #FFF; padding: 12px 24px; border-radius: 8px; 
          font-weight: 700; cursor: pointer; border: none; font-size: 11px; 
          text-transform: uppercase; letter-spacing: 0.5px; transition: 0.3s; 
        }
        .btn-violet:hover { background: var(--violet-accent); transform: translateY(-1px); }

        .btn-outline { 
          background: transparent; border: 1px solid #E5E7EB; color: #4B5563; 
          padding: 10px 20px; border-radius: 8px; font-weight: 700; 
          cursor: pointer; font-size: 11px; transition: 0.2s; 
        }
        .btn-outline:hover { border-color: var(--violet-accent); color: var(--violet-accent); }

        .btn-danger { 
          background: #FFF; border: 1px solid #EF4444; color: #EF4444; 
          padding: 10px 20px; border-radius: 8px; font-weight: 800; 
          cursor: pointer; font-size: 11px; transition: 0.2s; 
        }
        .btn-danger:hover { background: #EF4444; color: #FFF; }

        .stat-card h1 { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; color: var(--violet-deep); line-height: 1; margin-top: 10px; }
        .stat-label { color: #9CA3AF; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

        .badge { font-size: 10px; font-weight: 800; padding: 5px 12px; border-radius: 6px; text-transform: uppercase; }

        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .overlay.show { display: block; }
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '35px 25px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '45px' }}>
            <img src="/images/logo.jpg" alt="Logo" style={{ width: '45px', height: 'auto', borderRadius: '6px' }} />
            <div>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--violet-deep)', display: 'block', lineHeight: 1 }}>ADMIN</span>
                <span style={{ color: 'var(--violet-accent)', fontSize: '7px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Betterment Cloud</span>
            </div>
          </Link>

          <nav style={{ flex: 1 }}>
            <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => { setTab('overview'); setSidebarOpen(false); }}>📊 System Overview</button>
            <button className={`nav-item ${tab === 'listings' ? 'active' : ''}`} onClick={() => { setTab('listings'); setSidebarOpen(false); }}>🏠 Manage Properties</button>
            <button className={`nav-item ${tab === 'agents' ? 'active' : ''}`} onClick={() => { setTab('agents'); setSidebarOpen(false); }}>👥 Verify Agents</button>
            <Link href="/" className="nav-item" style={{ textDecoration: 'none', borderTop: '1px solid #F3F4F6', marginTop: '20px', paddingTop: '20px' }}>
              <span>🌐</span> <span>View Website</span>
            </Link>
          </nav>

          <button onClick={handleSignOut} className="nav-item" style={{ color: '#EF4444', fontWeight: '700' }}>🚪 Terminate Session</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <header style={{ 
          height: '75px', background: 'white', borderBottom: '1px solid #E5E7EB', 
          display: 'flex', alignItems: 'center', padding: '0 30px', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', width: '38px', height: '38px', color: 'var(--violet-deep)', fontSize: '18px', cursor: 'pointer' }} onClick={() => setSidebarOpen(true)}>☰</button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--violet-deep)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab}</h2>
          </div>
          <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '10px', fontWeight: '900', padding: '6px 16px', borderRadius: '8px', letterSpacing: '1px' }}>ROOT ACCESS</div>
        </header>

        <div style={{ padding: '30px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '100px', color: '#9CA3AF', fontWeight: '600' }}>Synchronizing Global Database...</div>
          ) : (
            <>
              {/* --- OVERVIEW --- */}
              {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                  <div className="card" style={{ borderLeft: '5px solid var(--violet-accent)' }}>
                    <p className="stat-label">Global Listings</p>
                    <h1>{listings.length}</h1>
                  </div>
                  <div className="card" style={{ borderLeft: '5px solid var(--violet-deep)' }}>
                    <p className="stat-label">Registered Agents</p>
                    <h1>{agents.length}</h1>
                  </div>
                </div>
              )}

              {/* --- LISTINGS CONTROL --- */}
              {tab === 'listings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {listings.map(l => (
                    <div key={l.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: 'var(--midnight)', fontSize: '1.1rem', fontWeight: '800' }}>{l.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700' }}>AGENT: {l.profiles?.full_name?.toUpperCase()}</span>
                            <span className="badge" style={{ 
                                background: l.listing_status === 'active' ? '#DCFCE7' : '#FEF3C7',
                                color: l.listing_status === 'active' ? '#166534' : '#92400E'
                            }}>● {l.listing_status}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {l.listing_status !== 'active' && (
                          <button onClick={() => updateListingStatus(l.id, 'active')} className="btn-violet" style={{ background: '#10B981' }}>APPROVE</button>
                        )}
                        <button onClick={() => deleteProperty(l.id)} className="btn-danger">DELETE</button>
                      </div>
                    </div>
                  ))}
                  {listings.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px' }}>No property data available.</p>}
                </div>
              )}

              {/* --- AGENT MANAGEMENT --- */}
              {tab === 'agents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {agents.map(a => (
                     <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                           <h4 style={{ color: 'var(--midnight)', fontSize: '1.1rem', fontWeight: '800' }}>{a.full_name} {a.is_verified ? '💠' : ''}</h4>
                           <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{a.email} • {a.agency_name || 'Independent Consultant'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => toggleVerification(a.id, a.is_verified)}
                            className="btn-outline"
                            style={{ 
                                background: a.is_verified ? 'transparent' : '#F5EFFF',
                                borderColor: a.is_verified ? '#E5E7EB' : 'var(--violet-accent)' 
                            }}
                          >
                            {a.is_verified ? 'REVOKE STATUS' : 'VERIFY AGENT'}
                          </button>
                          <button onClick={() => deleteAgent(a.id)} className="btn-danger">REMOVE</button>
                        </div>
                     </div>
                   ))}
                   {agents.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px' }}>No agent records found.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Corporate Notification */}
      {toast && (
        <div style={{ 
          position: 'fixed', top: '25px', right: '25px', 
          background: 'var(--violet-deep)', color: '#FFF', padding: '15px 30px', 
          borderRadius: '12px', fontWeight: '700', zIndex: 2000, 
          boxShadow: '0 20px 40px rgba(45, 0, 79, 0.2)',
          fontSize: '12px', borderLeft: '5px solid var(--violet-accent)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.toUpperCase()}
        </div>
      )}
    </>
  )
}