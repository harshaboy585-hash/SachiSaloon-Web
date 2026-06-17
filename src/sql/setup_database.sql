-- =============================================
-- SACHI SALOON - Full Database Setup (Safe)
-- Paste this ENTIRE block in Supabase SQL Editor
-- and click RUN (Ctrl+Enter)
-- =============================================

-- ==================
-- 1. BOOKINGS TABLE
-- ==================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================
-- 2. SERVICES TABLE
-- ==================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================
-- 3. PRICING TABLE
-- ==================
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  price TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================
-- 4. GALLERY TABLE
-- ==================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 5. SITE SETTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_name TEXT NOT NULL DEFAULT 'Sachi Saloon',
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

-- Default site settings (only if empty)
INSERT INTO site_settings (
  salon_name, hero_title, hero_subtitle, about_text,
  phone, whatsapp, email, address, opening_hours
)
SELECT
  'Sachi Saloon',
  'Premium Men''s Grooming Experience',
  'Professional Haircuts, Beard Styling & Grooming',
  'At Sachi Saloon, we believe grooming is an art. We combine classic barbershop traditions with modern styling techniques.',
  '+94 74 289 2528',
  '+94742892528',
  'info@sachisaloon.com',
  'Sri Lanka',
  'Mon–Sat: 8:00 AM – 8:00 PM'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Default services (only if empty)
INSERT INTO services (name, description, display_order, is_active)
SELECT * FROM (VALUES
  ('Classic Haircut', 'Precision cut tailored to your style.', 1, true),
  ('Hot Razor Shave', 'Traditional hot towel straight razor shave.', 2, true),
  ('Beard Grooming & Shape', 'Expert beard sculpting and styling.', 3, true),
  ('Hair Coloring', 'Premium color treatments and highlights.', 4, true),
  ('Combo (Cut + Shave)', 'Haircut and straight razor shave combined.', 5, true)
) AS v(name, description, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM services);

-- Default pricing (only if empty)
INSERT INTO pricing (service_name, price, display_order, is_active)
SELECT * FROM (VALUES
  ('Haircut & Wash',         'LKR 1,500', 1, true),
  ('Beard Grooming & Shape', 'LKR 1,000', 2, true),
  ('Hair Coloring',          'LKR 2,500', 3, true),
  ('Shave & Facial',         'LKR 2,000', 4, true),
  ('Combo (Cut + Shave)',    'LKR 2,300', 5, true)
) AS v(service_name, price, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM pricing);

-- Default gallery (only if empty)
INSERT INTO gallery (title, media_url, media_type, display_order, is_active)
SELECT * FROM (VALUES
  ('Classic Hot Razor Shave', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800', 'image', 1, true),
  ('Hair Styling & Design',   'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800', 'image', 2, true),
  ('Beard Trimming & Lining', 'https://images.unsplash.com/photo-1605497746444-ac9dba87400f?auto=format&fit=crop&q=80&w=800', 'image', 3, true),
  ('Luxury Hair Treatment',   'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800', 'image', 4, true)
) AS v(title, media_url, media_type, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM gallery);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid duplicates
DROP POLICY IF EXISTS "Public read services"        ON services;
DROP POLICY IF EXISTS "Public read pricing"         ON pricing;
DROP POLICY IF EXISTS "Public read gallery"         ON gallery;
DROP POLICY IF EXISTS "Public read site_settings"   ON site_settings;
DROP POLICY IF EXISTS "Public insert bookings"      ON bookings;
DROP POLICY IF EXISTS "Admin full access bookings"  ON bookings;
DROP POLICY IF EXISTS "Admin full access services"  ON services;
DROP POLICY IF EXISTS "Admin full access pricing"   ON pricing;
DROP POLICY IF EXISTS "Admin full access gallery"   ON gallery;
DROP POLICY IF EXISTS "Admin full access site_settings" ON site_settings;

-- Public can READ: services, pricing, gallery, site_settings
CREATE POLICY "Public read services"      ON services      FOR SELECT USING (true);
CREATE POLICY "Public read pricing"       ON pricing       FOR SELECT USING (true);
CREATE POLICY "Public read gallery"       ON gallery       FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Customers can submit bookings (INSERT only)
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Authenticated admin: full CRUD on all tables
CREATE POLICY "Admin full access bookings"      ON bookings      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access services"      ON services      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access pricing"       ON pricing       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access gallery"       ON gallery       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
