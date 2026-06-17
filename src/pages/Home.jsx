import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Gallery from '../components/Gallery';
import Pricing from '../components/Pricing';
import BookingForm from '../components/BookingForm';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return (
    url &&
    key &&
    !url.includes('your-project') &&
    !url.includes('your_supabase') &&
    !key.includes('...')
  );
};

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, skip fetching and show site with fallbacks immediately
    if (!isSupabaseConfigured()) {
      console.info('Supabase not configured — showing site with default content.');
      setLoading(false);
      return;
    }

    // Race: fetch data OR timeout after 5 seconds — whichever comes first
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    async function fetchData() {
      try {
        const [settingsRes, servicesRes, pricingRes, galleryRes] = await Promise.allSettled([
          supabase.from('site_settings').select('*'),
          supabase.from('services').select('*').order('display_order', { ascending: true }),
          supabase.from('pricing').select('*').order('display_order', { ascending: true }),
          supabase.from('gallery').select('*').order('display_order', { ascending: true }),
        ]);

        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.length > 0) {
          setSettings(settingsRes.value.data[0]);
        }
        if (servicesRes.status === 'fulfilled' && servicesRes.value.data) {
          setServices(servicesRes.value.data);
        }
        if (pricingRes.status === 'fulfilled' && pricingRes.value.data) {
          setPricing(pricingRes.value.data);
        }
        if (galleryRes.status === 'fulfilled' && galleryRes.value.data) {
          setGallery(galleryRes.value.data);
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }

    fetchData();

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/logo.png" alt="Sachi Saloon" className="loading-logo" />
        <div className="spinner" style={{ marginTop: '1.5rem' }}></div>
      </div>
    );
  }

  return (
    <>
      <Header settings={settings} />
      <main>
        <Hero settings={settings} />
        <About settings={settings} />
        <Services services={services} />
        <Gallery gallery={gallery} />
        <Pricing pricing={pricing} />
        <BookingForm services={services} whatsappNumber={settings?.whatsapp} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} />
      <FloatingWhatsApp whatsapp={settings?.whatsapp} />
    </>
  );
}
