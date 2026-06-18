import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LogOut, Calendar, Scissors, DollarSign, Image, Settings, 
  Plus, Edit, Trash2, Check, X, ShieldAlert, Upload, ExternalLink 
} from 'lucide-react';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const navigate = useNavigate();

  // Data States
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [settings, setSettings] = useState({
    id: '',
    salon_name: '',
    hero_title: '',
    hero_subtitle: '',
    about_text: '',
    phone: '',
    whatsapp: '',
    youtube_url: '',
    email: '',
    address: '',
    opening_hours: '',
    hero_image_url: ''
  });

  // Action states (Forms/Modals)
  const [serviceForm, setServiceForm] = useState({ id: '', name: '', description: '', display_order: 0, is_active: true });
  const [pricingForm, setPricingForm] = useState({ id: '', service_name: '', price: '', display_order: 0, is_active: true });
  const [combinedForm, setCombinedForm] = useState({ serviceId: '', pricingId: '', name: '', description: '', price: '', display_order: 0, is_active: true });
  const [galleryForm, setGalleryForm] = useState({ id: '', title: '', media_type: 'image', display_order: 0, is_active: true });
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryMediaUrl, setGalleryMediaUrl] = useState(''); // Text URL fallback

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Session / Auth Verification
  useEffect(() => {
    async function checkAuth() {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (!activeSession) {
        navigate('/admin/login');
      } else {
        setSession(activeSession);
        fetchDashboardData();
      }
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // 2. Fetch data based on active tab or all at once
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Bookings
      const { data: bookingsData } = await supabase.from('bookings').select('*').order('booking_date', { ascending: false });
      if (bookingsData) setBookings(bookingsData);

      // Services
      const { data: servicesData } = await supabase.from('services').select('*').order('display_order', { ascending: true });
      if (servicesData) setServices(servicesData);

      // Pricing
      const { data: pricingData } = await supabase.from('pricing').select('*').order('display_order', { ascending: true });
      if (pricingData) setPricing(pricingData);

      // Gallery
      const { data: galleryData } = await supabase.from('gallery').select('*').order('display_order', { ascending: true });
      if (galleryData) setGallery(galleryData);

      // Settings
      const { data: settingsData } = await supabase.from('site_settings').select('*').limit(1);
      if (settingsData && settingsData.length > 0) {
        const mergedSettings = {
          id: settingsData[0].id || '',
          salon_name: settingsData[0].salon_name || '',
          hero_title: settingsData[0].hero_title || '',
          hero_subtitle: settingsData[0].hero_subtitle || '',
          about_text: settingsData[0].about_text || '',
          phone: settingsData[0].phone || '',
          whatsapp: settingsData[0].whatsapp || '',
          youtube_url: settingsData[0].youtube_url || '',
          email: settingsData[0].email || '',
          address: settingsData[0].address || '',
          opening_hours: settingsData[0].opening_hours || '',
          hero_image_url: settingsData[0].hero_image_url || ''
        };
        setSettings(mergedSettings);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setErrorMsg("Failed to load database records.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const showNotification = (type, message) => {
    if (type === 'success') {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // ====================
  // BOOKINGS HANDLERS
  // ====================
  const updateBookingStatus = async (id, status) => {
    if (status === 'Completed') {
      const confirm = window.confirm(
        'Marking this booking as Completed will permanently remove it from the booking list. Do you want to continue?'
      );
      if (!confirm) {
        // User cancelled, do not change status
        return;
      }
      try {
        // Update status to Completed
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', id);
        if (updateError) throw updateError;

        // Delete the booking record
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id);
        if (deleteError) throw deleteError;

        // Remove from local state
        setBookings((prev) => prev.filter((b) => b.id !== id));
        showNotification('success', 'Booking marked Completed and removed.');
      } catch (err) {
        showNotification('error', err.message);
      }
      return;
    }

    // Existing handling for other statuses
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      showNotification('success', `Booking status updated to ${status}`);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking record?")) return;
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setBookings(prev => prev.filter(b => b.id !== id));
      showNotification('success', "Booking record deleted.");
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // ====================
  // SERVICES HANDLERS
  // ====================
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        // Edit Mode
        const { error } = await supabase.from('services').update({
          name: serviceForm.name,
          description: serviceForm.description,
          display_order: parseInt(serviceForm.display_order) || 0,
          is_active: serviceForm.is_active
        }).eq('id', editingId);

        if (error) throw error;
        showNotification('success', 'Service updated successfully');
      } else {
        // Add Mode
        const { error } = await supabase.from('services').insert([{
          name: serviceForm.name,
          description: serviceForm.description,
          display_order: parseInt(serviceForm.display_order) || 0,
          is_active: serviceForm.is_active
        }]);

        if (error) throw error;
        showNotification('success', 'Service added successfully');
      }

      setServiceForm({ id: '', name: '', description: '', display_order: 0, is_active: true });
      setEditingId(null);
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditService = (service) => {
    setEditingId(service.id);
    setServiceForm(service);
  };

  const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      showNotification('success', 'Service deleted successfully');
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // ====================
  // PRICING HANDLERS
  // ====================
  const handlePricingSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('pricing').update({
          service_name: pricingForm.service_name,
          price: pricingForm.price,
          display_order: parseInt(pricingForm.display_order) || 0,
          is_active: pricingForm.is_active
        }).eq('id', editingId);

        if (error) throw error;
        showNotification('success', 'Price updated successfully');
      } else {
        const { error } = await supabase.from('pricing').insert([{
          service_name: pricingForm.service_name,
          price: pricingForm.price,
          display_order: parseInt(pricingForm.display_order) || 0,
          is_active: pricingForm.is_active
        }]);

        if (error) throw error;
        showNotification('success', 'Price added successfully');
      }

      setPricingForm({ id: '', service_name: '', price: '', display_order: 0, is_active: true });
      setEditingId(null);
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditPricing = (price) => {
    setEditingId(price.id);
    setPricingForm(price);
  };

  const deletePricing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this price item?")) return;
    try {
      const { error } = await supabase.from('pricing').delete().eq('id', id);
      if (error) throw error;
      showNotification('success', 'Price item deleted');
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // ====================
  // COMBINED SERVICES + PRICING HANDLERS
  // ====================
  const handleCombinedSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { error: svcErr } = await supabase.from('services').update({
          name: combinedForm.name,
          description: combinedForm.description,
          display_order: parseInt(combinedForm.display_order) || 0,
          is_active: combinedForm.is_active
        }).eq('id', combinedForm.serviceId);
        if (svcErr) throw svcErr;

        if (combinedForm.pricingId) {
          const { error: priceErr } = await supabase.from('pricing').update({
            service_name: combinedForm.name,
            price: combinedForm.price,
            display_order: parseInt(combinedForm.display_order) || 0,
            is_active: combinedForm.is_active
          }).eq('id', combinedForm.pricingId);
          if (priceErr) throw priceErr;
        } else {
          const { error: priceErr } = await supabase.from('pricing').insert([{
            service_name: combinedForm.name,
            price: combinedForm.price,
            display_order: parseInt(combinedForm.display_order) || 0,
            is_active: combinedForm.is_active
          }]);
          if (priceErr) throw priceErr;
        }
        showNotification('success', 'Service & Price updated in both sections');
      } else {
        const { error: svcErr } = await supabase.from('services').insert([{
          name: combinedForm.name,
          description: combinedForm.description,
          display_order: parseInt(combinedForm.display_order) || 0,
          is_active: combinedForm.is_active
        }]);
        if (svcErr) throw svcErr;

        const { error: priceErr } = await supabase.from('pricing').insert([{
          service_name: combinedForm.name,
          price: combinedForm.price,
          display_order: parseInt(combinedForm.display_order) || 0,
          is_active: combinedForm.is_active
        }]);
        if (priceErr) throw priceErr;

        showNotification('success', 'Service & Price added to both sections');
      }

      setCombinedForm({ serviceId: '', pricingId: '', name: '', description: '', price: '', display_order: 0, is_active: true });
      setEditingId(null);
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditCombined = (item) => {
    setEditingId(item.id);
    setCombinedForm({
      serviceId: item.id,
      pricingId: item.pricingId || '',
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      display_order: item.display_order || 0,
      is_active: item.is_active !== undefined ? item.is_active : true
    });
  };

  const deleteCombined = async (serviceId, pricingId) => {
    if (!window.confirm('Are you sure you want to delete this service & price item?')) return;
    try {
      const { error: svcErr } = await supabase.from('services').delete().eq('id', serviceId);
      if (svcErr) throw svcErr;
      if (pricingId) {
        const { error: priceErr } = await supabase.from('pricing').delete().eq('id', pricingId);
        if (priceErr) throw priceErr;
      }
      showNotification('success', 'Service & Price deleted from both sections');
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // ====================
  // GALLERY HANDLERS
  // ====================
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalMediaUrl = galleryMediaUrl;

      // Handle file upload
      if (galleryFile) {
        const fileExt = galleryFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload directly to Supabase storage bucket 'gallery'
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, galleryFile);

        if (uploadError) {
          if (uploadError.message.includes('row-level security') || uploadError.message.includes('security policy') || uploadError.message.includes('Bucket not found')) {
            throw new Error(`Gallery bucket not configured. In Supabase Dashboard: Storage → New Bucket → name it 'gallery' → enable Public. Then go to Storage Policies → Add policy → Allow authenticated INSERT on bucket_id = 'gallery'.`);
          }
          throw new Error(`Storage Upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        finalMediaUrl = urlData.publicUrl;
      }

      if (!finalMediaUrl) {
        throw new Error("Please select a file or enter a public media URL.");
      }

      if (editingId) {
        const { error } = await supabase.from('gallery').update({
          media_url: finalMediaUrl,
          media_type: galleryForm.media_type,
          title: galleryForm.title,
          display_order: parseInt(galleryForm.display_order) || 0,
          is_active: galleryForm.is_active
        }).eq('id', editingId);

        if (error) throw error;
        showNotification('success', 'Gallery item updated');
      } else {
        const { error } = await supabase.from('gallery').insert([{
          media_url: finalMediaUrl,
          media_type: galleryForm.media_type,
          title: galleryForm.title,
          display_order: parseInt(galleryForm.display_order) || 0,
          is_active: galleryForm.is_active
        }]);

        if (error) throw error;
        showNotification('success', 'Gallery item added');
      }

      setGalleryForm({ id: '', title: '', media_type: 'image', display_order: 0, is_active: true });
      setGalleryFile(null);
      setGalleryMediaUrl('');
      setEditingId(null);
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteGalleryItem = async (id, url) => {
    if (!window.confirm("Are you sure you want to delete this gallery item?")) return;
    try {
      // Try to delete file from storage if it belongs to our bucket
      if (url.includes('/storage/v1/object/public/gallery/')) {
        const pathSegments = url.split('/gallery/');
        const filePath = pathSegments[pathSegments.length - 1];
        await supabase.storage.from('gallery').remove([filePath]);
      }

      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      showNotification('success', 'Gallery item removed');
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const startEditGallery = (item) => {
    setEditingId(item.id);
    setGalleryForm({
      id: item.id,
      title: item.title || '',
      media_type: item.media_type || 'image',
      display_order: item.display_order || 0,
      is_active: item.is_active !== undefined ? item.is_active : true
    });
    setGalleryMediaUrl(item.media_url || '');
  };

  // ====================
  // SETTINGS HANDLERS
  // ====================
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        salon_name: settings.salon_name,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        about_text: settings.about_text,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        youtube_url: settings.youtube_url,
        email: settings.email,
        address: settings.address,
        opening_hours: settings.opening_hours,
        hero_image_url: settings.hero_image_url
      };

      let error;
      if (settings.id) {
        const res = await supabase.from('site_settings').update(payload).eq('id', settings.id);
        error = res.error;
      } else {
        const res = await supabase.from('site_settings').insert([payload]).select();
        error = res.error;
        if (res.data && res.data.length > 0) {
          setSettings(res.data[0]);
        }
      }

      if (error) throw error;
      showNotification('success', 'Site settings saved successfully');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  // Merge services + pricing by name for the combined tab
  const combinedItems = services.map(service => {
    const match = pricing.find(p => p.service_name === service.name);
    return { ...service, price: match?.price || '', pricingId: match?.id || '' };
  });

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-navbar">
        <div className="dashboard-nav-brand">
          <Scissors size={20} className="gold-text" style={{ marginRight: '8px' }} />
          <span>Sachi Saloon Panel</span>
        </div>
        <div className="dashboard-nav-actions">
          <button onClick={handleLogout} className="btn-outline logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <button 
            className={`sidebar-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bookings'); setEditingId(null); }}
          >
            <Calendar size={18} /> Bookings
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'services-pricing' ? 'active' : ''}`}
            onClick={() => { setActiveTab('services-pricing'); setEditingId(null); setCombinedForm({ serviceId: '', pricingId: '', name: '', description: '', price: '', display_order: 0, is_active: true }); }}
          >
            <Scissors size={18} /> Services &amp; Pricing
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => { setActiveTab('gallery'); setEditingId(null); }}
          >
            <Image size={18} /> Gallery
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setEditingId(null); }}
          >
            <Settings size={18} /> Site Settings
          </button>
        </aside>

        {/* Content Area */}
        <main className="dashboard-main">
          {successMsg && <div className="toast toast-success">{successMsg}</div>}
          {errorMsg && <div className="toast toast-error"><ShieldAlert size={16} /> {errorMsg}</div>}

          {loading ? (
            <div className="dashboard-loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="tab-content animate-fade-in">
              {/* BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="admin-bookings-tab">
                  <div className="tab-header">
                    <h2>Booking Requests</h2>
                    <p>Track customer reservation logs and verify statuses.</p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="empty-state">No bookings logged in database.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Customer Name</th>
                            <th>Phone Number</th>
                            <th>Service</th>
                            <th>Booking Date</th>
                            <th>Customer Message</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking) => (
                            <tr key={booking.id}>
                              <td><strong>{booking.customer_name}</strong></td>
                              <td><a href={`tel:${booking.phone}`} className="table-link">{booking.phone}</a></td>
                              <td><span className="badge badge-service">{booking.service}</span></td>
                              <td>{new Date(booking.booking_date).toLocaleString()}</td>
                              <td className="table-text-cell">{booking.message || '-'}</td>
                              <td>
                                <select 
                                  value={booking.status} 
                                  onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                                  className={`status-select status-${booking.status?.toLowerCase()}`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td>
                                <button 
                                  onClick={() => deleteBooking(booking.id)}
                                  className="btn-action-delete"
                                  title="Delete Record"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SERVICES & PRICING — COMBINED TAB */}
              {activeTab === 'services-pricing' && (
                <div className="admin-crud-tab">
                  <div className="tab-header">
                    <h2>Manage Services &amp; Pricing</h2>
                    <p>Adding or editing here saves to both the <strong>Services</strong> and <strong>Pricing</strong> sections of your site simultaneously.</p>
                  </div>

                  <div className="crud-grid">
                    <form onSubmit={handleCombinedSubmit} className="glass-panel crud-form">
                      <h3>{editingId ? 'Edit Service &amp; Price' : 'Add Service &amp; Price'}</h3>

                      <div className="form-group">
                        <label className="form-label">Service Name</label>
                        <input
                          type="text"
                          required
                          value={combinedForm.name}
                          onChange={(e) => setCombinedForm({ ...combinedForm, name: e.target.value })}
                          placeholder="e.g. Classic Haircut"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          rows="3"
                          value={combinedForm.description}
                          onChange={(e) => setCombinedForm({ ...combinedForm, description: e.target.value })}
                          placeholder="Service details..."
                          className="form-input"
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Price</label>
                        <input
                          type="text"
                          required
                          value={combinedForm.price}
                          onChange={(e) => setCombinedForm({ ...combinedForm, price: e.target.value })}
                          placeholder="e.g. LKR 1,500"
                          className="form-input"
                        />
                      </div>

                      <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1', marginBottom: '0' }}>
                          <label className="form-label">Display Order</label>
                          <input
                            type="number"
                            value={combinedForm.display_order}
                            onChange={(e) => setCombinedForm({ ...combinedForm, display_order: e.target.value })}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '24px', marginBottom: '0' }}>
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={combinedForm.is_active}
                              onChange={(e) => setCombinedForm({ ...combinedForm, is_active: e.target.checked })}
                            />
                            Is Active?
                          </label>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" disabled={saving} className="btn-gold">
                          {saving ? 'Saving...' : editingId ? 'Update Service & Price' : 'Add to Both Sections'}
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => { setEditingId(null); setCombinedForm({ serviceId: '', pricingId: '', name: '', description: '', price: '', display_order: 0, is_active: true }); }}
                            className="btn-outline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="crud-list-wrapper">
                      <h3>Services &amp; Prices</h3>
                      <div className="crud-list">
                        {combinedItems.length === 0 && (
                          <div className="empty-state">No services yet. Use the form to add your first service.</div>
                        )}
                        {combinedItems.map((item) => (
                          <div key={item.id} className={`crud-item ${!item.is_active ? 'item-inactive' : ''}`}>
                            <div className="crud-item-details">
                              <h4>{item.name} <span className="order-badge">#{item.display_order}</span></h4>
                              <p>{item.description || 'No description provided.'}</p>
                              {item.price && <p className="price-tag">{item.price}</p>}
                              {!item.is_active && <span className="badge-status-off">Inactive</span>}
                            </div>
                            <div className="crud-item-actions">
                              <button onClick={() => startEditCombined(item)} className="btn-icon-edit" title="Edit"><Edit size={16} /></button>
                              <button onClick={() => deleteCombined(item.id, item.pricingId)} className="btn-icon-delete" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GALLERY TAB */}
              {activeTab === 'gallery' && (
                <div className="admin-gallery-tab">
                  <div className="tab-header">
                    <h2>Manage Saloon Gallery</h2>
                  </div>

                  <div className="gallery-dashboard-grid">
                    <form onSubmit={handleGallerySubmit} className="glass-panel gallery-upload-form">
                      <h3>{editingId ? 'Edit Gallery Item' : 'Upload / Add Media'}</h3>
                      
                      <div className="form-group">
                        <label className="form-label">Media Title</label>
                        <input 
                          type="text" 
                          value={galleryForm.title} 
                          onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} 
                          placeholder="e.g. Modern Haircut Style"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Media Type</label>
                        <select 
                          value={galleryForm.media_type} 
                          onChange={(e) => setGalleryForm({ ...galleryForm, media_type: e.target.value })} 
                          className="form-input"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Upload Local File (Supabase Storage)</label>
                        <div className="upload-input-wrapper">
                          <Upload className="upload-icon" size={16} />
                          <input 
                            type="file" 
                            accept={galleryForm.media_type === 'image' ? 'image/*' : 'video/*'}
                            onChange={(e) => setGalleryFile(e.target.files[0])}
                            className="file-selector"
                          />
                        </div>
                        <p className="form-help-text">Directly stores media in your public Supabase Storage bucket.</p>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Or External Media URL (Fallback)</label>
                        <input 
                          type="url" 
                          value={galleryMediaUrl} 
                          onChange={(e) => setGalleryMediaUrl(e.target.value)} 
                          placeholder="https://images.unsplash.com/... or cloud link"
                          className="form-input"
                        />
                      </div>

                      <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1', marginBottom: '0' }}>
                          <label className="form-label">Display Order</label>
                          <input 
                            type="number" 
                            value={galleryForm.display_order} 
                            onChange={(e) => setGalleryForm({ ...galleryForm, display_order: e.target.value })} 
                            className="form-input"
                          />
                        </div>

                        <div className="form-group" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '24px', marginBottom: '0' }}>
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={galleryForm.is_active} 
                              onChange={(e) => setGalleryForm({ ...galleryForm, is_active: e.target.checked })} 
                            />
                            Is Active?
                          </label>
                        </div>
                      </div>

                      <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" disabled={saving} className="btn-gold" style={{ flex: 1 }}>
                          {saving ? (galleryFile ? 'Uploading...' : 'Saving...') : (editingId ? 'Update Item' : 'Add to Gallery')}
                        </button>
                        {editingId && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingId(null);
                              setGalleryForm({ id: '', title: '', media_type: 'image', display_order: 0, is_active: true });
                              setGalleryFile(null);
                              setGalleryMediaUrl('');
                            }}
                            className="btn-outline"
                            style={{ flex: 1 }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="gallery-admin-list">
                      <h3>Gallery Assets</h3>
                      <div className="gallery-grid-admin">
                        {gallery.map((item) => (
                          <div key={item.id} className="gallery-card-admin glass-panel">
                            {item.media_type === 'video' ? (
                              <video src={item.media_url} className="gallery-admin-thumb" muted />
                            ) : (
                              <img src={item.media_url} alt={item.title} className="gallery-admin-thumb" />
                            )}
                            <div className="gallery-admin-info">
                              <h4>{item.title || 'Untitled'}</h4>
                              <span className="order-badge">#{item.display_order}</span>
                              <span className="badge-media-type">{item.media_type}</span>
                              <div className="gallery-admin-actions">
                                <a href={item.media_url} target="_blank" rel="noopener noreferrer" className="btn-open-link"><ExternalLink size={14} /></a>
                                <button onClick={() => startEditGallery(item)} className="btn-edit-item" style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title="Edit"><Edit size={14} /></button>
                                <button onClick={() => deleteGalleryItem(item.id, item.media_url)} className="btn-delete-item"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="admin-settings-tab">
                  <div className="tab-header">
                    <h2>Website Global Settings</h2>
                    <p>Modify salon metadata, social URLs, opening details, and landing text.</p>
                  </div>

                  <form onSubmit={handleSettingsSubmit} className="glass-panel settings-form">
                    <div className="settings-section-form">
                      <h3>1. General Identity</h3>
                      <div className="form-row-grid">
                        <div className="form-group">
                          <label className="form-label">Salon Name</label>
                          <input 
                            type="text" 
                            name="salon_name" 
                            required 
                            value={settings.salon_name} 
                            onChange={handleSettingsChange} 
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Hero Title</label>
                          <input 
                            type="text" 
                            name="hero_title" 
                            required 
                            value={settings.hero_title} 
                            onChange={handleSettingsChange} 
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Hero Subtitle</label>
                        <input 
                          type="text" 
                          name="hero_subtitle" 
                          required 
                          value={settings.hero_subtitle} 
                          onChange={handleSettingsChange} 
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Hero Background Image URL</label>
                        <input 
                          type="url" 
                          name="hero_image_url" 
                          required 
                          value={settings.hero_image_url} 
                          onChange={handleSettingsChange} 
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">About Description Text</label>
                        <textarea 
                          rows="4" 
                          name="about_text" 
                          required 
                          value={settings.about_text} 
                          onChange={handleSettingsChange} 
                          className="form-input"
                        ></textarea>
                      </div>
                    </div>

                    <div className="settings-section-form" style={{ marginTop: '2rem' }}>
                      <h3>2. Contact Details & Socials</h3>
                      <div className="form-row-grid">
                        <div className="form-group">
                          <label className="form-label">Phone Label</label>
                          <input 
                            type="text" 
                            name="phone" 
                            required 
                            value={settings.phone} 
                            onChange={handleSettingsChange} 
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">WhatsApp Number (+94742892528)</label>
                          <input 
                            type="text" 
                            name="whatsapp" 
                            required 
                            value={settings.whatsapp} 
                            onChange={handleSettingsChange} 
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-row-grid">
                        <div className="form-group">
                          <label className="form-label">YouTube URL</label>
                          <input 
                            type="url" 
                            name="youtube_url" 
                            required 
                            value={settings.youtube_url} 
                            onChange={handleSettingsChange} 
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email Address</label>
                          <input 
                            type="email" 
                            name="email" 
                            required 
                            value={settings.email} 
                            onChange={handleSettingsChange} 
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Physical Address</label>
                        <input 
                          type="text" 
                          name="address" 
                          required 
                          value={settings.address} 
                          onChange={handleSettingsChange} 
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Opening Hours Text</label>
                        <textarea 
                          rows="2" 
                          name="opening_hours" 
                          required 
                          value={settings.opening_hours} 
                          onChange={handleSettingsChange} 
                          className="form-input"
                        ></textarea>
                      </div>
                    </div>

                    <button type="submit" disabled={saving} className="btn-gold" style={{ marginTop: '2rem', padding: '1rem 2rem' }}>
                      {saving ? 'Updating Settings...' : 'Save Site Settings'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
