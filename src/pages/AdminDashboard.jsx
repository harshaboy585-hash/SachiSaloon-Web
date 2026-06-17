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
        setSettings(settingsData[0]);
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
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
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
          display_order: parseInt(serviceForm.display_order),
          is_active: serviceForm.is_active
        }).eq('id', editingId);

        if (error) throw error;
        showNotification('success', 'Service updated successfully');
      } else {
        // Add Mode
        const { error } = await supabase.from('services').insert([{
          name: serviceForm.name,
          description: serviceForm.description,
          display_order: parseInt(serviceForm.display_order),
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
          display_order: parseInt(pricingForm.display_order),
          is_active: pricingForm.is_active
        }).eq('id', editingId);

        if (error) throw error;
        showNotification('success', 'Price updated successfully');
      } else {
        const { error } = await supabase.from('pricing').insert([{
          service_name: pricingForm.service_name,
          price: pricingForm.price,
          display_order: parseInt(pricingForm.display_order),
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

        if (uploadError) throw new Error(`Storage Upload failed: ${uploadError.message}. Make sure the bucket 'gallery' is created in Supabase with public access.`);

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
          display_order: parseInt(galleryForm.display_order),
          is_active: galleryForm.is_active
        }).eq('id', editingId);

        if (error) throw error;
        showNotification('success', 'Gallery item updated');
      } else {
        const { error } = await supabase.from('gallery').insert([{
          media_url: finalMediaUrl,
          media_type: galleryForm.media_type,
          title: galleryForm.title,
          display_order: parseInt(galleryForm.display_order),
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

  // ====================
  // SETTINGS HANDLERS
  // ====================
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings').update({
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
      }).eq('id', settings.id);

      if (error) throw error;
      showNotification('success', 'Site settings updated successfully');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

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
            className={`sidebar-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => { setActiveTab('services'); setEditingId(null); }}
          >
            <Scissors size={18} /> Services
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pricing'); setEditingId(null); }}
          >
            <DollarSign size={18} /> Pricing Menu
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

              {/* SERVICES TAB */}
              {activeTab === 'services' && (
                <div className="admin-crud-tab">
                  <div className="tab-header">
                    <h2>Manage Grooming Services</h2>
                  </div>

                  <div className="crud-grid">
                    <form onSubmit={handleServiceSubmit} className="glass-panel crud-form">
                      <h3>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
                      
                      <div className="form-group">
                        <label className="form-label">Service Name</label>
                        <input 
                          type="text" 
                          required
                          value={serviceForm.name} 
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} 
                          placeholder="e.g. Classic Haircut"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea 
                          rows="3" 
                          value={serviceForm.description} 
                          onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} 
                          placeholder="Service details..."
                          className="form-input"
                        ></textarea>
                      </div>

                      <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1', marginBottom: '0' }}>
                          <label className="form-label">Display Order</label>
                          <input 
                            type="number" 
                            value={serviceForm.display_order} 
                            onChange={(e) => setServiceForm({ ...serviceForm, display_order: e.target.value })} 
                            className="form-input"
                          />
                        </div>

                        <div className="form-group" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '24px', marginBottom: '0' }}>
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={serviceForm.is_active} 
                              onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })} 
                            />
                            Is Active?
                          </label>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" disabled={saving} className="btn-gold">
                          {saving ? 'Saving...' : editingId ? 'Update Service' : 'Insert Service'}
                        </button>
                        {editingId && (
                          <button 
                            type="button" 
                            onClick={() => { setEditingId(null); setServiceForm({ id: '', name: '', description: '', display_order: 0, is_active: true }); }}
                            className="btn-outline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="crud-list-wrapper">
                      <h3>Active Services</h3>
                      <div className="crud-list">
                        {services.map((service) => (
                          <div key={service.id} className={`crud-item ${!service.is_active ? 'item-inactive' : ''}`}>
                            <div className="crud-item-details">
                              <h4>{service.name} <span className="order-badge">#{service.display_order}</span></h4>
                              <p>{service.description || 'No description provided.'}</p>
                              {!service.is_active && <span className="badge-status-off">Inactive</span>}
                            </div>
                            <div className="crud-item-actions">
                              <button onClick={() => startEditService(service)} className="btn-icon-edit" title="Edit"><Edit size={16} /></button>
                              <button onClick={() => deleteService(service.id)} className="btn-icon-delete" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PRICING TAB */}
              {activeTab === 'pricing' && (
                <div className="admin-crud-tab">
                  <div className="tab-header">
                    <h2>Manage Pricing Menu</h2>
                  </div>

                  <div className="crud-grid">
                    <form onSubmit={handlePricingSubmit} className="glass-panel crud-form">
                      <h3>{editingId ? 'Edit Price Item' : 'Add Price Item'}</h3>
                      
                      <div className="form-group">
                        <label className="form-label">Service / Group Name</label>
                        <input 
                          type="text" 
                          required
                          value={pricingForm.service_name} 
                          onChange={(e) => setPricingForm({ ...pricingForm, service_name: e.target.value })} 
                          placeholder="e.g. Haircut & Wash"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Price Display String</label>
                        <input 
                          type="text" 
                          required
                          value={pricingForm.price} 
                          onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })} 
                          placeholder="e.g. LKR 1,500 or $35"
                          className="form-input"
                        />
                      </div>

                      <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1', marginBottom: '0' }}>
                          <label className="form-label">Display Order</label>
                          <input 
                            type="number" 
                            value={pricingForm.display_order} 
                            onChange={(e) => setPricingForm({ ...pricingForm, display_order: e.target.value })} 
                            className="form-input"
                          />
                        </div>

                        <div className="form-group" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '24px', marginBottom: '0' }}>
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={pricingForm.is_active} 
                              onChange={(e) => setPricingForm({ ...pricingForm, is_active: e.target.checked })} 
                            />
                            Is Active?
                          </label>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" disabled={saving} className="btn-gold">
                          {saving ? 'Saving...' : editingId ? 'Update Price' : 'Insert Price'}
                        </button>
                        {editingId && (
                          <button 
                            type="button" 
                            onClick={() => { setEditingId(null); setPricingForm({ id: '', service_name: '', price: '', display_order: 0, is_active: true }); }}
                            className="btn-outline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="crud-list-wrapper">
                      <h3>Active Prices</h3>
                      <div className="crud-list">
                        {pricing.map((price) => (
                          <div key={price.id} className={`crud-item ${!price.is_active ? 'item-inactive' : ''}`}>
                            <div className="crud-item-details">
                              <h4>{price.service_name} <span className="order-badge">#{price.display_order}</span></h4>
                              <p className="price-tag">{price.price}</p>
                              {!price.is_active && <span className="badge-status-off">Inactive</span>}
                            </div>
                            <div className="crud-item-actions">
                              <button onClick={() => startEditPricing(price)} className="btn-icon-edit" title="Edit"><Edit size={16} /></button>
                              <button onClick={() => deletePricing(price.id)} className="btn-icon-delete" title="Delete"><Trash2 size={16} /></button>
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
                      <h3>Upload / Add Media</h3>
                      
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

                      <button type="submit" disabled={saving} className="btn-gold" style={{ width: '100%' }}>
                        {saving ? 'Uploading...' : 'Add to Gallery'}
                      </button>
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
