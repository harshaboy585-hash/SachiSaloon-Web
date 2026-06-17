# Sachi Saloon - Premium Men's Grooming Web App

A luxury, high-end web application for **Sachi Saloon**, featuring a dark-gold theme, auto-sliding gallery, dotted menu-style pricing, online booking integrated with WhatsApp redirects, and a fully protected administrative portal.

Built using **React + Vite**, **Vanilla CSS**, and **Supabase (Auth, Database, Storage)**.

---

## Features

- **Luxury Theme**: Immersive black, gold, white, and dark charcoal design.
- **Auto-sliding Carousel**: Highly interactive, responsive gallery showcasing cuts and styling (supports both images and video).
- **Online Booking Form**: Submits data directly to Supabase and immediately constructs a pre-filled WhatsApp verification message to notify the shop owner.
- **Floating WhatsApp Badge**: Continuous, premium, pulsing contact bubble.
- **Admin Control Panel**:
  - Protected router validation via Supabase Auth session states.
  - CRUD tables for Services (toggle active, change display order).
  - CRUD tables for Pricing.
  - Interactive Gallery media uploader (direct integration with Supabase Storage).
  - Site Settings editor to dynamically update hero graphics, phone links, and addresses.
  - Bookings dashboard to inspect requests and change reservations status.

---

## 🛠️ Step-by-Step Setup Guide

### 1. Supabase Backend Setup

1. Create a free account on [Supabase](https://supabase.com) and create a new project named **Sachi Saloon**.
2. Navigate to the **SQL Editor** tab in the Supabase Dashboard.
3. Paste the following SQL query and click **Run** to generate the schema and seed default settings:

```sql
-- Create site_settings table
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

-- Insert initial default setting row
INSERT INTO site_settings (
  id, salon_name, hero_title, hero_subtitle, about_text, phone, whatsapp, youtube_url, email, address, opening_hours, hero_image_url
) VALUES (
  'd4705574-8848-444f-a0e2-8de99320e8b3',
  'Sachi Saloon',
  'Premium Men’s Grooming Experience',
  'Professional Haircuts, Beard Styling, Hair Coloring and Grooming Services',
  'At Sachi Saloon, we believe that grooming is an art. Established with the vision of offering unparalleled styling services for modern gentlemen, our saloon combines classic barbershop traditions with modern styling techniques. Our team of professional barbers is dedicated to delivering precision haircuts, beard styling, hair coloring, and skin care services tailored to your individual style.',
  '+94 74 289 2528',
  '+94-742892528',
  'https://youtube.com/@sachisaloon?si=jY9UeghTp3zNAbAV',
  'info@sachisaloon.com',
  'Colombo, Sri Lanka',
  'Mon - Sun: 9:00 AM - 8:00 PM',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200'
) ON CONFLICT DO NOTHING;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed services
INSERT INTO services (name, description, display_order, is_active) VALUES
('Classic Haircut', 'Precision scissors and clipper cutting tailored to your facial structure.', 1, TRUE),
('Beard Trim & Razor Line', 'Detailed beard styling with hot towel treatment and straight razor lining.', 2, TRUE),
('Luxury Hair Coloring', 'Premium grey coverage or fashion color highlights.', 3, TRUE),
('Premium Hair Treatment', 'Revitalizing scalp massage and conditioning therapies.', 4, TRUE)
ON CONFLICT DO NOTHING;

-- Create pricing table
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  price TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed pricing
INSERT INTO pricing (service_name, price, display_order, is_active) VALUES
('Haircut & Wash', 'LKR 1,500', 1, TRUE),
('Beard Grooming & Shape', 'LKR 1,000', 2, TRUE),
('Hair Coloring', 'LKR 2,500', 3, TRUE),
('Shave & Facial', 'LKR 2,000', 4, TRUE),
('Combo (Cut + Shave)', 'LKR 2,300', 5, TRUE)
ON CONFLICT DO NOTHING;

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  title TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed gallery
INSERT INTO gallery (media_url, media_type, title, display_order, is_active) VALUES
('https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600', 'image', 'Razor Shave', 1, TRUE),
('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', 'image', 'Hair Styling', 2, TRUE),
('https://images.unsplash.com/photo-1605497746444-ac9dba87400f?auto=format&fit=crop&q=80&w=600', 'image', 'Beard Trim', 3, TRUE),
('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', 'image', 'Modern Barbering', 4, TRUE)
ON CONFLICT DO NOTHING;

-- Create bookings table
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
```

### 2. Configure Supabase Storage Bucket

To support direct uploads of gallery photos and videos from the admin panel:
1. Navigate to the **Storage** tab in your Supabase project dashboard.
2. Click **New bucket** and name it `gallery`.
3. Set the bucket privacy toggle to **Public** so anyone can view uploaded images.
4. Click **Create bucket**.
5. Set storage access policies: Go to **Policies** under Storage, and allow `INSERT`, `SELECT`, and `DELETE` actions for all users (or authenticated users only) so that files can be uploaded and cleared.

### 3. Create Admin Credentials

1. Navigate to the **Authentication** tab in Supabase.
2. Select **Users** and click **Add user** -> **Create user**.
3. Supply an email address (e.g. `admin@sachisaloon.com`) and a strong password. This credential is used to login at `/admin/login`.

---

## 💻 Local Workspace Installation

### 1. Clone/Open the Workspace and Install Packages
In your local command terminal inside the project directory:
```bash
# Install NPM dependencies
npm install
```

### 2. Set Up Environment Variables
Duplicate the example environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in the values from your Supabase Project Settings (**Settings -> API**):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.
To log into the admin dashboard, head to `http://localhost:5173/admin/login` and key in your created Auth email and password.

---

## 🚀 Ready for Vercel Deployment

This project is fully ready to be deployed on **Vercel**:
1. Push your local repository to a remote platform like GitHub.
2. Connect your repository in the Vercel Dashboard.
3. In the project import screen, expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically build the React application and provision a live URL.
