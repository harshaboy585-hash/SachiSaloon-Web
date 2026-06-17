import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail } from 'lucide-react';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return (
    url &&
    key &&
    !url.includes('your-project') &&
    !url.includes('your_supabase') &&
    !key.includes('...')
  );
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/admin');
      }
    }
    checkUser();
  }, [navigate]);

  const handleLogin = async (e) => {
  e.preventDefault();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert('Invalid email or password');
  } else {
    navigate('/admin');
  }
};

  return (
    <div className="login-screen">
      <div className="login-card glass-panel animate-fade-in-up">
        {/* Logo */}
        <div className="login-header">
          <img src="/logo.png" alt="Sachi Saloon" className="login-logo-img" />
          <span className="login-subtitle">Admin Control Panel</span>
        </div>

        {!isSupabaseConfigured() && (
          <div className="login-warning-box">
            ⚠️ <strong>Supabase not configured.</strong> Add your credentials to <code>.env</code> and create an admin user in Supabase Authentication to log in.
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sachisaloon.com"
                className="form-input text-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={16} />
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input text-input"
              />
            </div>
          </div>

          {error && <div className="login-error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-gold login-submit-btn">
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="back-to-site">← Back to website</a>
        </div>
      </div>
    </div>
  );
}
