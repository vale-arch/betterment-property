import { createClient } from '@/lib/supabase/client'
import PropertyClient from '@/components/properties/PropertyClient'
import SimilarProperties from '@/components/properties/SimilarProperties';
import Link from 'next/link'

type Props = {
  params: { id: string }
}

// 1. Dynamic SEO - Professional shared links for WhatsApp/Social Media
export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data: p } = await supabase
    .from('properties')
    .select('title, description, images')
    .eq('id', params.id)
    .single();
  
  if (!p) return { title: 'Asset Not Found | Betterment Group' };

  return {
    title: `${p.title} | Betterment Group Properties`,
    description: p.description?.substring(0, 160),
    openGraph: {
      title: p.title,
      description: p.description?.substring(0, 160),
      images: [p.images?.[0] || ''],
    }
  }
}

export default async function Page({ params }: Props) {
  const supabase = createClient();
  
  // 2. High-Speed Server Fetch
  const { data: property } = await supabase
    .from('properties')
    .select(`
      *, 
      profiles:owner_id (*), 
      property_images(*), 
      counties(name), 
      sub_counties(name)
    `)
    .eq('id', params.id)
    .single();

  // 3. Elite "Not Found" State (Deep Violet Theme)
  if (!property) return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#F8F9FA',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '8rem', fontFamily: 'Bebas Neue', color: '#2D004F', margin: 0 }}>404</h1>
      <p style={{ color: '#6B7280', fontWeight: '600', marginBottom: '30px' }}>ASSET NOT LOCATED IN CURRENT INVENTORY</p>
      <Link href="/listings" style={{ 
        background: '#2D004F', 
        color: 'white', 
        padding: '15px 35px', 
        borderRadius: '12px', 
        textDecoration: 'none', 
        fontWeight: '800', 
        fontSize: '12px',
        letterSpacing: '1px'
      }}>
        RETURN TO MARKETPLACE
      </Link>
    </div>
  );

  // 4. Return Client Component + Similar Properties
  return (
    <main style={{ background: '#FDFCF9' }}>
      {/* The Interactive Responsive Component */}
      <PropertyClient property={property} />

      {/* Similar Properties Section (Speed optimized) */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px 80px' }}>
        <SimilarProperties 
          countyId={property.county_id} 
          currentId={property.id} 
        />
      </div>
    </main>
  );
}