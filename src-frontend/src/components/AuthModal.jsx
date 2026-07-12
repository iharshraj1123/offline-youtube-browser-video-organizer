// c:\laragon\www\youtube\src-frontend\src\components\AuthModal.jsx
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onLoginSuccess, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [description, setDescription] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('./api/index.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('description', description);
      if (profilePic) {
        formData.append('profile_pic', profilePic);
      }

      const res = await fetch('./api/index.php?action=signup', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Signup failed');
      }

      // Automatically log in after signup
      const loginRes = await fetch('./api/index.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok || loginData.error) {
        throw new Error('Account created but login failed. Please login manually.');
      }
      onLoginSuccess(loginData.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Login
          </button>
          <button 
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input 
                id="login-username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input 
                id="login-password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="auth-form signup-form-scroll">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="signup-firstname">First Name</label>
                <input 
                  id="signup-firstname"
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-lastname">Last Name</label>
                <input 
                  id="signup-lastname"
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signup-username">Username *</label>
              <input 
                id="signup-username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password *</label>
              <input 
                id="signup-password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 chars, 1 number, no spaces"
                pattern="^\S*(?=\S{6,})(?=\S*\d)\S*$"
                title="At least 6 characters, one number, and no spaces"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-bio">Bio / Description</label>
              <textarea 
                id="signup-bio"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Profile Picture</label>
              <div className="avatar-upload-preview">
                <div className="avatar-circle">
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Avatar Preview" />
                  ) : (
                    <div className="avatar-placeholder">?</div>
                  )}
                </div>
                <div className="upload-btn-wrapper">
                  <button type="button" className="btn-upload">Choose Image</button>
                  <input type="file" accept="image/*" onChange={handlePicChange} />
                </div>
              </div>
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
