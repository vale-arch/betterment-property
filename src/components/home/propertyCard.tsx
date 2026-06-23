'use client'
import { MapPin, Bed, Bath, Move, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseLoader } from '@/lib/image-loader';

export default function PropertyCard({ property }: { property: any }) {
  // 1. Logic to find the best image URL
  const displayImage = 
    property.property_images?.[0]?.url || // Check the joined table
    (Array.isArray(property.images) ? property.images[0] : null) || // Check the array column
    '/images/placeholder-property.jpg'; // Hardcoded fallback

  return (
    <Link href={`/properties/${property.id}`} className="group block h-full">
      <div style={{
        background: 'white',
        borderRadius: '30px',
        border: '1px solid rgba(45, 0, 79, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 20px 50px rgba(45, 0, 79, 0.05)',
        position: 'relative'
      }} className="group-hover:-translate-y-2 group-hover:shadow-[0_40px_80px_rgba(45,0,79,0.12)]">
        
        {/* --- Image Section --- */}
        <div style={{ position: 'relative', height: '320px', width: '100%', background: '#1a1a1a' }}>
  <Image 
    loader={supabaseLoader}
    src={displayImage}
    alt={property.title}
    fill
    style={{ objectFit: 'cover', filter: 'contrast(1.05) brightness(1.05)' }} // Subtle photo enhancement
    className="transition-transform duration-1000 group-hover:scale-105"
  />
  
  {/* TOP-DOWN SOFT SHADOW (Makes the white badge pop) */}
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%)', zIndex: 2 }} />

  {/* BOTTOM-UP DARKNESS (Only for the price area) */}
  <div style={{ 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    height: '50%', background: 'linear-gradient(to top, rgba(27, 20, 100, 0.9) 0%, transparent 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    padding: '30px', zIndex: 3
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{ width: '12px', height: '2px', background: '#7B2CBF' }}></div>
        <p style={{ color: '#7B2CBF', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            Market Value
        </p>
    </div>
    <h4 style={{ color: 'white', fontSize: '2rem', fontFamily: 'Bebas Neue', margin: 0, letterSpacing: '1px' }}>
      KES {property.price?.toLocaleString()}
    </h4>
  </div>
</div>

        {/* --- Content Section --- */}
        <div style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', marginBottom: '10px' }}>
            <MapPin className="w-3 h-3" />
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {property.sub_counties?.name || 'Private Location'}
            </span>
          </div>

          <h3 style={{ 
            fontSize: '1.3rem', fontWeight: 800, color: '#1B1464', 
            marginBottom: '25px', lineHeight: 1.2, height: '3.2rem',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}>
            {property.title}
          </h3>

          {/* Stats Bar - Top Tier Layout */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', 
            paddingTop: '20px', borderTop: '1px solid #F3F4F6' 
          }}>
            <div style={{ textAlign: 'center', borderRight: '1px solid #F3F4F6' }}>
              <Bed className="w-4 h-4 text-[#7B2CBF]" style={{ margin: '0 auto 5px' }} />
              <p style={{ fontSize: '9px', fontWeight: 800, color: '#2D004F', margin: 0 }}>{property.bedrooms || '—'} ROOMS</p>
            </div>
            <div style={{ textAlign: 'center', borderRight: '1px solid #F3F4F6' }}>
              <Move className="w-4 h-4 text-[#7B2CBF]" style={{ margin: '0 auto 5px' }} />
              <p style={{ fontSize: '9px', fontWeight: 800, color: '#2D004F', margin: 0 }}>{property.sq_ft || '—'} SQFT</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', margin: '8px auto 8px' }}></div>
              <p style={{ fontSize: '8px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' }}>Active</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}