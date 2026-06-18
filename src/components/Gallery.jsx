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

  const getSlideStyle = (idx) => {
    let offset = idx - currentIndex;
    
    // Handle circular wrap around
    const half = Math.floor(totalItems / 2);
    if (offset > half) {
      offset -= totalItems;
    } else if (offset < -half) {
      offset += totalItems;
    }
    
    const absOffset = Math.abs(offset);
    
    // If the card is too far away, hide it or keep it transitionable
    if (absOffset > 2) {
      return {
        opacity: 0,
        visibility: 'hidden',
        transform: `translateX(calc(-50% + ${offset * 120}px)) scale(0.5) rotateY(${offset * 35}deg)`,
        zIndex: 0,
        position: 'absolute',
        left: '50%',
        transition: 'transform 0.8s, opacity 0.8s, z-index 0.8s'
      };
    }
    
    // Calculate positioning and rotation
    const translateX = offset * 220; // Distance between cards
    const rotateY = offset * -35;    // Slanted angle facing the center (negative for right, positive for left)
    const scale = 1 - absOffset * 0.15; // Shrink as it gets further
    const zIndex = 10 - absOffset;   // Center is on top
    const opacity = 1 - absOffset * 0.25; // Fade as it gets further
    
    return {
      transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex: zIndex,
      opacity: opacity,
      visibility: 'visible',
      position: 'absolute',
      left: '50%',
      transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s, z-index 0.8s'
    };
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
  };

  useEffect(() => {
    if (!isPaused && totalItems > 1) {
      timeoutRef.current = setTimeout(nextSlide, 2000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPaused, totalItems]);

  // Touch handling for swipe
  const [touchStartX, setTouchStartX] = useState(null);
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsPaused(true);
  };
  const handleTouchEnd = (e) => {
    if (touchStartX !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
      }
    }
    setTouchStartX(null);
    setIsPaused(false);
  };

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
            <div className="gallery-carousel-track">
              {activeItems.map((item, idx) => {
                const style = getSlideStyle(idx);
                return (
                  <div 
                    key={item.id || idx} 
                    className={`gallery-slide ${idx === currentIndex ? 'active' : ''}`}
                    style={style}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {item.media_type === 'video' ? (
                      <div className="gallery-media-container">
                        <video 
                          src={item.media_url} 
                          className="gallery-media" 
                          controls={idx === currentIndex}
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
                );
              })}
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
