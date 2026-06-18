import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Check, X, Clock, Calendar as CalendarIcon } from 'lucide-react';

export default function TrackAppointment() {
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Realtime subscription reference
  const [subscription, setSubscription] = useState(null);

  const fetchBooking = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
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
        // Set up realtime listener for this phone
        const channel = supabase
          .channel('public:bookings_' + phone)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings', filter: `phone=eq.${phone}` },
            payload => {
              // payload.new contains the updated row
              if (payload.new && payload.new.id === data[0].id) {
                setBooking(payload.new);
              }
            }
          )
          .subscribe();
        // Clean old subscription
        if (subscription) {
          supabase.removeChannel(subscription);
        }
        setSubscription(channel);
      } else {
        setBooking(null);
        setError('No booking found for this phone number.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch booking.');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount or phone change
  useEffect(() => {
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [subscription]);

  const getStatusBadge = status => {
    const colors = {
      Pending: 'var(--color-gold)',
      Confirmed: 'green',
      Completed: 'blue',
      Cancelled: 'red',
    };
    const bg = colors[status] || 'gray';
    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: bg,
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <section className="track-appointment-section section-py">
      <div className="container">
        <h2 className="section-title text-center">Track Your Appointment</h2>
        <div className="track-form glass-panel" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="track-phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="track-phone"
              className="form-input"
              placeholder="e.g. 0711234567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <button
            className="btn-gold"
            onClick={fetchBooking}
            disabled={loading || !phone}
            style={{ width: '100%' }}
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
        {error && !booking && (
          <p className="error-msg" style={{ color: 'var(--color-gold)', textAlign: 'center', marginTop: '1rem' }}>{error}</p>
        )}
        {booking && (
          <div className="booking-card glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>{booking.customer_name}</h3>
            <p style={{ margin: '0.25rem 0' }}>Service: {booking.service}</p>
            <p style={{ margin: '0.25rem 0' }}>
              Date & Time: {new Date(booking.booking_date).toLocaleString()}
            </p>
            <div style={{ marginTop: '0.5rem' }}>{getStatusBadge(booking.status)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
