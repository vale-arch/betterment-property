-- ============================================================
-- BETTERMENT GROUP LTD — PROPERTY PLATFORM
-- Database Schema v1.0
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('buyer', 'agent', 'admin');

CREATE TYPE property_type AS ENUM ('house', 'apartment', 'land', 'commercial');

CREATE TYPE listing_purpose AS ENUM ('sale', 'rent', 'both');

CREATE TYPE listing_status AS ENUM ('pending', 'active', 'sold', 'rented', 'suspended', 'rejected');

CREATE TYPE listing_tier AS ENUM ('basic', 'featured', 'premium');

CREATE TYPE title_deed_type AS ENUM ('freehold', 'leasehold', 'sectional_title', 'other');

CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'resolved');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'buyer',
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  -- Agent-specific fields
  agency_name TEXT,
  license_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOCATIONS (hierarchical: county → sub_county → area)
-- ============================================================

CREATE TABLE counties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE sub_counties (
  id SERIAL PRIMARY KEY,
  county_id INT REFERENCES counties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(county_id, slug)
);

CREATE TABLE areas (
  id SERIAL PRIMARY KEY,
  sub_county_id INT REFERENCES sub_counties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(sub_county_id, slug)
);

-- ============================================================
-- PROPERTIES (core listing table)
-- ============================================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Classification
  property_type property_type NOT NULL,
  listing_purpose listing_purpose NOT NULL,
  listing_status listing_status NOT NULL DEFAULT 'pending',
  listing_tier listing_tier NOT NULL DEFAULT 'basic',

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,

  -- Pricing
  price NUMERIC(15, 2),                    -- sale price or monthly rent
  price_negotiable BOOLEAN DEFAULT FALSE,
  service_charge NUMERIC(10, 2),           -- monthly service charge if any

  -- Location
  county_id INT REFERENCES counties(id),
  sub_county_id INT REFERENCES sub_counties(id),
  area_id INT REFERENCES areas(id),
  street_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- House / Apartment specific
  bedrooms SMALLINT,
  bathrooms SMALLINT,
  total_area_sqft NUMERIC(10, 2),
  floor_number SMALLINT,
  total_floors SMALLINT,
  year_built SMALLINT,
  is_furnished BOOLEAN,
  is_pet_friendly BOOLEAN,
  has_parking BOOLEAN,
  parking_spaces SMALLINT,
  has_backup_power BOOLEAN,
  has_water_backup BOOLEAN,
  has_borehole BOOLEAN,
  has_swimming_pool BOOLEAN,
  has_gym BOOLEAN,
  is_gated_community BOOLEAN,

  -- Land specific
  land_area_acres NUMERIC(10, 4),
  land_area_sqft NUMERIC(12, 2),
  title_deed_type title_deed_type,
  land_use TEXT,                           -- e.g., "residential", "agricultural", "mixed"
  is_serviced BOOLEAN,                     -- roads, water, electricity on plot

  -- Commercial specific
  commercial_type TEXT,                    -- office, shop, warehouse, godown, etc.
  has_loading_bay BOOLEAN,
  has_3_phase_power BOOLEAN,

  -- Media
  thumbnail_url TEXT,
  video_url TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Moderation
  rejection_reason TEXT,
  featured_until TIMESTAMPTZ,

  -- Stats
  view_count INT DEFAULT 0,
  inquiry_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROPERTY IMAGES
-- ============================================================

CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROPERTY AMENITIES (flexible tag system)
-- ============================================================

CREATE TABLE amenities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,                               -- icon name/class
  category TEXT                            -- "security", "utilities", "recreation", etc.
);

CREATE TABLE property_amenities (
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id INT REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

-- ============================================================
-- INQUIRIES
-- ============================================================

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id),   -- who owns the listing
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  preferred_contact TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'call', 'email'
  status inquiry_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED PROPERTIES (buyer wishlist)
-- ============================================================

