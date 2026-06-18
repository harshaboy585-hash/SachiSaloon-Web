import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Badge colors matching luxury theme
const statusColors = {
  Pending: { background: '#d4af37', color: '#000' }, // Gold
  Confirmed: { background: '#28a745', color: '#fff' }, // Green
  Completed: { background: '#007bff', color: '#fff' }, // Blue
  Cancelled: { background: '#dc3545', color: '#fff' }, // Red
};

export default function TrackAppointment() {
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState(null);

  const handleTrack = async () => {
    setError('');
    setBooking(null);
    if (!phone.trim()) {
      setError('Please enter a phone number.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('id, full_name, service, start_time, status')
        .eq('phone', phone.trim())
        .order('created_at', { ascending: false })
        .limit(1);
      if (fetchError) throw fetchError;
      if (data && data.length > 0) {
        setBooking(data[0]);
        const bookingId = data[0].id;
        const channel = supabase
          .channel('public:bookings')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` }, payload => {
            if (payload.new) setBooking(prev => ({ ...prev, ...payload.new }));
          })
          .subscribe();
        setRealtimeChannel(channel);
      } else {
        setError('No booking found for this phone number.');
      }
    } catch (e) {
      setError('Error fetching booking.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        setRealtimeChannel(null);
      }
    };
  }, [realtimeChannel]);

  return (
    <section className="track-appointment-section">
      <h2 className="section-title">Track Your Appointment</h2>
      <div className="track-input-group">
        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="phone-input"
        />
        <button onClick={handleTrack} disabled={loading} className="track-button">
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {booking && (
        <div className="booking-card">
          <p><strong>Name:</strong> {booking.full_name}</p>
          <p><strong>Service:</strong> {booking.service}</p>
          <p><strong>When:</strong> {new Date(booking.start_time).toLocaleString()}</p>
          <p className="status-line">
            <strong>Status:</strong>{' '}
            <span className="status-badge" style={statusColors[booking.status]}> {booking.status} </span>
          </p>
        </div>
      )}
    </section>
  );
}
