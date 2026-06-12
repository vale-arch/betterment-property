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
        setError('Please let us know your name, email, and a password.')
        return 
    }
    if (form.password !== form.confirm) { setError('The passwords you typed do not match.'); return }
    if (form.password.length < 6) { setError('Please choose a password with at least 6 characters.'); return }
    if (form.role === 'agent' && !form.agency_name) { setError('Please tell us the name of your agency.'); return }

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
            padding: 60px 80px;
            background: #FFFFFF;
            overflow-y: auto;
            animation: fadeUp 0.6s ease-out both;
        }

        .form-wrapper {
            max-width: 460px;
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
            font-size: 14px; 
            font-weight: 500;
            transition: all 0.2s; 
        }
        .auth-input:focus { outline:none; border-color: var(--violet-accent); background: #FFF; box-shadow: 0 0 0 4px rgba(123, 44, 191, 0.05); }
        
        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
        
        .role-card { 
            border-radius:12px; 
            border:1.5px solid #E5E7EB; 
            padding:20px; 
            cursor:pointer; 
            transition:all 0.3s ease; 
            background: #FFF; 
            display:flex; 
            flex-direction: column;
            align-items: center; 
            text-align: center;
            gap:10px; 
        }
        .role-card:hover { border-color: var(--violet-accent); transform: translateY(-2px); }
        .role-card.active { border-color: var(--violet-deep); background: #F5EFFF; border-width: 2px; }
        .role-card b { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--midnight); }

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

        .label { color: #6B7280; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; display:block; }

        .responsive-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        @media (max-width: 900px) {
            .auth-container { grid-template-columns: 1fr; }
            .branding-section { min-height: 350px; padding: 40px 24px; }
            .form-section { padding: 48px 24px; border-radius: 30px 30px 0 0; margin-top: -30px; position: relative; z-index: 10; }
            .responsive-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="auth-container">

        {/* Left — Branding Panel (Vibrant & Warm) */}
        <div className="branding-section">
          <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: '300px', height: '300px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '100%' }} />

          {/* Logo Component */}
          <Link href="/" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
             <img src="/images/logo.jpg" alt="Logo" style={{ width: '55px', height: 'auto', borderRadius: '8px' }} />
            <div>
              <div style={{ color: '#FFF', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1, letterSpacing: '-0.5px' }}>BETTERMENT</div>
              <div style={{ color: 'var(--violet-accent)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>Group Properties</div>
            </div>
          </Link>

          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(3.5rem, 5vw, 5.5rem)', color: '#FFF', lineHeight: 0.85, letterSpacing: '-1px', marginBottom: '25px' }}>
              START YOUR<br /><span style={{ color: 'var(--violet-accent)' }}>JOURNEY</span><br />HOME
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1.7, maxWidth: '400px', fontWeight: 400 }}>
                We believe finding a home should be simple and exciting. Join our community to explore the best properties Kenya has to offer.
            </p>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {['✓ Hand-picked listings', '✓ Real photos, real properties', '✓ Professional agents you can talk to'].map(p => (
              <div key={p} style={{ color: '#FFF', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--violet-accent)', fontSize: '18px' }}>•</span> {p}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Registration Form */}
        <div className="form-section">
          <div className="form-wrapper">

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--midnight)', marginBottom: '8px', letterSpacing: '-1px' }}>Create Account</h1>
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px', fontWeight: 500 }}>
              Already have an account? <Link href="/auth/login" style={{ color: 'var(--violet-accent)', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
            </p>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '16px', marginBottom: '25px', color: '#B91C1C', fontSize: '14px', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Role Selector */}
            <div style={{ marginBottom: '30px' }}>
              <label className="label">What are you looking for?</label>
              <div className="role-grid">
                <div className={`role-card ${form.role === 'buyer' ? 'active' : ''}`} onClick={() => set('role', 'buyer')}>
                  <span style={{ fontSize: '24px' }}>🏡</span>
                  <b>Find a home</b>
                </div>
                <div className={`role-card ${form.role === 'agent' ? 'active' : ''}`} onClick={() => set('role', 'agent')}>
                  <span style={{ fontSize: '24px' }}>🏗️</span>
                  <b>List property</b>
                </div>
              </div>
            </div>

            {/* Registration Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '35px' }}>
              <div className="responsive-grid">
                <div>
                  <label className="label">Your full name</label>
                  <input className="auth-input" placeholder="Full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Phone number</label>
                  <input className="auth-input" placeholder="254..." value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Email address</label>
                <input className="auth-input" type="email" placeholder="email@address.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>

              {form.role === 'agent' && (
                <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                  <label className="label">Agency or business name</label>
                  <input className="auth-input" placeholder="Name of your company" value={form.agency_name} onChange={e => set('agency_name', e.target.value)} />
                </div>
              )}

              <div className="responsive-grid">
                <div>
                  <label className="label">Create password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '18px' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm password</label>
                  <input className="auth-input" type="password" placeholder="••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                </div>
              </div>
            </div>

            <button className="btn-prime" onClick={handleRegister} disabled={loading}>
              {loading ? 'Setting things up...' : 'Create my account →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}