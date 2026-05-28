// src/app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient()
  const { id } = params

  // Support lookup by slug or UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(id)
  const query = supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!owner_id (id, full_name, phone, whatsapp, avatar_url, agency_name, is_verified, bio),
      county:counties!county_id (id, name, slug),
      sub_county:sub_counties!sub_county_id (id, name, slug),
      area:areas!area_id (id, name, slug),
      images:property_images (id, url, caption, sort_order),
      amenities:property_amenities (amenity:amenities (id, name, icon, category))
    `)

  const { data, error } = isUUID
    ? await query.eq('id', id).single()
    : await query.eq('slug', id).single()

  if (error || !data) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  // Increment view count (fire and forget)
  supabase.rpc('increment_view_count', { property_uuid: data.id }).then(() => {})

  return NextResponse.json({ data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { images, amenities, ...updates } = body

  // Verify ownership or admin
  const { data: property } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', params.id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (property?.owner_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: property } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', params.id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (property?.owner_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('properties').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: 'Deleted' })
}
