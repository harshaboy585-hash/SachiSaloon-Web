import React from 'react';

export default function Pricing({ pricing = [] }) {
  const defaultPricing = [
    { id: 'p1', service_name: 'Haircut & Wash', price: 'LKR 1,500' },
    { id: 'p2', service_name: 'Beard Grooming & Shape', price: 'LKR 1,000' },
    { id: 'p3', service_name: 'Hair Coloring', price: 'LKR 2,500' },
    { id: 'p4', service_name: 'Shave & Facial', price: 'LKR 2,000' },
    { id: 'p5', service_name: 'Combo (Cut + Shave)', price: 'LKR 2,300' }
  ];

  const activePricing = pricing.length > 0 ? pricing.filter(p => p.is_active) : defaultPricing;

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
