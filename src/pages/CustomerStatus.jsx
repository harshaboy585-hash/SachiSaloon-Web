import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function CustomerStatus() {
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('phone', phone)
        .order('booking_date', { ascending: false })
        .limit(1);
      if (fetchError) throw fetchError;
      if (data && data.length > 0) {
        setBooking(data[0]);
      } else {
        setError('No booking found for this phone number.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch booking. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="customer-status-section section-py">
      <div className="container">
        <h2 className="section-title text-center">Check Your Appointment</h2>
        <form onSubmit={handleSearch} className="form-inline" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="form-input"
            style={{ flex: '0 0 250px' }}
          />
          <button type="submit" disabled={loading} className="btn-gold">
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>
        {error && <p className="error-text" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {booking && (
          <div className="booking-info card glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '1.5rem' }}>
            <h3 className="booking-title">Appointment Details</h3>
            <p><strong>Service:</strong> {booking.service}</p>
            <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleString()}</p>
            <p><strong>Status:</strong> <span className={`status-${booking.status?.toLowerCase()}`}>{booking.status}</span></p>
            {booking.message && <p><strong>Message:</strong> {booking.message}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
