// BookingForm.jsx - Updated implementation with WhatsApp image sharing
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, User, Phone, Clipboard, MessageSquare, CheckCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import html2canvas from 'html2canvas';

export default function BookingForm({ services = [], whatsappNumber = '+94-742892528' }) {
  // Default services list
  const defaultServices = [
    'Classic Haircut',
    'Beard Trim & Razor Line',
    'Luxury Hair Coloring',
    'Premium Hair Treatment'
  ];

  const dropdownServices = services.length > 0
    ? services.filter(s => s.is_active).map(s => s.name)
    : defaultServices;

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    service: dropdownServices[0] || '',
    booking_date: null,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [waUrl, setWaUrl] = useState('');

  // Ensure a service is pre‑selected when services load asynchronously
  React.useEffect(() => {
    if (dropdownServices.length > 0 && !formData.service) {
      setFormData(prev => ({ ...prev, service: dropdownServices[0] }));
    }
  }, [services]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedDate = formData.booking_date ? new Date(formData.booking_date).toLocaleString() : '';
    const whatsappMsg = `✨ *SACHI SALOON - NEW BOOKING* ✨\n\n` +
      `👤 *Customer Name:* ${formData.customer_name}\n` +
      `📞 *Phone:* ${formData.phone}\n` +
      `✂️ *Service:* ${formData.service || dropdownServices[0]}\n` +
      `📅 *Date & Time:* ${formattedDate}\n` +
      `💬 *Message:* ${formData.message || 'None'}\n\n` +
      `Please confirm my appointment slot. Thank you!`;

    const cleanNum = whatsappNumber.replace(/[^0-9]/g, '');
    const generatedWaUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(whatsappMsg)}`;
    setWaUrl(generatedWaUrl);

    try {
      const { error: dbError } = await supabase
        .from('bookings')
        .insert([{ ...formData, service: formData.service || dropdownServices[0], status: 'Pending' }]);
      if (dbError) {
        console.warn('Supabase logging failed, proceeding with WhatsApp only', dbError);
      }
      setSuccess(true);
      await shareTicketImage();
    } catch (err) {
      console.warn('Supabase connection issue, proceeding with WhatsApp', err);
      setSuccess(true);
      window.open(generatedWaUrl, '_blank');
    } finally {
      // Reset form regardless of outcome
      setFormData({
        customer_name: '',
        phone: '',
        service: dropdownServices[0] || '',
        booking_date: null,
        message: ''
      });
      setLoading(false);
    }
  };

  const shareTicketImage = async () => {
    const ticketEl = document.getElementById('booking-ticket');
    if (!ticketEl) {
      window.open(waUrl, '_blank');
      return;
    }
    const formattedDate = formData.booking_date ? new Date(formData.booking_date).toLocaleString() : '';
    ticketEl.innerHTML = `
      <div style="font-family: Inter, sans-serif; color: #fff; background:#013220; padding:20px; border-radius:12px; width:350px; border:2px solid #D4AF37;">
        <h2 style="color:#D4AF37; margin:0 0 10px; text-align:center;">Sachi Saloon</h2>
        <p><strong>Name:</strong> ${formData.customer_name}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Service:</strong> ${formData.service || dropdownServices[0]}</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Message:</strong> ${formData.message || 'None'}</p>
      </div>`;
    try {
      const canvas = await html2canvas(ticketEl);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const file = new File([blob], 'booking.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Your Booking Confirmation', text: 'Booking details attached.' });
      } else {
        window.open(waUrl, '_blank');
      }
    } catch (e) {
      console.error(e);
      window.open(waUrl, '_blank');
    }
  };

  return (
    <section id="booking" className="booking-section section-py">
      <div className="booking-container container">
        <div className="section-title-wrapper">
          <span className="section-subtitle">Book Your Slot</span>
          <h2 className="section-title">Schedule An Appointment</h2>
        </div>
        <div className="booking-grid">
          <div className="booking-info animate-fade-in">
            <h3 className="booking-info-title">Secure Grooming Slot</h3>
            <p className="booking-info-text">Reserving your appointment online guarantees you a premium styling slot with our elite barbers.</p>
            <div className="booking-steps">
              <div className="step-point"><span className="step-num">1</span><div><h4 className="step-title">Fill Form</h4><p className="step-desc">Select service, date, and preferred time.</p></div></div>
              <div className="step-point"><span className="step-num">2</span><div><h4 className="step-title">Database Logged</h4><p className="step-desc">Your request is logged directly in our bookings dashboard.</p></div></div>
              <div className="step-point"><span className="step-num">3</span><div><h4 className="step-title">WhatsApp Verification</h4><p className="step-desc">Redirect to WhatsApp to send pre‑filled confirmation details.</p></div></div>
            </div>
          </div>
          <div className="booking-form-wrapper glass-panel">
            {success ? (
              <div className="booking-success-message">
                <CheckCircle className="success-icon" size={50} />
                <h3>Booking Request Logged!</h3>
                <p>We saved your details and opened WhatsApp to verify your slot.</p>
                <div className="booking-success-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={() => setSuccess(false)} className="btn-gold btn-success-ok">Book Another Service</button>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-btn btn-gold">WhatsApp</a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                  <label htmlFor="customer_name" className="form-label">Name</label>
                  <div className="input-with-icon"><User className="input-icon" size={16} /><input type="text" id="customer_name" name="customer_name" required value={formData.customer_name} onChange={handleChange} placeholder="Your Full Name" className="form-input text-input" /></div>
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <div className="input-with-icon"><Phone className="input-icon" size={16} /><input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} placeholder="e.g. +94742892528" className="form-input text-input" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group half-width">
                    <label htmlFor="service" className="form-label">Service</label>
                    <div className="input-with-icon"><Clipboard className="input-icon" size={16} /><select id="service" name="service" required value={formData.service} onChange={handleChange} className="form-input select-input">{dropdownServices.map((svc, i) => (<option key={i} value={svc} className="dropdown-option">{svc}</option>))}</select></div>
                  </div>
                  <div className="form-group half-width">
                    <label htmlFor="booking_date" className="form-label">Date & Time</label>
                    <div className="input-with-icon date-picker-wrapper"><Calendar className="input-icon" size={16} /><DatePicker selected={formData.booking_date ? new Date(formData.booking_date) : null} onChange={date => setFormData(p => ({ ...p, booking_date: date }))} showTimeSelect timeIntervals={15} dateFormat="Pp" placeholderText="Select date & time" className="form-input date-input" required /></div>
                    {formData.booking_date && (<p className="selected-date" style={{ marginTop: '0.5rem', color: 'var(--color-gold)' }}>Selected: {new Date(formData.booking_date).toLocaleString()}</p>)}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message / Note (Optional)</label>
                  <div className="input-with-icon textarea-icon-wrapper"><MessageSquare className="input-icon textarea-icon" size={16} /><textarea id="message" name="message" rows="3" value={formData.message} onChange={handleChange} placeholder="Preferred barber, styling instructions..." className="form-input textarea-input"></textarea></div>
                </div>
                {error && <div className="booking-error">{error}</div>}
                <button type="submit" disabled={loading} className="btn-gold btn-submit-booking">{loading ? 'Logging Booking...' : 'Book & Confirm on WhatsApp'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
      <div id="booking-ticket" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} />
    </section>
  );
}
