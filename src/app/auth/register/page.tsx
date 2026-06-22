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
    confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleRegister = async () => {
    if (!form.full_name || !form.email || !form.password) { 
        setError('Please fill in your name, email and password.')
        return 
    }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }

    setLoading(true); setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: 'buyer', // HARDCODED: Public can only be buyers/investors
          phone: form.phone,
        }
      }
    })

    if (err) { 
        setError(err.message)
        setLoading(false)
        return 
    }

    router.push(`/auth/welcome?role=buyer&name=${encodeURIComponent(form.full_name)}&new=true`)
  }

  return (
    <div className="auth-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600;700;800&display=swap');
        :root { --violet: #2D004F; --accent: #7B2CBF; }
        body { font-family: 'Inter', sans-serif; background: #F8F9FA; margin:0; }
        .auth-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        .brand-side { background: linear-gradient(160deg, #2D004F 0%, #1B1464 100%); padding: 60px; color: white; display: flex; flex-direction: column; justify-content: space-between; }
        .form-side { background: white; padding: 60px 80px; display: flex; flex-direction: column; justify-content: center; }
        .input-box { width: 100%; padding: 14px; border: 1.5px solid #E5E7EB; border-radius: 12px; margin-bottom: 20px; outline: none; font-size: 15px; }
        .input-box:focus { border-color: var(--accent); }
        .btn-main { background: var(--violet); color: white; border: none; padding: 18px; border-radius: 12px; width: 100%; font-weight: 800; cursor: pointer; transition: 0.3s; text-transform: uppercase; }
        .btn-main:hover { background: var(--accent); transform: translateY(-2px); }
        @media (max-width: 900px) { .auth-grid { grid-template-columns: 1fr; } .brand-side { display: none; } }
      `}</style>

      <div className="auth-grid">
        <div className="brand-side">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/images/logo.jpg" alt="Logo" style={{ width: '50px', borderRadius: '8px' }} />
            <span style={{ fontWeight: 900, color: 'white', fontSize: '1.2rem' }}>BETTERMENT GROUP</span>
          </Link>
          <div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '5rem', lineHeight: 0.9 }}>JOIN THE<br/><span style={{ color: 'var(--accent)' }}>NETWORK</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '20px', maxWidth: '400px' }}>Create an account to save your favorite assets and receive direct briefings from our portfolio leads.</p>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>© BETTERMENT GROUP LIMITED</div>
        </div>

        <div className="form-side">
          <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1B1464', marginBottom: '10px' }}>Create Account</h2>
            <p style={{ color: '#6B7280', marginBottom: '40px' }}>Already a member? <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign in</Link></p>
            
            {error && <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 600 }}>{error}</div>}

            <label style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Full Name</label>
            <input className="input-box" placeholder="John Doe" onChange={e => set('full_name', e.target.value)} />
            
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email Address</label>
            <input className="input-box" type="email" placeholder="john@example.com" onChange={e => set('email', e.target.value)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Password</label>
                    <input className="input-box" type="password" placeholder="••••••" onChange={e => set('password', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Confirm</label>
                    <input className="input-box" type="password" placeholder="••••••" onChange={e => set('confirm', e.target.value)} />
                </div>
            </div>

            <button className="btn-main" onClick={handleRegister} disabled={loading}>
              {loading ? 'Processing...' : 'Create My Account →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}