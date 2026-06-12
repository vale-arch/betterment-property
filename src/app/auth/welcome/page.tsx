'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// 1. Logic & UI Component
function WelcomeContent() {
  const router = useRouter()
  const params = useSearchParams()
  
  const role = params.get('role') || 'buyer'
  const name = params.get('name') || 'there'
  const isNew = params.get('new') === 'true'

  const [countdown, setCountdown] = useState(4)
  const [leaving, setLeaving] = useState(false)

  const destination = role === 'agent' ? '/dashboard' : role === 'admin' ? '/admin' : '/'

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setLeaving(true)
          setTimeout(() => router.push(destination), 600)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [destination, router])

  // Corporate Specific Role Config
  const roleConfig = {
    buyer: { icon: '🏙️', label: 'Investor', color: '#7B2CBF', message: 'Access premium assets and verified listings across the region.', cta: 'Enter Marketplace', dest: '/' },
    agent: { icon: '🏢', label: 'Professional Agent', color: '#2D004F', message: 'Your professional dashboard is synchronized and ready.', cta: 'Manage Portfolio', dest: '/dashboard' },
    admin: { icon: '🛡️', label: 'System Administrator', color: '#1B1464', message: 'Root access granted. System controls are now online.', cta: 'Open Command Center', dest: '/admin' },
  }

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.buyer

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
      
      {/* Background Texture & Photo (Corporate Architecture) */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.02, animation: 'fadeIn 1.2s ease both' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(45,0,79,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,0,79,0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      {/* Corporate Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: `radial-gradient(circle, ${config.color}10 0%, transparent 70%)`, filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Confetti (Corporate colors: Violet and Navy) */}
      {isNew && [...Array(15)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: `${Math.random() * 30}%`, left: `${10 + Math.random() * 80}%`, width: '8px', height: '8px', borderRadius: '2px', background: i % 2 === 0 ? '#2D004F' : '#7B2CBF', animation: `confetti ${2 + Math.random() * 2}s ease ${Math.random()}s both`, pointerEvents: 'none' }} />
      ))}

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', animation: leaving ? 'fadeOut 0.6s ease both' : 'popIn 0.8s cubic-bezier(0.16,1,0.3,1) both', maxWidth: '550px', width: '90%' }}>
        
        {/* Animated Icon Ring */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '35px' }}>
          <div style={{ position: 'absolute', width: '130px', height: '130px', borderRadius: '50%', border: `1px solid ${config.color}`, opacity: 0.15, animation: 'ringPulse 2.5s ease-out infinite' }} />
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#FFF', border: `1px solid #E5E7EB`, boxShadow: '0 15px 35px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px' }}>{config.icon}</div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${config.color}08`, border: `1px solid ${config.color}15`, borderRadius: '8px', padding: '10px 22px', marginBottom: '30px' }}>
          <span style={{ color: config.color, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2.5px' }}>{config.label} Authenticated</span>
        </div>

        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(3.5rem,8vw,5rem)', color: '#1B1464', lineHeight: 0.85, letterSpacing: '-1.5px', marginBottom: '15px' }}>
          {isNew ? 'Account Activated,' : 'Welcome Back,'}<br />
          <span style={{ color: config.color }}>
            {decodeURIComponent(name).split(' ')[0]}!
          </span>
        </h1>

        <p style={{ color: '#6B7280', fontSize: '17px', lineHeight: 1.7, marginBottom: '50px', fontWeight: 400 }}>
          {isNew ? `Your institutional ${config.label.toLowerCase()} profile is now live. ` : ''}{config.message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
          {/* Progress Timer */}
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#F1F5F9" strokeWidth="3" />
              <circle cx="40" cy="40" r="34" fill="none" stroke={config.color} strokeWidth="3" strokeDasharray="213" strokeDashoffset="0" style={{ animation: `countDown 4s linear both`, strokeLinecap: 'round' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '28px', color: '#1B1464' }}>{countdown}</div>
          </div>

          <button onClick={() => router.push(config.dest)} style={{ background: config.color, color: '#FFF', border: 'none', borderRadius: '12px', padding: '18px 45px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: `0 15px 30px ${config.color}25` }}>
            {config.cta}
          </button>
        </div>
      </div>

      {/* Corporate Brand Footer */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.8 }}>
        <img src="/images/logo.jpg" alt="Logo" style={{ height: '35px', width: 'auto', borderRadius: '4px' }} />
        <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#1B1464', fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>BETTERMENT</div>
            <div style={{ color: '#7B2CBF', fontSize: '7px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Group Properties</div>
        </div>
      </div>
    </div>
  )
}

// 2. Main Page Wrapper with Suspense
export default function WelcomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes popIn { from { opacity:0; transform:scale(0.96) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeOut { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.98); } }
        @keyframes ringPulse { 0% { transform:scale(1); opacity:0.3; } 100% { transform:scale(1.5); opacity:0; } }
        @keyframes countDown { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 213; } }
        @keyframes confetti { 0% { transform:translateY(0) rotate(0deg); opacity:1; } 100% { transform:translateY(100vh) rotate(360deg); opacity:0; } }
      `}</style>
      
      <Suspense fallback={
        <div style={{ background: '#F8F9FA', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D004F', fontFamily: 'Inter', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '2px' }}>
          SYNCHRONIZING ACCESS...
        </div>
      }>
        <WelcomeContent />
      </Suspense>
    </>
  )
}