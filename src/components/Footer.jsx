import React from 'react';

const YoutubeIcon = ({ size = 16, className = '' }) => (
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

export default function Footer({ settings }) {
  const salonName = settings?.salon_name || 'Sachi Saloon';
  const youtubeUrl = settings?.youtube_url || 'https://youtube.com/@sachisaloon?si=jY9UeghTp3zNAbAV';
  const whatsappNumber = settings?.whatsapp || '+94-742892528';
  const cleanNum = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNum}`;

  const handleNavClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="Sachi Saloon" className="footer-logo-img" />
            <span>{salonName}</span>
          </div>
          <p className="footer-brand-desc">
            Luxury grooming and styling services for the modern gentleman. Elevate your look and confidence with our master craftsmanship.
          </p>
          <div className="footer-socials">
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon youtube" aria-label="YouTube Channel">
              <YoutubeIcon size={16} />
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon whatsapp" aria-label="WhatsApp Chat">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.498 1.452 5.411 1.453 5.441 0 9.868-4.42 9.872-9.853.002-2.63-1.013-5.101-2.859-6.95S14.886 1.83 12.252 1.83c-5.442 0-9.87 4.42-9.874 9.855-.001 2.015.528 3.986 1.533 5.727L2.915 21.1l3.732-.946zm11.367-5.992c-.3-.15-1.772-.875-2.046-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-3.519-1.758-4.996-3.697-5.59-4.718-.3-.518-.03-.8.23-1.058.233-.233.518-.6.777-.9.259-.3.346-.5.519-.84.173-.34.086-.639-.043-.9-.129-.26-1.172-2.825-1.605-3.87-.422-1.015-.848-.878-1.171-.894-.3-.016-.644-.019-.988-.019-.344 0-.903.129-1.375.644-.472.516-1.804 1.764-1.804 4.301 0 2.538 1.848 4.979 2.106 5.323.258.344 3.637 5.553 8.81 7.78 1.23.53 2.19.847 2.937 1.083 1.236.393 2.362.338 3.25.205.99-.148 2.046-.835 2.333-1.644.287-.808.287-1.503.201-1.644-.087-.14-.316-.215-.616-.365z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Navigation</h3>
          <ul>
            <li><button onClick={() => handleNavClick('home')}>Home</button></li>
            <li><button onClick={() => handleNavClick('about')}>About</button></li>
            <li><button onClick={() => handleNavClick('services')}>Services</button></li>
            <li><button onClick={() => handleNavClick('gallery')}>Gallery</button></li>
            <li><button onClick={() => handleNavClick('pricing')}>Pricing</button></li>
            <li><button onClick={() => handleNavClick('booking')}>Booking</button></li>
            <li><button onClick={() => handleNavClick('contact')}>Contact</button></li>
          </ul>
        </div>

        <div className="footer-hours">
          <h3>Business Hours</h3>
          <p className="footer-hours-val" style={{ whiteSpace: 'pre-line' }}>{settings?.opening_hours || 'Mon - Sun: 9:00 AM - 8:00 PM'}</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} {salonName}. All rights reserved.</p>
          <div className="footer-watermark">
            <span>Powered by</span>
            <a href="https://github.com/harshaboy585-hash" target="_blank" rel="noopener noreferrer">
              <img src="/toolcorex.jpg" alt="TOOLCOREX Logo" className="watermark-logo" />
              <span className="watermark-brand">TOOLCOREX</span>
            </a>
          </div>
          <p className="footer-author">Designed with excellence</p>
        </div>
      </div>
    </footer>
  );
}
