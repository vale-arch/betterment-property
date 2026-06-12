import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', textAlign: 'center', padding: '20px' }}>
      <h1 style={{ fontSize: '10rem', fontFamily: 'Bebas Neue', color: '#2D004F', lineHeight: 0.8 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1B1464', margin: '20px 0' }}>ASSET NOT LOCATED</h2>
      <p style={{ color: '#6B7280', maxWidth: '400px', marginBottom: '40px' }}>
        The property or page you are looking for has been moved or is no longer in our active inventory.
      </p>
      <Link href="/" style={{ background: '#2D004F', color: 'white', padding: '18px 40px', borderRadius: '12px', textDecoration: 'none', fontWeight: '800', fontSize: '12px', letterSpacing: '1px' }}>
        RETURN TO MARKETPLACE
      </Link>
    </div>
  )
}