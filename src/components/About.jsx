import React from 'react';
import { Award, Compass, Heart } from 'lucide-react';

export default function About({ settings }) {
  const aboutText = settings?.about_text || '';

  return (
    <section id="about" className="about-section section-py">
      <div className="about-container container">
        <div className="about-grid">
          <div className="about-image-wrapper">
            {settings?.hero_image_url && (
              <img
                src={settings.hero_image_url}
                alt="Hero Image"
                className="about-image"
              />
            )}
            {/* Removed static badge for cleaner UI */}
          </div>
          <div className="about-content">
            <span className="section-subtitle">Our Legacy</span>
            <h2 className="section-title text-left">About Sachi Saloon</h2>
            <p className="about-text-p">{aboutText}</p>
            
            <div className="about-features">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Award size={20} className="feature-icon" />
                </div>
                <div className="feature-text">
                  <h3 className="feature-title">Master Barbers</h3>
                  <p className="feature-desc">Highly skilled professionals trained in modern and classic cuts.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Compass size={20} className="feature-icon" />
                </div>
                <div className="feature-text">
                  <h3 className="feature-title">Tailored Styling</h3>
                  <p className="feature-desc">Personalized consultations to find the perfect look for your facial structure.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Heart size={20} className="feature-icon" />
                </div>
                <div className="feature-text">
                  <h3 className="feature-title">Premium Products</h3>
                  <p className="feature-desc">We use high-grade styling gels, oils, and washes that nourish your hair and skin.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
