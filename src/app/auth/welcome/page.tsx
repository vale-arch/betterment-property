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

  // Savannah Specific Role Config
  const roleConfig = {
    buyer: { icon: '🏠', label: 'Buyer', color: '#A3432F', message: 'Start browsing thousands of verified properties across Kenya.', cta: 'Browse Marketplace', dest: '/' },
    agent: { icon: '🏗️', label: 'Agent', color: '#C9A84C', message: 'Your dashboard is ready. Start listing properties and managing inquiries.', cta: 'Go to Dashboard', dest: '/dashboard' },
    admin: { icon: '⚙️', label: 'Admin', color: '#1A1A1A', message: 'Access system controls. Manage listings, agents and platform settings.', cta: 'Open Admin Panel', dest: '/admin' },
  }

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.buyer

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFCF9' }}>
      
      {/* Background Texture & Photo */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.03, animation: 'fadeIn 1s ease both' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(163,67,47,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(163,67,47,0.02) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Role Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: `radial-gradient(circle, ${config.color}15 0%, transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Confetti (brand colors) */}
      {isNew && [...Array(15)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: `${Math.random() * 30}%`, left: `${10 + Math.random() * 80}%`, width: '10px', height: '10px', borderRadius: '2px', background: i % 2 === 0 ? '#A3432F' : '#C9A84C', animation: `confetti ${2 + Math.random() * 2}s ease ${Math.random()}s both`, pointerEvents: 'none' }} />
      ))}

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', animation: leaving ? 'fadeOut 0.6s ease both' : 'popIn 0.8s cubic-bezier(0.16,1,0.3,1) both', maxWidth: '520px', width: '90%' }}>
        
        {/* Animated Icon Ring */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', border: `1px solid ${config.color}`, opacity: 0.2, animation: 'ringPulse 2s ease-out infinite' }} />
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#FFF', border: `1px solid #EEE`, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>{config.icon}</div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${config.color}10`, border: `1px solid ${config.color}20`, borderRadius: '100px', padding: '8px 20px', marginBottom: '25px' }}>
          <span style={{ color: config.color, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>{config.label} Verified</span>
        </div>

        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(3rem,8vw,4.5rem)', color: '#1A1A1A', lineHeight: 0.9, letterSpacing: '-1px', marginBottom: '15px' }}>
          {isNew ? 'Welcome To The Group,' : 'Welcome Back,'}<br />
          <span style={{ color: config.color }}>
            {decodeURIComponent(name).split(' ')[0]}! 👋
          </span>
        </h1>

        <p style={{ color: '#666', fontSize: '16px', lineHeight: 1.6, marginBottom: '45px', fontWeight: 500 }}>
          {isNew ? `Your premium ${config.label.toLowerCase()} account is live. ` : ''}{config.message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          {/* Progress Timer */}
          <div style={{ position: 'relative', width: '70px', height: '70px' }}>
            <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="35" cy="35" r="28" fill="none" stroke="#EEE" strokeWidth="4" />
              <circle cx="35" cy="35" r="28" fill="none" stroke={config.color} strokeWidth="4" strokeDasharray="176" strokeDashoffset="0" style={{ animation: `countDown 4s linear both`, strokeLinecap: 'round' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '24px', color: '#1A1A1A' }}>{countdown}</div>
          </div>

          <button onClick={() => router.push(config.dest)} style={{ background: config.color, color: '#FFF', border: 'none', borderRadius: '100px', padding: '16px 40px', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: `0 10px 25px ${config.color}30` }}>
            {config.cta} →
          </button>
        </div>
      </div>

      {/* Brand Footer */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
        <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
            <path d="M20 55 C 20 20, 80 20, 80 55" stroke="#C9A84C" strokeWidth="4" fill="none" />
            <path d="M25 65 L40 50 L55 65 V80 H25 V65Z" fill="#A3432F" />
            <path d="M40 55 L55 40 L70 55 V80 H40 V55Z" fill="#A3432F" />
            <path d="M55 65 L65 55 L75 65 V80 H55 V65Z" fill="#A3432F" />
        </svg>
        <span style={{ color: '#1A1A1A', fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '1px' }}>Betterment Group</span>
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
        
        @keyframes popIn { from { opacity:0; transform:scale(0.9) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeOut { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.98); } }
        @keyframes ringPulse { 0% { transform:scale(1); opacity:0.4; } 100% { transform:scale(1.4); opacity:0; } }
        @keyframes countDown { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 176; } }
        @keyframes confetti { 0% { transform:translateY(0) rotate(0deg); opacity:1; } 100% { transform:translateY(100vh) rotate(360deg); opacity:0; } }
      `}</style>
      
      <Suspense fallback={
        <div style={{ background: '#FDFCF9', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A3432F', fontFamily: 'Bebas Neue', fontSize: '2rem' }}>
          PREPARING DASHBOARD...
        </div>
      }>
        <WelcomeContent />
      </Suspense>
    </>
  )
}