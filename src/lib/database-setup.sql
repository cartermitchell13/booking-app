-- Multi-Tenant Branding System Database Setup
-- Run this in your Supabase SQL editor

-- Create tenants table with branding support
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE
    ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert ParkBus as the default tenant
INSERT INTO tenants (
  slug, 
  name, 
  branding, 
  settings,
  subscription_plan,
  subscription_status
) VALUES (
  'parkbus',
  'ParkBus',
  '{
    "primary_color": "#10B981",
    "secondary_color": "#059669", 
    "logo_url": "/images/black-pb-logo.png",
    "font_family": "Inter"
  }'::jsonb,
  '{
    "timezone": "America/Vancouver",
    "currency": "CAD",
    "email_from": "bookings@parkbus.ca"
  }'::jsonb,
  'enterprise',
  'active'
) ON CONFLICT (slug) DO UPDATE SET
  branding = EXCLUDED.branding,
  settings = EXCLUDED.settings;

-- Create trips table with tenant reference
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  departure_location TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  return_time TIMESTAMP WITH TIME ZONE,
  price_adult INTEGER NOT NULL, -- price in cents
  price_child INTEGER,
  max_passengers INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  image_url TEXT,
  highlights TEXT[] DEFAULT '{}',
  included_items TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for trips updated_at
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE
    ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID, -- References auth.users
  booking_reference TEXT UNIQUE NOT NULL,
  passenger_count_adult INTEGER NOT NULL DEFAULT 0,
  passenger_count_child INTEGER NOT NULL DEFAULT 0,
  passenger_details JSONB DEFAULT '[]'::jsonb,
  total_amount INTEGER NOT NULL, -- price in cents
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_intent_id TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE
    ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenants (only accessible by authenticated users)
CREATE POLICY "Tenants are viewable by everyone" ON tenants FOR SELECT USING (true);
CREATE POLICY "Tenants are editable by their admins" ON tenants FOR UPDATE 
  USING (id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- RLS policies for trips
CREATE POLICY "Trips are viewable by everyone" ON trips FOR SELECT USING (true);
CREATE POLICY "Trips are manageable by tenant admins" ON trips FOR ALL 
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- RLS policies for bookings  
CREATE POLICY "Bookings are viewable by tenant members and customers" ON bookings FOR SELECT 
  USING (
    tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()) OR
    user_id = auth.uid()
  );

CREATE POLICY "Bookings are manageable by tenant admins and customers" ON bookings FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()) OR
    user_id = auth.uid()
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_trips_tenant_id ON trips(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON trips(departure_time);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);

-- Insert sample trips for ParkBus
INSERT INTO trips (
  tenant_id,
  title,
  description,
  destination,
  departure_location,
  departure_time,
  return_time,
  price_adult,
  price_child,
  max_passengers,
  available_seats,
  image_url,
  highlights,
  included_items
) 
SELECT 
  t.id,
  'Banff National Park Adventure',
  'Experience the stunning beauty of Banff National Park with comfortable transportation and expert guides.',
  'Banff',
  'Calgary',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '8 hours',
  12000, -- $120.00
  8000,  -- $80.00
  45,
  38,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  ARRAY['Lake Louise visit', 'Moraine Lake photo stop', 'Wildlife viewing', 'Mountain scenery'],
  ARRAY['Transportation', 'Professional guide', 'Park entry fees', 'Bottled water']
FROM tenants t WHERE t.slug = 'parkbus'
ON CONFLICT DO NOTHING;

INSERT INTO trips (
  tenant_id,
  title,
  description,
  destination,
  departure_location,
  departure_time,
  return_time,
  price_adult,
  price_child,
  max_passengers,
  available_seats,
  image_url,
  highlights,
  included_items
) 
SELECT 
  t.id,
  'Jasper Wilderness Tour',
  'Discover the untamed wilderness of Jasper National Park on this unforgettable journey.',
  'Jasper',
  'Edmonton',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '10 days' + INTERVAL '9 hours',
  14000, -- $140.00
  9500,  -- $95.00
  40,
  35,
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  ARRAY['Maligne Lake cruise', 'Columbia Icefield', 'Hot springs visit', 'Mountain wildlife'],
  ARRAY['Transportation', 'Professional guide', 'Boat cruise', 'Park entry fees', 'Hot springs access']
FROM tenants t WHERE t.slug = 'parkbus'
ON CONFLICT DO NOTHING;

-- Function to get tenant by domain (for subdomain/domain detection)
CREATE OR REPLACE FUNCTION get_tenant_by_domain(domain_input TEXT)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  domain TEXT,
  branding JSONB,
  settings JSONB,
  subscription_plan TEXT,
  subscription_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.slug,
    t.name,
    t.domain,
    t.branding,
    t.settings,
    t.subscription_plan,
    t.subscription_status,
    t.created_at,
    t.updated_at
  FROM tenants t
  WHERE t.domain = domain_input OR t.slug = split_part(domain_input, '.', 1)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON trips TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT EXECUTE ON FUNCTION get_tenant_by_domain TO anon, authenticated;

-- Success message
SELECT 'Multi-tenant branding database setup completed successfully!' as status; 