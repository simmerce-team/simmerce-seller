-- Seed Data for Simmerce B2B Platform
-- This script populates the database with initial reference data

-- Disable triggers temporarily for faster inserts
SET session_replication_role = 'replica';

-- 1. Business Types (must come first as it's referenced by businesses)
INSERT INTO business_types (name, slug, description, created_at)
VALUES 
  ('Manufacturer', 'manufacturer', 'Manufactures products in-house', now()),
  ('Wholesaler', 'wholesaler', 'Buys in bulk and sells to retailers', now()),
  ('Distributor', 'distributor', 'Distributes products for manufacturers', now()),
  ('Trader', 'trader', 'Buys and sells products', now()),
  ('Service Provider', 'service-provider', 'Provides business services', now()),
  ('Retailer', 'retailer', 'Sells directly to consumers', now()),
  ('Exporter', 'exporter', 'Sells products internationally', now()),
  ('Importer', 'importer', 'Imports products from other countries', now());

-- 2. Countries
INSERT INTO countries (name, slug, iso_code, phone_code, currency, currency_symbol, created_at, updated_at)
VALUES 
  ('India', 'india', 'IN', '91', 'INR', '₹', now(), now()),
  ('United States', 'united-states', 'US', '1', 'USD', '$', now(), now()),
  ('United Kingdom', 'united-kingdom', 'GB', '44', 'GBP', '£', now(), now()),
  ('Germany', 'germany', 'DE', '49', 'EUR', '€', now(), now()),
  ('United Arab Emirates', 'united-arab-emirates', 'AE', '971', 'AED', 'د.إ', now(), now());

-- 3. States for India
WITH india AS (SELECT id FROM countries WHERE slug = 'india')
INSERT INTO states (name, slug, country_id, created_at, updated_at)
VALUES 
  ('Andhra Pradesh', 'andhra-pradesh', (SELECT id FROM india), now(), now()),
  ('Arunachal Pradesh', 'arunachal-pradesh', (SELECT id FROM india), now(), now()),
  ('Assam', 'assam', (SELECT id FROM india), now(), now()),
  ('Bihar', 'bihar', (SELECT id FROM india), now(), now()),
  ('Chhattisgarh', 'chhattisgarh', (SELECT id FROM india), now(), now()),
  ('Goa', 'goa', (SELECT id FROM india), now(), now()),
  ('Gujarat', 'gujarat', (SELECT id FROM india), now(), now()),
  ('Haryana', 'haryana', (SELECT id FROM india), now(), now()),
  ('Himachal Pradesh', 'himachal-pradesh', (SELECT id FROM india), now(), now()),
  ('Jharkhand', 'jharkhand', (SELECT id FROM india), now(), now()),
  ('Karnataka', 'karnataka', (SELECT id FROM india), now(), now()),
  ('Kerala', 'kerala', (SELECT id FROM india), now(), now()),
  ('Madhya Pradesh', 'madhya-pradesh', (SELECT id FROM india), now(), now()),
  ('Maharashtra', 'maharashtra', (SELECT id FROM india), now(), now()),
  ('Manipur', 'manipur', (SELECT id FROM india), now(), now()),
  ('Meghalaya', 'meghalaya', (SELECT id FROM india), now(), now()),
  ('Mizoram', 'mizoram', (SELECT id FROM india), now(), now()),
  ('Nagaland', 'nagaland', (SELECT id FROM india), now(), now()),
  ('Odisha', 'odisha', (SELECT id FROM india), now(), now()),
  ('Punjab', 'punjab', (SELECT id FROM india), now(), now()),
  ('Rajasthan', 'rajasthan', (SELECT id FROM india), now(), now()),
  ('Sikkim', 'sikkim', (SELECT id FROM india), now(), now()),
  ('Tamil Nadu', 'tamil-nadu', (SELECT id FROM india), now(), now()),
  ('Telangana', 'telangana', (SELECT id FROM india), now(), now()),
  ('Tripura', 'tripura', (SELECT id FROM india), now(), now()),
  ('Uttar Pradesh', 'uttar-pradesh', (SELECT id FROM india), now(), now()),
  ('Uttarakhand', 'uttarakhand', (SELECT id FROM india), now(), now()),
  ('West Bengal', 'west-bengal', (SELECT id FROM india), now(), now()),
  ('Andaman and Nicobar Islands', 'andaman-and-nicobar-islands', (SELECT id FROM india), now(), now()),
  ('Chandigarh', 'chandigarh', (SELECT id FROM india), now(), now()),
  ('Dadra and Nagar Haveli and Daman and Diu', 'dadra-and-nagar-haveli-and-daman-and-diu', (SELECT id FROM india), now(), now()),
  ('Delhi', 'delhi', (SELECT id FROM india), now(), now()),
  ('Jammu and Kashmir', 'jammu-and-kashmir', (SELECT id FROM india), now(), now()),
  ('Ladakh', 'ladakh', (SELECT id FROM india), now(), now()),
  ('Lakshadweep', 'lakshadweep', (SELECT id FROM india), now(), now()),
  ('Puducherry', 'puducherry', (SELECT id FROM india), now(), now());

-- 4. Major Cities in India
WITH 
  india AS (SELECT id FROM countries WHERE slug = 'india'),
  mh AS (SELECT id FROM states WHERE slug = 'maharashtra'),
  dl AS (SELECT id FROM states WHERE slug = 'delhi'),
  ka AS (SELECT id FROM states WHERE slug = 'karnataka'),
  tn AS (SELECT id FROM states WHERE slug = 'tamil-nadu'),
  up AS (SELECT id FROM states WHERE slug = 'uttar-pradesh'),
  gj AS (SELECT id FROM states WHERE slug = 'gujarat'),
  rj AS (SELECT id FROM states WHERE slug = 'rajasthan'),
  wb AS (SELECT id FROM states WHERE slug = 'west-bengal'),
  ap AS (SELECT id FROM states WHERE slug = 'andhra-pradesh'),
  ts AS (SELECT id FROM states WHERE slug = 'telangana'),
  
  -- City data CTE
  city_data AS (
    -- Maharashtra
    SELECT 'Mumbai' as name, 'mumbai' as slug, (SELECT id FROM mh) as state_id, (SELECT id FROM india) as country_id, now() as created_at, now() as updated_at
    UNION ALL SELECT 'Pune', 'pune', (SELECT id FROM mh), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Nashik', 'nashik', (SELECT id FROM mh), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Nagpur', 'nagpur', (SELECT id FROM mh), (SELECT id FROM india), now(), now()
    
    -- Delhi
    UNION ALL SELECT 'New Delhi', 'new-delhi', (SELECT id FROM dl), (SELECT id FROM india), now(), now()
    
    -- Karnataka
    UNION ALL SELECT 'Bangalore', 'bangalore', (SELECT id FROM ka), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Mysore', 'mysore', (SELECT id FROM ka), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Hubli', 'hubli', (SELECT id FROM ka), (SELECT id FROM india), now(), now()
    
    -- Tamil Nadu
    UNION ALL SELECT 'Chennai', 'chennai', (SELECT id FROM tn), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Coimbatore', 'coimbatore', (SELECT id FROM tn), (SELECT id FROM india), now(), now()
    
    -- Uttar Pradesh
    UNION ALL SELECT 'Noida', 'noida', (SELECT id FROM up), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Ghaziabad', 'ghaziabad', (SELECT id FROM up), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Kanpur', 'kanpur', (SELECT id FROM up), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Lucknow', 'lucknow', (SELECT id FROM up), (SELECT id FROM india), now(), now()
    
    -- Gujarat
    UNION ALL SELECT 'Ahmedabad', 'ahmedabad', (SELECT id FROM gj), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Surat', 'surat', (SELECT id FROM gj), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Vadodara', 'vadodara', (SELECT id FROM gj), (SELECT id FROM india), now(), now()
    
    -- Rajasthan
    UNION ALL SELECT 'Jaipur', 'jaipur', (SELECT id FROM rj), (SELECT id FROM india), now(), now()
    UNION ALL SELECT 'Udaipur', 'udaipur', (SELECT id FROM rj), (SELECT id FROM india), now(), now()
    
    -- West Bengal
    UNION ALL SELECT 'Kolkata', 'kolkata', (SELECT id FROM wb), (SELECT id FROM india), now(), now()
    
    -- Andhra Pradesh
    UNION ALL SELECT 'Visakhapatnam', 'visakhapatnam', (SELECT id FROM ap), (SELECT id FROM india), now(), now()
    
    -- Telangana
    UNION ALL SELECT 'Hyderabad', 'hyderabad', (SELECT id FROM ts), (SELECT id FROM india), now(), now()
  )

-- Insert with proper conflict handling
INSERT INTO cities (name, slug, state_id, country_id, created_at, updated_at)
SELECT name, slug, state_id, country_id, created_at, updated_at
FROM city_data;

-- 5. Main Categories
WITH root AS (SELECT gen_random_uuid() as root_id)
INSERT INTO categories (id, name, slug, description, parent_id, icon_url, created_at, updated_at)
VALUES 
  -- Level 1 Categories
  ((SELECT root_id FROM root), 'Electronics', 'electronics', 'Electronic devices and components', null, null, now(), now()),
  (gen_random_uuid(), 'Fashion', 'fashion', 'Clothing and accessories', null, null, now(), now()),
  (gen_random_uuid(), 'Home & Garden', 'home-garden', 'Home and garden products', null, null, now(), now()),
  (gen_random_uuid(), 'Beauty & Personal Care', 'beauty-personal-care', 'Beauty and personal care products', null, null, now(), now()),
  (gen_random_uuid(), 'Sports & Outdoors', 'sports-outdoors', 'Sports and outdoor equipment', null, null, now(), now()),
  (gen_random_uuid(), 'Industrial Supplies', 'industrial-supplies', 'Industrial and business supplies', null, null, now(), now()),
  (gen_random_uuid(), 'Health & Medical', 'health-medical', 'Health and medical supplies', null, null, now(), now()),
  (gen_random_uuid(), 'Automotive', 'automotive', 'Automotive parts and accessories', null, null, now(), now()),
  (gen_random_uuid(), 'Food & Beverage', 'food-beverage', 'Food and beverage products', null, null, now(), now()),
  (gen_random_uuid(), 'Textiles & Leather', 'textiles-leather', 'Textile and leather products', null, null, now(), now());

-- 6. Subcategories
WITH 
  electronics AS (SELECT id FROM categories WHERE slug = 'electronics'),
  fashion AS (SELECT id FROM categories WHERE slug = 'fashion'),
  home_garden AS (SELECT id FROM categories WHERE slug = 'home-garden'),
  beauty AS (SELECT id FROM categories WHERE slug = 'beauty-personal-care'),
  industrial AS (SELECT id FROM categories WHERE slug = 'industrial-supplies')

-- Subcategories
INSERT INTO categories (name, slug, description, parent_id, icon_url, created_at, updated_at)
VALUES 
  -- Electronics
  ('Mobile Phones', 'mobile-phones', 'Smartphones and feature phones', (SELECT id FROM electronics), null, now(), now()),
  ('Laptops & Computers', 'laptops-computers', 'Laptops, desktops and accessories', (SELECT id FROM electronics), null, now(), now()),
  ('Audio & Video', 'audio-video', 'Speakers, headphones, and home theater', (SELECT id FROM electronics), null, now(), now()),
  ('Cameras & Accessories', 'cameras-accessories', 'DSLRs, mirrorless, and accessories', (SELECT id FROM electronics), null, now(), now()),
  
  -- Fashion
  ('Men''s Clothing', 'mens-clothing', 'Clothing for men', (SELECT id FROM fashion), null, now(), now()),
  ('Women''s Clothing', 'womens-clothing', 'Clothing for women', (SELECT id FROM fashion), null, now(), now()),
  ('Jewelry', 'jewelry', 'Fashion jewelry and accessories', (SELECT id FROM fashion), null, now(), now()),
  
  -- Home & Garden
  ('Furniture', 'furniture', 'Home and office furniture', (SELECT id FROM home_garden), null, now(), now()),
  ('Kitchenware', 'kitchenware', 'Kitchen tools and equipment', (SELECT id FROM home_garden), null, now(), now()),
  
  -- Industrial
  ('Tools & Hardware', 'tools-hardware', 'Industrial tools and hardware', (SELECT id FROM industrial), null, now(), now()),
  ('Safety & Security', 'safety-security', 'Workplace safety equipment', (SELECT id FROM industrial), null, now(), now());

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Output completion message
DO $$
BEGIN
  RAISE NOTICE 'Seed data population completed successfully.';
  RAISE NOTICE '- % countries added', (SELECT COUNT(*) FROM countries);
  RAISE NOTICE '- % states added', (SELECT COUNT(*) FROM states);
  RAISE NOTICE '- % cities added', (SELECT COUNT(*) FROM cities);
  RAISE NOTICE '- % categories added', (SELECT COUNT(*) FROM categories);
  RAISE NOTICE '- % business types added', (SELECT COUNT(*) FROM business_types);
END $$;
