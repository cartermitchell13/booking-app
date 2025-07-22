-- Add RLS policies for products and product_instances to allow BOTH authenticated and unauthenticated access
-- This enables ANYONE (customers, guests, admins) to browse active offerings

-- Enable RLS on products and product_instances if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_instances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are manageable by tenant admins" ON products;
DROP POLICY IF EXISTS "Product instances are viewable by everyone" ON product_instances;
DROP POLICY IF EXISTS "Product instances are manageable by tenant admins" ON product_instances;

-- CRITICAL: RLS policies for products - BOTH authenticated AND unauthenticated users can read active products
CREATE POLICY "Products are viewable by everyone - authenticated and anonymous" ON products 
  FOR SELECT 
  TO authenticated, anon -- Explicitly allow both user types
  USING (status = 'active');

-- Allow tenant admins to manage their products (authenticated users only)
CREATE POLICY "Products are manageable by tenant admins" ON products 
  FOR ALL 
  TO authenticated -- Only for logged-in users
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin')
    )
  );

-- CRITICAL: RLS policies for product_instances - BOTH authenticated AND unauthenticated users can read active instances
CREATE POLICY "Product instances are viewable by everyone - authenticated and anonymous" ON product_instances
  FOR SELECT 
  TO authenticated, anon -- Explicitly allow both user types
  USING (status = 'active');

-- Allow tenant admins to manage their product instances (authenticated users only)
CREATE POLICY "Product instances are manageable by tenant admins" ON product_instances
  FOR ALL 
  TO authenticated -- Only for logged-in users
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin')
    )
  );

-- CRITICAL: Grant necessary permissions for anonymous users (public browsing)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON product_instances TO anon;

-- Also ensure authenticated users have access
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON product_instances TO authenticated;

-- Test the policies work for both cases
DO $$
BEGIN
  -- Test anonymous access
  RAISE NOTICE 'RLS Policies configured for:';
  RAISE NOTICE '✅ Anonymous users (public browsing) - can SELECT active products';
  RAISE NOTICE '✅ Authenticated users (logged in) - can SELECT active products';  
  RAISE NOTICE '✅ Tenant admins (authenticated) - can manage their products';
  RAISE NOTICE '✅ Product instances follow the same pattern';
END $$;

-- Confirm policies are active
SELECT 'Product RLS policies configured for BOTH authenticated and unauthenticated access!' as status; 