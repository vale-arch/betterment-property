'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { 
        setError('Please fill in all fields.')
        return 
    }
    setLoading(true); setError('')

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) { 
        setError(err.message)
        setLoading(false)
        return 
    }

    // Refresh ensures the middleware and header recognize the new session immediately
    router.refresh()

    // Get profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    // Always go to welcome screen — it redirects based on role
    router.push(`/auth/welcome?role=${profile?.role || 'buyer'}&name=${encodeURIComponent(profile?.full_name || '')}`)
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
            background: linear-gradient(160deg, #1a1200 0%, #0c0c0c 100%);
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
            padding: 64px 80px;
            background: #0f0f0f;
            animation: fadeUp 0.7s ease both;
        }

        .form-wrapper {
            max-width: 420px;
            width: 100%;
            margin: 0 auto;
        }

        /* --- UI Elements --- */
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
        .btn-gold:hover { background:#E8C97A; transform:translateY(-2px); box-shadow:0 12px 30px rgba(201,168,76,0.4); }

        .social-btn { 
            display:flex; 
            align-items:center; 
            justify-content:center; 
            gap:10px; 
            width:100%; 
            background:rgba(255,255,255,0.05); 
            border:1.5px solid rgba(255,255,255,0.1); 
            border-radius:12px; 
            padding:13px; 
            color:rgba(255,255,255,0.8); 
            font-size:14px; 
            cursor:pointer; 
            transition:all 0.2s; 
        }

        .divider { display:flex; align-items:center; gap:14px; margin: 24px 0; }
        .divider::before, .divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.08); }

        .label { 
            color: 'rgba(255,255,255,0.5)'; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
            margin-bottom: 8px; 
            display: block; 
        }

        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 1024px) {
            .form-section { padding: 48px 40px; }
        }

        @media (max-width: 850px) {
            .auth-container {
                grid-template-columns: 1fr;
            }
            .branding-section {
                padding: 40px 24px;
                min-height: 380px;
                justify-content: flex-start;
                gap: 50px;
            }
            .form-section {
                padding: 48px 20px;
            }
            .bg-text { display: none; }
        }
      `}</style>

      <div className="auth-container">

        {/* Left — Branding panel */}
        <div className="branding-section">
          {/* Background photo */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(26,18,0,0.95) 0%, rgba(12,12,12,0.85) 100%)' }} />

          {/* Big background text */}
          <div className="bg-text" style={{ position: 'absolute', bottom: '-20px', left: '-10px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '180px', color: 'rgba(255,255,255,0.025)', lineHeight: 1, pointerEvents: 'none', letterSpacing: '-0.03em', userSelect: 'none' }}>PROP<br />ERTY</div>

          {/* Logo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#0c0c0c', boxShadow: '0 0 24px rgba(201,168,76,0.5)' }}>B</div>
            <div>
              <div style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', letterSpacing: '0.02em' }}>Betterment Group</div>
              <div style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Property</div>
            </div>
          </div>

          {/* Middle text */}
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#fff', lineHeight: 0.95, letterSpacing: '-0.01em', marginBottom: '16px' }}>
              Welcome<br />Back to<br /><span style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite', backgroundSize: '200% auto' }}>Kenya's #1</span><br />Property<br />Platform
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', lineHeight: 1.75, maxWidth: '300px' }}>Join over 1,200 agents across all 47 counties.</p>
          </div>

          {/* Stats */}
          <div style={{ position: 'relative', display: 'flex', gap: '24px' }}>
            {[{ v: '3,500+', l: 'Listings' }, { v: '1,200+', l: 'Agents' }].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.8rem', color: '#C9A84C', lineHeight: 1 }}>{s.v}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="form-section">
          <div className="form-wrapper">

            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.8rem', color: '#fff', marginBottom: '6px' }}>Sign In</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '36px' }}>
              Don't have an account? <a href="/auth/register" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Sign up</a>
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#FCA5A5', fontSize: '14px' }}>
                ⚠️ {error}
              </div>
            )}

            <button className="social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div className="divider">
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>OR USE EMAIL</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label className="label" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email Address</label>
                <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div>
                <label className="label" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '28px' }}>
              <a href="/auth/forgot-password" style={{ color: '#C9A84C', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
            </div>

            <button className="btn-gold" onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}