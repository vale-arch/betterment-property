'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ 
    full_name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirm: '', 
    role: 'buyer', 
    agency_name: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleRegister = async () => {
    if (!form.full_name || !form.email || !form.password) { 
        setError('Please fill in all required fields.')
        return 
    }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.role === 'agent' && !form.agency_name) { setError('Please enter your agency or business name.'); return }

    setLoading(true); setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: form.role,
          phone: form.phone,
          agency_name: form.agency_name,
        }
      }
    })

    if (err) { 
        setError(err.message)
        setLoading(false)
        return 
    }

    // Crucial for clearing cache and showing logged-in state immediately
    router.refresh() 
    
    router.push(`/auth/welcome?role=${form.role}&name=${encodeURIComponent(form.full_name)}&new=true`)
  }

   const handleGoogleRegister = async () => {
  // We append the role to the callback URL so the server knows what it is later
  const callbackUrl = `${window.location.origin}/auth/callback?role=${form.role}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  })
  
  if (error) alert(error.message)
}

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
            font-family: 'Outfit', sans-serif; 
            background: #0c0c0c; 
            color: #fff; 
            min-height: 100vh; 
        }

        /* --- Animations --- */
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }

        /* --- Layout Containers --- */
        .auth-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 100vh;
            width: 100%;
        }

        .branding-section {
            background: linear-gradient(160deg,#1a1200,#0c0c0c);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 48px;
        }

        .form-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px 80px;
            background: #0f0f0f;
            overflow-y: auto;
            animation: fadeUp 0.7s ease both;
        }

        .form-wrapper {
            maxWidth: 440px;
            width: 100%;
            margin: 0 auto;
        }

        /* --- Inputs & UI --- */
        .auth-input { 
            width:100%; 
            background:rgba(255,255,255,0.06); 
            border:1.5px solid rgba(255,255,255,0.1); 
            border-radius:12px; 
            padding:14px 16px; 
            color:#fff; 
            font-family:'Outfit',sans-serif; 
            font-size:15px; 
            transition:all 0.2s; 
        }
        .auth-input:focus { outline:none; border-color:#C9A84C; background:rgba(255,255,255,0.08); }
        
        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        
        .role-card { 
            border-radius:14px; 
            border:2px solid rgba(255,255,255,0.08); 
            padding:18px 20px; 
            cursor:pointer; 
            transition:all 0.25s; 
            background:rgba(255,255,255,0.03); 
            display:flex; 
            align-items:center; 
            gap:14px; 
        }
        .role-card.active { border-color:#C9A84C; background:rgba(201,168,76,0.08); }

        .btn-gold { 
            background:#C9A84C; 
            color:#0c0c0c; 
            border:none; 
            border-radius:12px; 
            padding:15px; 
            width:100%; 
            font-weight:700; 
            cursor:pointer; 
            transition:all 0.25s; 
        }
        .btn-gold:hover { background:#E8C97A; transform:translateY(-2px); }

        .label { color:rgba(255,255,255,0.5); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; display:block; }

        .responsive-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 1024px) {
            .form-section { padding: 48px 40px; }
        }

        @media (max-width: 850px) {
            .auth-container {
                grid-template-columns: 1fr; /* Stack vertically */
            }
            .branding-section {
                padding: 40px 24px;
                min-height: 350px;
                justify-content: flex-start;
                gap: 40px;
            }
            .form-section {
                padding: 40px 20px;
            }
            .responsive-grid {
                grid-template-columns: 1fr; /* Stack inputs */
            }
            .bg-text { display: none; } /* Hide large back text on mobile */
        }
      `}</style>

      <div className="auth-container">

        {/* Left — Branding */}
        <div className="branding-section">
          {/* Background Image/Overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(26,18,0,0.95),rgba(12,12,12,0.85))' }} />
          
          <div className="bg-text" style={{ position: 'absolute', bottom: '-20px', left: '-10px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '180px', color: 'rgba(255,255,255,0.025)', lineHeight: 1, pointerEvents: 'none', letterSpacing: '-0.03em', userSelect: 'none' }}>JOIN<br />US</div>

          {/* Logo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#0c0c0c', boxShadow: '0 0 24px rgba(201,168,76,0.5)' }}>B</div>
            <div>
              <div style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', letterSpacing: '0.02em' }}>Betterment Group</div>
              <div style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Property</div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#fff', lineHeight: 0.95, letterSpacing: '-0.01em', marginBottom: '16px' }}>
              Join Kenya's<br />Fastest<br />Growing<br />
              <span style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite', backgroundSize: '200% auto' }}>Property</span><br />Platform
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '15px', lineHeight: 1.75, maxWidth: '320px' }}>
                Secure your future with verified listings across all 47 counties.
            </p>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['✅ Free to join', '🏠 3,500+ listings', '⚡ Direct contact'].map(p => (
              <div key={p} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="form-section">
          <div className="form-wrapper">

            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.8rem', color: '#fff', marginBottom: '6px' }}>Create Account</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '32px' }}>
              Already have an account? <a href="/auth/login" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#FCA5A5', fontSize: '14px' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Role selector */}
            <div style={{ marginBottom: '24px' }}>
              <label className="label">I want to</label>
              <div className="role-grid">
                <div className={`role-card ${form.role === 'buyer' ? 'active' : ''}`} onClick={() => set('role', 'buyer')}>
                  <span style={{ fontSize: '22px' }}>🏠</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Buy/Rent</div>
                  </div>
                </div>
                <div className={`role-card ${form.role === 'agent' ? 'active' : ''}`} onClick={() => set('role', 'agent')}>
                  <span style={{ fontSize: '22px' }}>🏗️</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>List Property</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="responsive-grid">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="auth-input" placeholder="John Kamau" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="auth-input" placeholder="+254..." value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input className="auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>

              {form.role === 'agent' && (
                <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                  <label className="label">Agency Name *</label>
                  <input className="auth-input" placeholder="Kamau Properties Ltd" value={form.agency_name} onChange={e => set('agency_name', e.target.value)} />
                </div>
              )}

              <div className="responsive-grid">
                <div>
                  <label className="label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm *</label>
                  <input className="auth-input" type="password" placeholder="••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                </div>
              </div>
            </div>

            <button className="btn-gold" onClick={handleRegister} disabled={loading}>
              {loading ? 'Processing...' : `Create ${form.role === 'agent' ? 'Agent' : 'Buyer'} Account →`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}