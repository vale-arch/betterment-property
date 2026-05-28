'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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

  const roleConfig = {
    buyer: { icon: '🏠', label: 'Buyer', color: '#6366F1', message: 'Start browsing thousands of verified properties across Kenya.', cta: 'Browse Listings', dest: '/' },
    agent: { icon: '🏗️', label: 'Agent', color: '#C9A84C', message: 'Your dashboard is ready. Start listing properties and managing inquiries.', cta: 'Go to Dashboard', dest: '/dashboard' },
    admin: { icon: '⚙️', label: 'Admin', color: '#EF4444', message: 'Welcome back. Manage listings, agents and platform settings.', cta: 'Open Admin Panel', dest: '/admin' },
  }

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.buyer

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c0c0c' }}>
      
      {/* Background photo */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.06, animation: 'fadeIn 1s ease both' }} />

      {/* Glow & Grid */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: `radial-gradient(circle, ${config.color}20 0%, transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)', pointerEvents: 'none' }} />

      {/* Confetti (new users) */}
      {isNew && [...Array(12)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: `${Math.random() * 30}%`, left: `${10 + Math.random() * 80}%`, width: '8px', height: '8px', borderRadius: '50%', background: i % 3 === 0 ? '#C9A84C' : i % 3 === 1 ? '#6366F1' : '#10B981', animation: `confetti ${2 + Math.random() * 2}s ease ${Math.random()}s both`, pointerEvents: 'none' }} />
      ))}

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', animation: leaving ? 'fadeOut 0.6s ease both' : 'popIn 0.8s cubic-bezier(0.16,1,0.3,1) both', maxWidth: '520px', width: '90%' }}>
        
        {/* Icon */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: `2px solid ${config.color}`, opacity: 0.3, animation: 'ringPulse 2s ease-out infinite' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${config.color}18`, border: `2px solid ${config.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>{config.icon}</div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${config.color}15`, border: `1px solid ${config.color}35`, borderRadius: '100px', padding: '6px 16px', marginBottom: '20px' }}>
          <span style={{ color: config.color, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{config.label} Account</span>
        </div>

        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2.5rem,6vw,4rem)', color: '#fff', lineHeight: 0.95, letterSpacing: '-0.01em', marginBottom: '12px' }}>
          {isNew ? 'Welcome,' : 'Welcome Back,'}<br />
          <span style={{ background: `linear-gradient(135deg, ${config.color} 0%, #fff 100%)`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite' }}>
            {decodeURIComponent(name).split(' ')[0]}! 👋
          </span>
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
          {isNew ? `Your ${config.label.toLowerCase()} account has been created. ` : ''}{config.message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '64px', height: '64px' }}>
            <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle cx="32" cy="32" r="22" fill="none" stroke={config.color} strokeWidth="3" strokeDasharray="138" strokeDashoffset="0" style={{ animation: `countDown 4s linear both`, strokeLinecap: 'round' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#fff' }}>{countdown}</div>
          </div>

          <button onClick={() => router.push(config.dest)} style={{ background: config.color, color: config.color === '#C9A84C' ? '#0c0c0c' : '#fff', border: 'none', borderRadius: '12px', padding: '14px 32px', fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', boxShadow: `0 8px 24px ${config.color}40` }}>
            {config.cta} →
          </button>
        </div>
      </div>

      {/* Bottom logo */}
      <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.3 }}>
        <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '16px', color: '#0c0c0c' }}>B</div>
        <span style={{ color: '#fff', fontFamily: 'Bebas Neue', fontSize: '14px' }}>Betterment Group Property</span>
      </div>
    </div>
  )
}

// 2. Main Page Wrapper with Suspense
export default function WelcomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes popIn { from { opacity:0; transform:scale(0.85) translateY(30px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeOut { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.95); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes ringPulse { 0% { transform:scale(1); opacity:0.8; } 100% { transform:scale(1.6); opacity:0; } }
        @keyframes countDown { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 138; } }
        @keyframes confetti { 0% { transform:translateY(0) rotate(0deg); opacity:1; } 100% { transform:translateY(100vh) rotate(720deg); opacity:0; } }
      `}</style>
      
      <Suspense fallback={
        <div style={{ background: '#0c0c0c', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontFamily: 'Bebas Neue', fontSize: '2rem' }}>
          LOADING...
        </div>
      }>
        <WelcomeContent />
      </Suspense>
    </>
  )
}