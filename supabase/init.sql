-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_name TEXT NOT NULL,
  hero_title TEXT,
  hero_subtitle TEXT,
  about_text TEXT,
  phone TEXT,
  whatsapp TEXT,
  youtube_url TEXT,
  email TEXT,
  address TEXT,
  opening_hours TEXT,
  hero_image_url TEXT
);

-- Insert default site settings if empty
INSERT INTO site_settings (
  id, salon_name, hero_title, hero_subtitle, about_text, phone, whatsapp, youtube_url, email, address, opening_hours, hero_image_url
) 
SELECT 
  'd4705574-8848-444f-a0e2-8de99320e8b3',
  'Sachi Saloon',
  'Premium Men’s Grooming Experience',
  'Professional Haircuts, Beard Styling, Hair Coloring and Grooming Services',
  'At Sachi Saloon, we believe that grooming is an art. Established with the vision of offering unparalleled styling services for modern gentlemen, our saloon combines classic barbershop traditions with modern styling techniques.',
  '+94 74 289 2528',
  '+94-742892528',
  'https://youtube.com/@sachisaloon',
  'info@sachisaloon.com',
  'Colombo, Sri Lanka',
  'Mon - Sun: 9:00 AM - 8:00 PM',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- 2. Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed services if empty
INSERT INTO services (name, description, display_order, is_active)
SELECT name, description, display_order, is_active FROM (
  VALUES 
    ('Classic Haircut', 'Precision scissors and clipper cutting tailored to your facial structure.', 1, TRUE),
    ('Beard Trim & Razor Line', 'Detailed beard styling with hot towel treatment and straight razor lining.', 2, TRUE),
    ('Luxury Hair Coloring', 'Premium grey coverage or fashion color highlights.', 3, TRUE),
    ('Premium Hair Treatment', 'Revitalizing scalp massage and conditioning therapies.', 4, TRUE)
) AS v(name, description, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM services);

-- 3. Create pricing table
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  price TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed pricing if empty
INSERT INTO pricing (service_name, price, display_order, is_active)
SELECT service_name, price, display_order, is_active FROM (
  VALUES 
    ('Haircut & Wash', 'LKR 1,500', 1, TRUE),
    ('Beard Grooming & Shape', 'LKR 1,000', 2, TRUE),
    ('Hair Coloring', 'LKR 2,500', 3, TRUE),
    ('Shave & Facial', 'LKR 2,000', 4, TRUE),
    ('Combo (Cut + Shave)', 'LKR 2,300', 5, TRUE)
) AS v(service_name, price, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM pricing);

-- 4. Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  title TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed gallery if empty
INSERT INTO gallery (media_url, media_type, title, display_order, is_active)
SELECT media_url, media_type, title, display_order, is_active FROM (
  VALUES 
    ('https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600', 'image', 'Razor Shave', 1, TRUE),
    ('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', 'image', 'Hair Styling', 2, TRUE),
    ('https://images.unsplash.com/photo-1605497746444-ac9dba87400f?auto=format&fit=crop&q=80&w=600', 'image', 'Beard Trim', 3, TRUE),
    ('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', 'image', 'Modern Barbering', 4, TRUE)
) AS v(media_url, media_type, title, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM gallery);

-- 5. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Disable Row Level Security (RLS) for all tables to ensure public access is enabled by default
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. GALLERY STORAGE BUCKET SETUP (Run after creating bucket)
-- ============================================================
-- Step 1: Go to Supabase Dashboard → Storage → New Bucket
--         Name: gallery   |   Toggle: Public bucket ✓
--
-- Step 2: Run these policies in Supabase SQL Editor:

-- Allow anyone to view/read gallery files
DO $$
BEGIN
  CREATE POLICY "Public gallery read" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'gallery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users (admin) to upload files
DO $$
BEGIN
  CREATE POLICY "Auth gallery insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'gallery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users to delete their uploads
DO $$
BEGIN
  CREATE POLICY "Auth gallery delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'gallery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

