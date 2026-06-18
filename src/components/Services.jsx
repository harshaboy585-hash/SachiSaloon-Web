import React from 'react';
import { Scissors, Sparkles, Wand2 } from 'lucide-react';

export default function Services({ services = [] }) {
  const activeServices = services.filter(s => s.is_active);

  // Custom icon map or dynamic rotation
  const getIcon = (index) => {
    const icons = [
      <Scissors className="service-card-icon" size={30} />,
      <span className="service-card-icon" style={{ display: 'inline-block', transform: 'rotate(-45deg)' }}>💈</span>,
      <Wand2 className="service-card-icon" size={30} />,
      <Sparkles className="service-card-icon" size={30} />
    ];
    return icons[index % icons.length];
  };

  return (
    <section id="services" className="services-section section-py">
      <div className="services-container container">
        <div className="section-title-wrapper">
          <span className="section-subtitle">What We Do Best</span>
          <h2 className="section-title">Our Premium Services</h2>
        </div>

        <div className="grid-cols-1-2-3">
          {activeServices.map((service, idx) => (
            <div key={service.id || idx} className="salon-card service-card">
              <div className="service-icon-outer">
                {getIcon(idx)}
              </div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
