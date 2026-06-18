import React from 'react';

export default function Pricing({ pricing = [] }) {
  const activePricing = pricing.filter(p => p.is_active);

  return (
    <section id="pricing" className="pricing-section section-py">
      <div className="pricing-container container">
        <div className="section-title-wrapper">
          <span className="section-subtitle">Fair & Transparent</span>
          <h2 className="section-title">Our Service Pricing</h2>
        </div>

        <div className="pricing-menu-wrapper glass-panel">
          <div className="pricing-grid">
            {activePricing.map((item, idx) => (
              <div key={item.id || idx} className="pricing-item">
                <div className="pricing-item-header">
                  <span className="pricing-item-name">{item.service_name}</span>
                  <span className="pricing-item-dots"></span>
                  <span className="pricing-item-price">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
