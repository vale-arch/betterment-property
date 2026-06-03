'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

    router.refresh()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    router.push(`/auth/welcome?role=${profile?.role || 'buyer'}&name=${encodeURIComponent(profile?.full_name || '')}`)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) alert(error.message)
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
            padding: 64px 80px;
            background: #FFFFFF;
            animation: fadeUp 0.7s ease both;
        }

        .form-wrapper {
            max-width: 420px;
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

        .social-btn { 
            display:flex; 
            align-items:center; 
            justify-content:center; 
            gap:10px; 
            width:100%; 
            background: #FFF; 
            border:1.5px solid #EEE; 
            border-radius:100px; 
            padding:13px; 
            color: var(--charcoal); 
            font-size:14px; 
            font-weight: 600;
            cursor:pointer; 
            transition:all 0.2s; 
        }
        .social-btn:hover { background: #F9F9F9; border-color: #DDD; }

        .divider { display:flex; align-items:center; gap:14px; margin: 24px 0; }
        .divider::before, .divider::after { content:''; flex:1; height:1px; background: #EEE; }

        .label { 
            color: #999; 
            font-size: 10px; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            margin-bottom: 8px; 
            display: block; 
        }

        @media (max-width: 850px) {
            .auth-container { grid-template-columns: 1fr; }
            .branding-section { min-height: auto; padding: 40px 24px; border-right: none; border-bottom: 1px solid #EEE; }
            .form-section { padding: 48px 24px; }
            .bg-text { display: none; }
        }
      `}</style>

      <div className="auth-container">

        {/* Left — Branding panel */}
        <div className="branding-section">
          {/* Decorative Logo Arc Overlay */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', border: '2px solid var(--gold)', borderRadius: '100%', opacity: 0.05 }} />

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

          {/* Middle text */}
          <div style={{ position: 'relative', marginTop: '40px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(3rem,5vw,5rem)', color: 'var(--charcoal)', lineHeight: 0.9, letterSpacing: '-1px', marginBottom: '20px' }}>
              ACCESS YOUR<br /><span style={{ color: 'var(--terracotta)' }}>PREMIUM</span><br />DASHBOARD
            </h2>
            <p style={{ color: '#888', fontSize: '16px', lineHeight: 1.6, maxWidth: '350px', fontWeight: 500 }}>
                Manage verified listings and connect with serious property seekers across Kenya.
            </p>
          </div>

          {/* Stats Bar */}
          <div style={{ position: 'relative', display: 'flex', gap: '40px', marginTop: '40px' }}>
            <div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--gold)', lineHeight: 1 }}>3,500+</div>
                <div style={{ color: '#999', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Listings</div>
            </div>
            <div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--gold)', lineHeight: 1 }}>100%</div>
                <div style={{ color: '#999', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Area</div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="form-section">
          <div className="form-wrapper">

            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', color: 'var(--charcoal)', marginBottom: '8px', lineHeight: 1 }}>Sign In</h1>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '40px', fontWeight: 500 }}>
              Don't have an account? <Link href="/auth/register" style={{ color: 'var(--terracotta)', textDecoration: 'none', fontWeight: 700 }}>Join as Agent</Link>
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '25px', color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Google Login */}
            <button className="social-btn" onClick={handleGoogleLogin} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg> 
              Continue with Google
            </button>

            <div className="divider">
              <span style={{ color: '#CCC', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                OR EMAIL ACCESS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' }}>
              <div>
                <label className="label">Email Address</label>
                <input className="auth-input" type="email" placeholder="agent@betterment.co.ke" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div>
                <label className="label">Secure Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#AAA', cursor: 'pointer', fontSize: '18px' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '30px' }}>
              <Link href="/auth/forgot-password" style={{ color: '#AAA', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
            </div>

            <button className="btn-prime" onClick={handleLogin} disabled={loading}>
              {loading ? 'PROCESSING...' : 'SIGN IN TO DASHBOARD'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}