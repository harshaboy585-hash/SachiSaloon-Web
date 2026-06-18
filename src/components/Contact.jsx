import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

const YoutubeIcon = ({ size = 14, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.484 20.5 12 20.5 12 20.5s7.516 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Contact({ settings }) {
  const phone = settings?.phone || '+94 74 289 2528';
  const email = settings?.email || 'info@sachisaloon.com';
  const address = settings?.address || 'Colombo, Sri Lanka';
  const openingHours = settings?.opening_hours || 'Mon - Sun: 9:00 AM - 8:00 PM';
  const youtubeUrl = settings?.youtube_url || 'https://youtube.com/@sachisaloon?si=jY9UeghTp3zNAbAV';
  const whatsappNumber = settings?.whatsapp || '+94-742892528';

  const cleanNum = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNum}`;

  return (
    <section id="contact" className="contact-section section-py">
      <div className="contact-container container">
        <div className="section-title-wrapper">
          <span className="section-subtitle">Get In Touch</span>
          <h2 className="section-title">Contact & Location</h2>
        </div>

        <div className="contact-grid">
          <div className="contact-card salon-card">
            <div className="contact-info-header">
              <div className="contact-icon-wrapper">
                <MapPin size={20} className="contact-icon" />
              </div>
              <h3>Our Location</h3>
            </div>
            <p className="contact-info-value">{address}</p>
            {/* Embedded Google Map */}
            <div className="map-container" style={{ marginTop: '1rem' }}>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: '8px' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map of Salon Location"
              ></iframe>
            </div>
          </div>

          <div className="contact-card salon-card">
            <div className="contact-info-header">
              <div className="contact-icon-wrapper">
                <Clock size={20} className="contact-icon" />
              </div>
              <h3>Opening Hours</h3>
            </div>
            <p className="contact-info-value" style={{ whiteSpace: 'pre-line' }}>{openingHours}</p>
          </div>

          <div className="contact-card salon-card">
            <div className="contact-info-header">
              <div className="contact-icon-wrapper">
                <Phone size={20} className="contact-icon" />
              </div>
              <h3>Call & WhatsApp</h3>
            </div>
            <p className="contact-info-value">
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="contact-link">{phone}</a>
            </p>
            <div className="contact-sub-actions">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-sub-link">
                <MessageSquare size={14} /> WhatsApp Chat
              </a>
            </div>
          </div>

          <div className="contact-card salon-card">
            <div className="contact-info-header">
              <div className="contact-icon-wrapper">
                <Mail size={20} className="contact-icon" />
              </div>
              <h3>Email & Socials</h3>
            </div>
            <p className="contact-info-value">
              <a href={`mailto:${email}`} className="contact-link">{email}</a>
            </p>
            <div className="contact-sub-actions">
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="contact-sub-link youtube-color">
                <YoutubeIcon size={14} /> YouTube Channel
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
