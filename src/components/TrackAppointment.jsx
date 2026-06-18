import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Mapping of booking status to badge colors (using inline styles to match luxury theme)
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
        // Set up realtime listener for this booking
        const bookingId = data[0].id;
        const channel = supabase
          .channel('public:bookings')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` },
            payload => {
              if (payload.new) {
                setBooking(prev => ({ ...prev, ...payload.new }));
              }
            }
          )
          .subscribe();
        // Store channel for cleanup
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

  // Cleanup realtime channel on component unmount or when phone changes
  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        setRealtimeChannel(null);
      }
    };
  }, [realtimeChannel]);

  return (
    <section className="track-appointment-section" style={{ marginTop: '2rem' }}>
      <h2 className="section-title" style={{ color: '#fff' }}>Track Your Appointment</h2>
      <div className="track-input-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="phone-input"
          style={{ padding: '0.5rem', flex: '1', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff' }}
        />
        <button
          onClick={handleTrack}
          disabled={loading}
          className="track-button"
          style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: '#d4af37', color: '#000', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </div>
      {error && <p style={{ color: '#ff4d4f' }}>{error}</p>}
      {booking && (
        <div className="booking-card" style={{ background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '8px', color: '#fff' }}>
          <p><strong>Customer Name:</strong> {booking.full_name}</p>
          <p><strong>Service:</strong> {booking.service}</p>
          <p><strong>Date & Time:</strong> {new Date(booking.start_time).toLocaleString()}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', ...statusColors[booking.status] || { background: '#999', color: '#fff' }}}>
              {booking.status}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
