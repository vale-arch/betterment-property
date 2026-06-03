'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

    router.refresh() 
    router.push(`/auth/welcome?role=${form.role}&name=${encodeURIComponent(form.full_name)}&new=true`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        :root {
          --terracotta: #A3432F;
          --gold: #C9A84C;
          --bone: #FDFCF9;
          --charcoal: #1A1A1A;
        }

        body { 
            font-family: 'Outfit', sans-serif; 
            background: var(--bone); 
            color: var(--charcoal); 
            min-height: 100vh; 
        }

        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }

        .auth-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 100vh;
            width: 100%;
        }

        .branding-section {
            background: linear-gradient(160deg, #F9F7F2 0%, #FFFFFF 100%);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px;
            border-right: 1px solid #EEE;
        }

        .form-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px 80px;
            background: #FFFFFF;
            overflow-y: auto;
            animation: fadeUp 0.7s ease both;
        }

        .form-wrapper {
            max-width: 460px;
            width: 100%;
            margin: 0 auto;
        }

        .auth-input { 
            width:100%; 
            background: #F9F9F9; 
            border:1.5px solid #EEE; 
            border-radius:14px; 
            padding:14px 16px; 
            color: var(--charcoal); 
            font-family:'Outfit',sans-serif; 
            font-size:15px; 
            transition:all 0.2s; 
        }
        .auth-input:focus { outline:none; border-color: var(--terracotta); background: #FFF; box-shadow: 0 0 0 4px rgba(163, 67, 47, 0.05); }
        
        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; }
        
        .role-card { 
            border-radius:16px; 
            border:1px solid #EEE; 
            padding:20px; 
            cursor:pointer; 
            transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            background: #FFF; 
            display:flex; 
            flex-direction: column;
            align-items: center; 
            text-align: center;
            gap:10px; 
        }
        .role-card:hover { border-color: var(--gold); transform: translateY(-2px); }
        .role-card.active { border-color: var(--terracotta); background: rgba(163, 67, 47, 0.03); transform: scale(1.02); }
        .role-card b { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }

        .btn-prime { 
            background: var(--terracotta); 
            color: #FFF; 
            border:none; 
            border-radius:100px; 
            padding:16px; 
            width:100%; 
            font-weight:700; 
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor:pointer; 
            transition:all 0.25s; 
            box-shadow: 0 10px 20px rgba(163, 67, 47, 0.2);
        }
        .btn-prime:hover { background:#8E3A26; transform:translateY(-2px); }

        .label { color: #999; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; display:block; }

        .responsive-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        @media (max-width: 850px) {
            .auth-container { grid-template-columns: 1fr; }
            .branding-section { min-height: auto; padding: 40px 24px; border-right: none; border-bottom: 1px solid #EEE; }
            .form-section { padding: 48px 20px; }
            .responsive-grid { grid-template-columns: 1fr; }
            .bg-text { display: none; }
        }
      `}</style>

      <div className="auth-container">

        {/* Left — Branding Panel */}
        <div className="branding-section">
          <div style={{ position: 'absolute', top: '-5%', left: '-5%', width: '300px', height: '300px', border: '2px solid var(--gold)', borderRadius: '100%', opacity: 0.05 }} />

          {/* Logo Component */}
          <Link href="/" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
             <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
                <path d="M20 55 C 20 20, 80 20, 80 55" stroke="#C9A84C" strokeWidth="3" fill="none" />
                <path d="M25 65 L40 50 L55 65 V80 H25 V65Z" fill="#A3432F" />
                <path d="M40 55 L55 40 L70 55 V80 H40 V55Z" fill="#A3432F" />
                <path d="M55 65 L65 55 L75 65 V80 H55 V65Z" fill="#A3432F" />
                <circle cx="50" cy="72" r="3" fill="#222" />
                <circle cx="45" cy="74" r="2.5" fill="#222" />
                <circle cx="55" cy="74" r="2.5" fill="#222" />
             </svg>
            <div>
              <div style={{ color: 'var(--charcoal)', fontFamily: 'Bebas Neue', fontSize: '1.8rem', lineHeight: 1 }}>Betterment Group</div>
              <div style={{ color: 'var(--gold)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 900 }}>Property</div>
            </div>
          </Link>

          <div style={{ position: 'relative', marginTop: '40px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(3rem, 5vw, 5rem)', color: 'var(--charcoal)', lineHeight: 0.95, letterSpacing: '-1px', marginBottom: '20px' }}>
              JOIN KENYA'S<br /><span style={{ color: 'var(--terracotta)' }}>MOST TRUSTED</span><br />PROPERTY HUB
            </h2>
            <p style={{ color: '#888', fontSize: '16px', lineHeight: 1.6, maxWidth: '350px', fontWeight: 500 }}>
                Start your journey with a verified account and access premium listings across the country.
            </p>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['✓ Verified Agent Network', '✓ High-Performance Listings', '✓ Direct Buyer Connection'].map(p => (
              <div key={p} style={{ color: '#666', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Right — Form Section */}
        <div className="form-section">
          <div className="form-wrapper">

            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', color: 'var(--charcoal)', marginBottom: '8px', lineHeight: 1 }}>Create Account</h1>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '32px', fontWeight: 500 }}>
              Already part of the group? <Link href="/auth/login" style={{ color: 'var(--terracotta)', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '25px', color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Role Selector */}
            <div style={{ marginBottom: '30px' }}>
              <label className="label">Your Main Goal</label>
              <div className="role-grid">
                <div className={`role-card ${form.role === 'buyer' ? 'active' : ''}`} onClick={() => set('role', 'buyer')}>
                  <span style={{ fontSize: '24px' }}>🏡</span>
                  <b>Browse & Buy</b>
                </div>
                <div className={`role-card ${form.role === 'agent' ? 'active' : ''}`} onClick={() => set('role', 'agent')}>
                  <span style={{ fontSize: '24px' }}>🏗️</span>
                  <b>List & Sell</b>
                </div>
              </div>
            </div>

            {/* Registration Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
              <div className="responsive-grid">
                <div>
                  <label className="label">Full Legal Name *</label>
                  <input className="auth-input" placeholder="e.g. John Kamau" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="auth-input" placeholder="254..." value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input className="auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>

              {form.role === 'agent' && (
                <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                  <label className="label">Agency / Brand Name *</label>
                  <input className="auth-input" placeholder="e.g. Savannah Real Estate" value={form.agency_name} onChange={e => set('agency_name', e.target.value)} />
                </div>
              )}

              <div className="responsive-grid">
                <div>
                  <label className="label">Create Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#AAA', cursor: 'pointer', fontSize: '18px' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input className="auth-input" type="password" placeholder="••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                </div>
              </div>
            </div>

            <button className="btn-prime" onClick={handleRegister} disabled={loading}>
              {loading ? 'PROCESSING...' : `START AS ${form.role.toUpperCase()} →`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}