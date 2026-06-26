import { createClient } from '@/lib/supabase/client'

export default async function sitemap() {
  const supabase = createClient()
  const { data: properties } = await supabase.from('properties').select('id')

  const propertyUrls = properties?.map((p) => ({
    url: `https://www.yourdomain.com/properties/${p.id}`,
    lastModified: new Date(),
  })) || []

  return [
    { url: 'https://www.yourdomain.com', lastModified: new Date() },
    { url: 'https://www.yourdomain.com/listings', lastModified: new Date() },
    ...propertyUrls,
  ]
}