CREATE TABLE saved_properties (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- ============================================================
-- LISTING PAYMENTS (M-Pesa integration)
-- ============================================================

CREATE TABLE listing_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tier listing_tier NOT NULL,
  amount_kes NUMERIC(10, 2) NOT NULL,
  mpesa_ref TEXT,                          -- M-Pesa transaction code
  checkout_request_id TEXT,               -- Daraja STK push ID
  status TEXT DEFAULT 'pending',           -- pending | completed | failed
  duration_days INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- ============================================================
-- KENYAN COUNTIES & SUB-COUNTIES SEED DATA
-- ============================================================

INSERT INTO counties (name, slug) VALUES
('Nairobi', 'nairobi'),
('Mombasa', 'mombasa'),
('Kisumu', 'kisumu'),
('Nakuru', 'nakuru'),
('Eldoret', 'eldoret'),
('Kiambu', 'kiambu'),
('Machakos', 'machakos'),
('Kajiado', 'kajiado'),
('Nyeri', 'nyeri'),
('Meru', 'meru');

-- Nairobi sub-counties
INSERT INTO sub_counties (county_id, name, slug) VALUES
(1, 'Westlands', 'westlands'),
(1, 'Dagoretti North', 'dagoretti-north'),
(1, 'Dagoretti South', 'dagoretti-south'),
(1, 'Langata', 'langata'),
(1, 'Kibra', 'kibra'),
(1, 'Roysambu', 'roysambu'),
(1, 'Kasarani', 'kasarani'),
(1, 'Ruaraka', 'ruaraka'),
(1, 'Embakasi South', 'embakasi-south'),
(1, 'Embakasi North', 'embakasi-north'),
(1, 'Embakasi Central', 'embakasi-central'),
(1, 'Embakasi East', 'embakasi-east'),
(1, 'Embakasi West', 'embakasi-west'),
(1, 'Makadara', 'makadara'),
(1, 'Kamukunji', 'kamukunji'),
(1, 'Starehe', 'starehe'),
(1, 'Mathare', 'mathare');

-- Nairobi areas (most searched)
INSERT INTO areas (sub_county_id, name, slug) VALUES
(1, 'Westlands', 'westlands'),
(1, 'Parklands', 'parklands'),
(1, 'Highridge', 'highridge'),
(1, 'Spring Valley', 'spring-valley'),
(2, 'Lavington', 'lavington'),
(2, 'Kilimani', 'kilimani'),
(2, 'Kileleshwa', 'kileleshwa'),
(4, 'Karen', 'karen'),
(4, 'Langata', 'langata'),
(6, 'Roysambu', 'roysambu'),
(6, 'Ruaka', 'ruaka'),
(6, 'Thindigua', 'thindigua'),
(7, 'Kasarani', 'kasarani'),
(7, 'Mwiki', 'mwiki'),
(9, 'Syokimau', 'syokimau'),
(9, 'Mlolongo', 'mlolongo');

-- Kiambu areas
INSERT INTO sub_counties (county_id, name, slug) VALUES
(6, 'Thika', 'thika'),
(6, 'Ruiru', 'ruiru'),
(6, 'Juja', 'juja'),
(6, 'Githunguri', 'githunguri');

-- ============================================================
-- AMENITIES SEED DATA
-- ============================================================

INSERT INTO amenities (name, icon, category) VALUES
('Borehole', 'droplets', 'utilities'),
('Backup Generator', 'zap', 'utilities'),
('Solar Power', 'sun', 'utilities'),
('Water Backup Tank', 'archive', 'utilities'),
('CCTV', 'camera', 'security'),
('Electric Fence', 'shield', 'security'),
('Security Guard', 'user-check', 'security'),
('Intercom', 'phone', 'security'),
('Swimming Pool', 'waves', 'recreation'),
('Gym', 'dumbbell', 'recreation'),
('Playground', 'smile', 'recreation'),
('Clubhouse', 'home', 'recreation'),
('Fibre Internet', 'wifi', 'connectivity'),
('Lift / Elevator', 'arrow-up', 'building'),
('Rooftop Terrace', 'building-2', 'building'),
('Servant Quarter', 'door-open', 'rooms'),
('Study Room', 'book', 'rooms'),
('Garden', 'trees', 'outdoor'),
('Balcony', 'layout', 'outdoor'),
('Garage', 'car', 'parking');

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX idx_properties_status ON properties(listing_status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_purpose ON properties(listing_purpose);
CREATE INDEX idx_properties_county ON properties(county_id);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_created ON properties(created_at DESC);
CREATE INDEX idx_properties_featured ON properties(featured_until) WHERE featured_until IS NOT NULL;
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_inquiries_property ON inquiries(property_id);
CREATE INDEX idx_inquiries_agent ON inquiries(agent_id);
CREATE INDEX idx_images_property ON property_images(property_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own, agents readable by all
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Properties: active listings public, owners manage own
CREATE POLICY "Active listings public" ON properties FOR SELECT USING (listing_status = 'active');
CREATE POLICY "Owners see own listings" ON properties FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Agents create listings" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own listings" ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins manage all" ON properties FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Images: follow property access
CREATE POLICY "Images public with active property" ON property_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND listing_status = 'active')
);
CREATE POLICY "Owners manage images" ON property_images FOR ALL USING (
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);

-- Inquiries: sender or agent can view
CREATE POLICY "Agents see own inquiries" ON inquiries FOR SELECT USING (auth.uid() = agent_id);
CREATE POLICY "Anyone can send inquiry" ON inquiries FOR INSERT WITH CHECK (true);

-- Saved properties: private to user
CREATE POLICY "Users manage own saves" ON saved_properties FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := base_slug || '-' || SUBSTR(NEW.id::TEXT, 1, 8);
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM properties WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_property_slug BEFORE INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION generate_property_slug();

-- Increment view count (called from API)
CREATE OR REPLACE FUNCTION increment_view_count(property_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE properties SET view_count = view_count + 1 WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
