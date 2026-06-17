import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header({ settings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const salonName = settings?.salon_name || 'Sachi Saloon';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + sectionId);
    } else {
      const id = sectionId.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { name: 'Home', id: '#home' },
    { name: 'About', id: '#about' },
    { name: 'Services', id: '#services' },
    { name: 'Gallery', id: '#gallery' },
    { name: 'Pricing', id: '#pricing' },
    { name: 'Booking', id: '#booking' },
    { name: 'Contact', id: '#contact' }
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container container">
        <Link to="/" className="logo-wrapper" onClick={() => handleNavClick('#home')}>
          <img src="/logo.png" alt="Sachi Saloon Logo" className="header-logo-img" />
          <span className="logo-text">{salonName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.id)}
              className="nav-link"
            >
              {item.name}
            </button>
          ))}
          <Link to="/admin" className="btn-outline admin-header-btn">
            Admin Panel
          </Link>
        </nav>

        {/* Mobile Navigation Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          {/* Logo in mobile drawer */}
          <div className="mobile-drawer-logo">
            <img src="/logo.png" alt="Sachi Saloon" className="mobile-drawer-logo-img" />
          </div>
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.id)}
              className="mobile-nav-link"
            >
              {item.name}
            </button>
          ))}
          <Link to="/admin" className="mobile-nav-link admin-link" onClick={() => setIsOpen(false)}>
            Admin Panel
          </Link>
        </nav>
      </div>
    </header>
  );
}
