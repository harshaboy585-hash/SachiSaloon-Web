-- Create site_settings table and insert default values
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

-- Insert default site settings if table is empty
INSERT INTO site_settings (
  id, salon_name, hero_title, hero_subtitle, about_text, phone, whatsapp, youtube_url, email, address, opening_hours, hero_image_url
)
SELECT
  gen_random_uuid(),
  'Sachi Saloon',
  'Premium Men’s Grooming Experience',
  'Professional Haircuts, Beard Styling, Hair Coloring and Grooming Services',
  'At Sachi Saloon, we believe that grooming is an art. Established with the vision of offering unparalleled styling services for modern gentlemen, our saloon combines classic barbershop traditions with modern styling techniques.',
  '+94 74 289 2528',
  '+94-742892528',
  'https://www.youtube.com/channel/UCexample',
  'info@sachisaloon.com',
  '123 Main St, Colombo, Sri Lanka',
  'Mon-Fri 9am-7pm',
  'https://example.com/hero.jpg'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);
