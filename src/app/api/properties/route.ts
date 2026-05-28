// src/app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { PropertyFilters, PaginatedResponse, Property } from '@/lib/types'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)

  // Parse filters from query params
  const filters: PropertyFilters = {
    property_type: searchParams.get('property_type') as any || '',
    listing_purpose: searchParams.get('listing_purpose') as any || '',
    county_id: searchParams.get('county_id') ? Number(searchParams.get('county_id')) : '',
    sub_county_id: searchParams.get('sub_county_id') ? Number(searchParams.get('sub_county_id')) : '',
    area_id: searchParams.get('area_id') ? Number(searchParams.get('area_id')) : '',
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : '',
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : '',
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : '',
    is_furnished: searchParams.get('is_furnished') === 'true' ? true : undefined,
    has_parking: searchParams.get('has_parking') === 'true' ? true : undefined,
    is_gated_community: searchParams.get('is_gated_community') === 'true' ? true : undefined,
    search: searchParams.get('search') || '',
    sort: (searchParams.get('sort') as any) || 'newest',
    page: Number(searchParams.get('page') || 1),
    limit: Math.min(Number(searchParams.get('limit') || 20), 50),
  }

  const offset = ((filters.page || 1) - 1) * (filters.limit || 20)

  // Build query
  let query = supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!owner_id (id, full_name, phone, whatsapp, avatar_url, agency_name, is_verified),
      county:counties!county_id (id, name, slug),
      sub_county:sub_counties!sub_county_id (id, name, slug),
      area:areas!area_id (id, name, slug),
      images:property_images (id, url, sort_order)
    `, { count: 'exact' })
    .eq('listing_status', 'active')

  // Apply filters
  if (filters.property_type) query = query.eq('property_type', filters.property_type)
  if (filters.listing_purpose) query = query.eq('listing_purpose', filters.listing_purpose)
  if (filters.county_id) query = query.eq('county_id', filters.county_id)
  if (filters.sub_county_id) query = query.eq('sub_county_id', filters.sub_county_id)
  if (filters.area_id) query = query.eq('area_id', filters.area_id)
  if (filters.min_price) query = query.gte('price', filters.min_price)
  if (filters.max_price) query = query.lte('price', filters.max_price)
  if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms)
  if (filters.is_furnished !== undefined) query = query.eq('is_furnished', filters.is_furnished)
  if (filters.has_parking !== undefined) query = query.eq('has_parking', filters.has_parking)
  if (filters.is_gated_community !== undefined) query = query.eq('is_gated_community', filters.is_gated_community)

  // Full-text search
  if (filters.search) {
    query = query.textSearch('title', filters.search, { type: 'websearch' })
  }

  // Sorting
  switch (filters.sort) {
    case 'price_asc':
      query = query.order('listing_tier', { ascending: false }).order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('listing_tier', { ascending: false }).order('price', { ascending: false })
      break
    case 'popular':
      query = query.order('listing_tier', { ascending: false }).order('view_count', { ascending: false })
      break
    default: // newest
      query = query.order('listing_tier', { ascending: false }).order('created_at', { ascending: false })
  }

  // Pagination
  query = query.range(offset, offset + (filters.limit || 20) - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: PaginatedResponse<Property> = {
    data: data as Property[],
    total: count || 0,
    page: filters.page || 1,
    limit: filters.limit || 20,
    total_pages: Math.ceil((count || 0) / (filters.limit || 20)),
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    }
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile.data?.role === 'buyer') {
    return NextResponse.json({ error: 'Only agents can create listings' }, { status: 403 })
  }

  const body = await request.json()
  const { images, amenities, ...propertyData } = body

  // Insert property
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert({ ...propertyData, owner_id: user.id, listing_status: 'pending' })
    .select()
    .single()

  if (propertyError) {
    return NextResponse.json({ error: propertyError.message }, { status: 500 })
  }

  // Insert images
  if (images && images.length > 0) {
    await supabase.from('property_images').insert(
      images.map((url: string, idx: number) => ({
        property_id: property.id,
        url,
        sort_order: idx,
      }))
    )
  }

  // Insert amenities
  if (amenities && amenities.length > 0) {
    await supabase.from('property_amenities').insert(
      amenities.map((amenity_id: number) => ({
        property_id: property.id,
        amenity_id,
      }))
    )
  }

  return NextResponse.json({ data: property }, { status: 201 })
}
