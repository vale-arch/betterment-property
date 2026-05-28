// ============================================================
// BETTERMENT GROUP LTD — Core TypeScript Types
// ============================================================

export type UserRole = 'buyer' | 'agent' | 'admin'
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial'
export type ListingPurpose = 'sale' | 'rent' | 'both'
export type ListingStatus = 'pending' | 'active' | 'sold' | 'rented' | 'suspended' | 'rejected'
export type ListingTier = 'basic' | 'featured' | 'premium'
export type TitleDeedType = 'freehold' | 'leasehold' | 'sectional_title' | 'other'
export type InquiryStatus = 'new' | 'contacted' | 'resolved'

// ============================================================
// PROFILE
// ============================================================

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone?: string
  whatsapp?: string
  email?: string
  avatar_url?: string
  bio?: string
  agency_name?: string
  license_number?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// LOCATION
// ============================================================

export interface County {
  id: number
  name: string
  slug: string
}

export interface SubCounty {
  id: number
  county_id: number
  name: string
  slug: string
  county?: County
}

export interface Area {
  id: number
  sub_county_id: number
  name: string
  slug: string
  sub_county?: SubCounty
}

// ============================================================
// PROPERTY
// ============================================================

export interface PropertyImage {
  id: string
  property_id: string
  url: string
  caption?: string
  sort_order: number
  created_at: string
}

export interface Amenity {
  id: number
  name: string
  icon?: string
  category?: string
}

export interface Property {
  id: string
  owner_id: string
  property_type: PropertyType
  listing_purpose: ListingPurpose
  listing_status: ListingStatus
  listing_tier: ListingTier
  title: string
  slug?: string
  description?: string
  price?: number
  price_negotiable: boolean
  service_charge?: number

  // Location
  county_id?: number
  sub_county_id?: number
  area_id?: number
  street_address?: string
  latitude?: number
  longitude?: number

  // House / Apartment
  bedrooms?: number
  bathrooms?: number
  total_area_sqft?: number
  floor_number?: number
  total_floors?: number
  year_built?: number
  is_furnished?: boolean
  is_pet_friendly?: boolean
  has_parking?: boolean
  parking_spaces?: number
  has_backup_power?: boolean
  has_water_backup?: boolean
  has_borehole?: boolean
  has_swimming_pool?: boolean
  has_gym?: boolean
  is_gated_community?: boolean

  // Land
  land_area_acres?: number
  land_area_sqft?: number
  title_deed_type?: TitleDeedType
  land_use?: string
  is_serviced?: boolean

  // Commercial
  commercial_type?: string
  has_loading_bay?: boolean
  has_3_phase_power?: boolean

  // Media
  thumbnail_url?: string
  video_url?: string

  // Stats
  view_count: number
  inquiry_count: number

  // SEO
  meta_title?: string
  meta_description?: string

  featured_until?: string
  created_at: string
  updated_at: string

  // Joins
  owner?: Profile
  county?: County
  sub_county?: SubCounty
  area?: Area
  images?: PropertyImage[]
  amenities?: Amenity[]
}

// ============================================================
// INQUIRY
// ============================================================

export interface Inquiry {
  id: string
  property_id: string
  agent_id?: string
  sender_name: string
  sender_email?: string
  sender_phone: string
  message: string
  preferred_contact: 'whatsapp' | 'call' | 'email'
  status: InquiryStatus
  created_at: string
  property?: Pick<Property, 'id' | 'title' | 'slug' | 'thumbnail_url'>
}

// ============================================================
// SEARCH / FILTER
// ============================================================

export interface PropertyFilters {
  property_type?: PropertyType | ''
  listing_purpose?: ListingPurpose | ''
  county_id?: number | ''
  sub_county_id?: number | ''
  area_id?: number | ''
  min_price?: number | ''
  max_price?: number | ''
  bedrooms?: number | ''
  bathrooms?: number | ''
  is_furnished?: boolean
  has_parking?: boolean
  is_gated_community?: boolean
  title_deed_type?: TitleDeedType | ''
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
  page?: number
  limit?: number
}

// ============================================================
// LISTING TIERS / PRICING
// ============================================================

export interface ListingTierInfo {
  tier: ListingTier
  name: string
  price_kes: number
  duration_days: number
  features: string[]
}

export const LISTING_TIERS: ListingTierInfo[] = [
  {
    tier: 'basic',
    name: 'Basic',
    price_kes: 0,
    duration_days: 30,
    features: ['Standard listing', 'Up to 5 photos', 'Contact form'],
  },
  {
    tier: 'featured',
    name: 'Featured',
    price_kes: 2500,
    duration_days: 30,
    features: ['Highlighted listing', 'Up to 15 photos', 'Featured badge', 'Priority in search'],
  },
  {
    tier: 'premium',
    name: 'Premium',
    price_kes: 5000,
    duration_days: 30,
    features: [
      'Top placement',
      'Unlimited photos',
      'Video listing',
      'Premium badge',
      'Social media boost',
      'WhatsApp priority',
    ],
  },
]

// ============================================================
// API RESPONSE
// ============================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
