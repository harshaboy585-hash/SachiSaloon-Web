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
          </div>
        </div>
      </div>
    </section>
  );
}
