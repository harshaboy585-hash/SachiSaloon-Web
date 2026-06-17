import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gallery({ gallery = [] }) {
  const defaultItems = [
    { id: 'g1', media_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800', media_type: 'image', title: 'Classic Hot Razor Shave' },
    { id: 'g2', media_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800', media_type: 'image', title: 'Hair Styling & Design' },
    { id: 'g3', media_url: 'https://images.unsplash.com/photo-1605497746444-ac9dba87400f?auto=format&fit=crop&q=80&w=800', media_type: 'image', title: 'Beard Trimming & Lining' },
    { id: 'g4', media_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800', media_type: 'image', title: 'Luxury Hair Treatment' }
  ];

  const activeItems = gallery.length > 0 ? gallery.filter(item => item.is_active) : defaultItems;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  const totalItems = activeItems.length;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
  };

  useEffect(() => {
    if (!isPaused && totalItems > 1) {
      timeoutRef.current = setTimeout(nextSlide, 4500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPaused, totalItems]);

  if (totalItems === 0) return null;

  return (
    <section id="gallery" className="gallery-section section-py">
      <div className="gallery-container container">
        <div className="section-title-wrapper">
          <span className="section-subtitle">Visual Experience</span>
          <h2 className="section-title">Our Saloon Gallery</h2>
        </div>

        <div 
          className="gallery-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="gallery-carousel-track-container">
            <div 
              className="gallery-carousel-track"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {activeItems.map((item, idx) => (
                <div key={item.id || idx} className="gallery-slide">
                  {item.media_type === 'video' ? (
                    <div className="gallery-media-container">
                      <video 
                        src={item.media_url} 
                        className="gallery-media" 
                        controls
                        muted
                        playsInline
                      />
                    </div>
                  ) : (
                    <div className="gallery-media-container">
                      <img 
                        src={item.media_url} 
                        alt={item.title || 'Sachi Saloon Style'} 
                        className="gallery-media" 
                      />
                    </div>
                  )}
                  {item.title && (
                    <div className="gallery-media-overlay">
                      <h3 className="gallery-item-title">{item.title}</h3>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          {totalItems > 1 && (
            <>
              <button 
                className="carousel-btn prev-btn" 
                onClick={prevSlide} 
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                className="carousel-btn next-btn" 
                onClick={nextSlide} 
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots list */}
              <div className="carousel-dots">
                {activeItems.map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
