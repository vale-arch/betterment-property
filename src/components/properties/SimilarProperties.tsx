'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SimilarProperties({ countyId, currentId }: { countyId: any, currentId: string }) {
  const [similar, setSimilar] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function getSimilar() {
      const { data } = await supabase
        .from('properties')
        .select('*, counties(name)')
        .eq('county_id', countyId)
        .neq('id', currentId) // Don't show the current property
        .limit(3)
      if (data) setSimilar(data)
    }
    getSimilar()
  }, [countyId, currentId])

  if (similar.length === 0) return null

  return (
    <div style={{ marginTop: '80px', borderTop: '1px solid #EEE', paddingTop: '60px' }}>
      <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#2D004F', marginBottom: '30px' }}>Similar Properties in this Area</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        {similar.map(p => (
          <Link key={p.id} href={`/properties/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #EEE' }}>
              <img src={p.images?.[0]} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '15px' }}>
                <p style={{ color: '#7B2CBF', fontWeight: 'bold', fontSize: '14px' }}>KES {p.price?.toLocaleString()}</p>
                <p style={{ fontWeight: '700', fontSize: '15px', margin: '5px 0' }}>{p.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}