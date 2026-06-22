import { createClient } from '@/lib/supabase/client'
import PropertyClient from '@/components/properties/PropertyClient'
import loading from '@/components/ui/LoadingSpinner'
import SimilarProperties from '@/components/properties/SimilarProperties';

// THIS HANDLES DYNAMIC SEO (Tab name changes to house name)
export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase.from('properties').select('title, description').eq('id', params.id).single();
  
  return {
    title: `${p?.title || 'Listing'} | Betterment Group`,
    description: p?.description?.substring(0, 160),
    openGraph: {
      title: p?.title,
      description: p?.description?.substring(0, 160),
    }
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Data Fetching happens on the Server now
  const { data: property } = await supabase
    .from('properties')
    .select('*, profiles:owner_id (*), property_images(*), counties(name), sub_counties(name)')
    .eq('id', params.id)
    .single();

  if (!property) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1>Property Not Located in Inventory</h1>
    </div>
  );

  return <PropertyClient property={property} />;
}