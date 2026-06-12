'use client'

import { useState, useEffect } from 'react'
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
        setError('Please enter your email and password.')
        return 
    }
    setLoading(true); setError('')

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) { 
        setError("We couldn't find an account with those details.")
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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        :root {
          --violet-deep: #2D004F;
          --violet-accent: #7B2CBF;
          --arctic: #F8F9FA;
          --midnight: #1B1464;
        }

        body { 
            font-family: 'Inter', sans-serif; 
            background: var(--arctic); 
            color: var(--midnight); 
            min-height: 100vh; 
        }

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        .auth-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 100vh;
            width: 100%;
        }

        .branding-section {
            background: linear-gradient(160deg, #2D004F 0%, #1B1464 100%);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px;
        }

        .form-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 64px 80px;
            background: #FFFFFF;
            animation: fadeUp 0.6s ease-out both;
        }

        .form-wrapper {
            max-width: 420px;
            width: 100%;
            margin: 0 auto;
        }

        .auth-input { 
            width:100%; 
            background: #F9F9FB; 
            border: 1.5px solid #E5E7EB; 
            border-radius: 12px; 
            padding: 14px 16px; 
            color: var(--midnight); 
            font-family: inherit; 
            font-size: 15px; 
            font-weight: 500;
            transition: all 0.2s; 
        }
        .auth-input:focus { outline:none; border-color: var(--violet-accent); background: #FFF; box-shadow: 0 0 0 4px rgba(123, 44, 191, 0.05); }

        .btn-prime { 
            background: var(--violet-deep); 
            color: #FFF; 
            border:none; 
            border-radius:12px; 
            padding:18px; 
            width:100%; 
            font-weight:800; 
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor:pointer; 
            transition:all 0.25s; 
            box-shadow: 0 10px 25px rgba(45, 0, 79, 0.2);
        }
        .btn-prime:hover { background: var(--violet-accent); transform:translateY(-2px); }

        .social-btn { 
            display:flex; 
            align-items:center; 
            justify-content:center; 
            gap:12px; 
            width:100%; 
            background: #FFF; 
            border: 1.5px solid #E5E7EB; 
            border-radius:12px; 
            padding:14px; 
            color: var(--midnight); 
            font-size:14px; 
            font-weight: 700;
            cursor:pointer; 
            transition:all 0.2s; 
        }
        .social-btn:hover { background: #F9FAFB; border-color: #D1D5DB; }

        .divider { display:flex; align-items:center; gap:14px; margin: 30px 0; }
        .divider::before, .divider::after { content:''; flex:1; height:1px; background: #E5E7EB; }

        .label { 
            color: #6B7280; 
            font-size: 10px; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            margin-bottom: 8px; 
            display: block; 
        }

        @media (max-width: 900px) {
            .auth-container { grid-template-columns: 1fr; }
            .branding-section { min-height: 400px; padding: 40px 24px; }
            .form-section { padding: 48px 24px; border-radius: 30px 30px 0 0; margin-top: -30px; position: relative; z-index: 10; }
        }
      `}</style>

      <div className="auth-container">

        {/* Left — Branding panel (Friendly Luxury) */}
        <div className="branding-section">
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '100%' }} />

          <Link href="/" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
             <img src="/images/logo.jpg" alt="Logo" style={{ width: '55px', height: 'auto', borderRadius: '8px' }} />
            <div>
              <div style={{ color: '#FFF', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1, letterSpacing: '-0.5px' }}>BETTERMENT</div>
              <div style={{ color: 'var(--violet-accent)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>Group Properties</div>
            </div>
          </Link>

          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(3.5rem,6vw,5.5rem)', color: '#FFF', lineHeight: 0.85, letterSpacing: '-1px', marginBottom: '25px' }}>
              FIND YOUR<br /><span style={{ color: 'var(--violet-accent)' }}>NEXT SPACE</span><br />WITH US
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', lineHeight: 1.7, maxWidth: '400px', fontWeight: 400 }}>
                Welcome back! Sign in to keep track of your favorite homes or manage your beautiful listings across Kenya.
            </p>
          </div>

          <div style={{ position: 'relative', display: 'flex', gap: '50px' }}>
            <div>
                <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#FFF', lineHeight: 1 }}>3,500+</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Dream Homes</div>
            </div>
            <div>
                <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#FFF', lineHeight: 1 }}>100%</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Verified Properties</div>
            </div>
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="form-section">
          <div className="form-wrapper">

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--midnight)', marginBottom: '8px', letterSpacing: '-1px' }}>Welcome Back</h1>
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '40px', fontWeight: 500 }}>
              Nice to see you again. <Link href="/auth/register" style={{ color: 'var(--violet-accent)', textDecoration: 'none', fontWeight: 700 }}>Not a member yet?</Link>
            </p>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '16px', marginBottom: '25px', color: '#B91C1C', fontSize: '14px', fontWeight: 600 }}>
                Oops! {error}
              </div>
            )}

            <button className="social-btn" onClick={handleGoogleLogin} type="button">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg> 
              Sign in with Google
            </button>

            <div className="divider">
              <span style={{ color: '#D1D5DB', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                OR USE YOUR EMAIL
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
              <div>
                <label className="label">Email Address</label>
                <input className="auth-input" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '18px' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '35px' }}>
              <Link href="/auth/forgot-password" style={{ color: '#9CA3AF', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Forgot your details?</Link>
            </div>

            <button className="btn-prime" onClick={handleLogin} disabled={loading}>
              {loading ? 'Just a second...' : 'Take me to my dashboard'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}