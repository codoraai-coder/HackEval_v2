



import React, { useState } from 'react';
import { Lock, Mail, Loader, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Login failed');
      }

      // Extract data from the response structure
      const responseData = data.data || data;
      const { accessToken, refreshToken, user } = responseData;

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      // Store tokens and user info
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('authUser', JSON.stringify(user || { email: formData.email }));
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userEmail', formData.email);
      
      // Call the parent callback with user info
      onLogin({ 
        email: formData.email, 
        userType: 'admin',
        token: accessToken,
        ...(user || {})
      });
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card" style={{ 
      maxWidth: '400px', 
      margin: '2rem auto',
      padding: '2rem'
    }}>
      <div className="page-header">
        <h3 className="page-title">Admin Login</h3>
        <p className="page-subtitle">Use your credentials to continue</p>
      </div>
      
      {error && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          border: '1px solid #fcc',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#666' 
            }} />
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#666' 
            }} />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        
        <div className="action-buttons" style={{ marginTop: '16px' }}>
          <button 
            type="submit" 
            className="btn-upload" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <p style={{ marginBottom: '8px', color: '#666' }}>Don't have an admin account?</p>
        <button 
          type="button" 
          className="btn-upload" 
          style={{ 
            width: '100%', 
            justifyContent: 'center',
            backgroundColor: 'transparent',
            color: '#667eea',
            border: '1px solid #667eea'
          }}
          onClick={() => window.location.href = '/admin-signup'}
        >
          Create Admin Account
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;