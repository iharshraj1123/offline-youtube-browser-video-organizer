// c:\laragon\www\youtube\src-frontend\src\components\ProfileView.jsx
import React, { useState, useEffect } from 'react';
import { User, Video, MessageSquare, Edit3, Settings, Calendar, Award, Play, Loader2, Save, X } from 'lucide-react';

function formatTime(seconds) {
  const secs = parseFloat(seconds);
  if (isNaN(secs)) return '0:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const sStr = s < 10 ? '0' + s : s;
  if (h > 0) {
    const mStr = m < 10 ? '0' + m : m;
    return `${h}:${mStr}:${sStr}`;
  }
  return `${m}:${sStr}`;
}

export function ProfileView({ username, currentUser, onPlayVideoId, onUpdateUserSession }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  
  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickName, setNickName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = currentUser.name && currentUser.name.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`./api/index.php?action=get_user_card&username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setProfile(data);
      
      // Seed edit fields
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setNickName(data.user_name || '');
      setDescription(data.user_desc || '');
      setProfilePicPreview(data.user_pic || '');
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', nickName);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('description', description);
      if (password) {
        formData.append('password', password);
      }
      if (profilePic) {
        formData.append('profile_pic', profilePic);
      }

      const res = await fetch('./api/index.php?action=update_profile', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Profile update failed');
      }

      // Update parent session state
      onUpdateUserSession({
        name: data.user.user_name,
        pic: data.user.user_pic,
        privilege: data.user.privilege,
        num: data.user.user_num
      });

      // Update URL route to reflect new username if changed
      if (nickName !== username) {
        window.history.pushState(null, '', `?page=profile&user=${encodeURIComponent(nickName)}`);
      }

      setEditMode(false);
      setPassword('');
      fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <Loader2 className="animate-spin" size={40} />
        <p>Loading channel details...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-error-container">
        <h3>Channel Not Found</h3>
        <p>{error}</p>
      </div>
    );
  }

  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="native-profile-page">
      {/* Profile Header Banner */}
      <div className="profile-header-banner">
        <div className="profile-banner-blur-bg" style={{ backgroundImage: `url(${profile.user_pic})` }} />
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <img src={profile.user_pic} alt={profile.user_name} className="profile-large-avatar" />
            {isOwnProfile && !editMode && (
              <button className="edit-avatar-btn-overlay" onClick={() => setEditMode(true)}>
                <Edit3 size={16} />
              </button>
            )}
          </div>
          
          <div className="profile-header-meta">
            <h1 className="profile-display-name">
              {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}`.trim() : profile.user_name}
            </h1>
            <p className="profile-handle">@{profile.user_name}</p>
            <div className="profile-stats-row">
              <span className="profile-stat-badge karma-badge" title="Reputation Score">
                <Award size={14} /> {profile.karma} Karma
              </span>
              <span className="profile-stat-badge">
                <Video size={14} /> {profile.total_uploads} Uploads
              </span>
              <span className="profile-stat-badge">
                <MessageSquare size={14} /> {profile.total_comments} Comments
              </span>
            </div>
          </div>

          {isOwnProfile && (
            <div className="profile-header-action">
              {editMode ? (
                <button className="profile-action-btn cancel" onClick={() => { setEditMode(false); setError(''); }}>
                  <X size={16} /> Cancel
                </button>
              ) : (
                <button className="profile-action-btn edit" onClick={() => setEditMode(true)}>
                  <Settings size={16} /> Customize Channel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="profile-tabs-nav">
        <button 
          className={`profile-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <User size={16} /> Home &amp; Customize
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
        >
          <Video size={16} /> Videos ({profile.total_uploads})
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={16} /> Comment History ({profile.total_comments})
        </button>
      </div>

      {/* Tab Panels Contents */}
      <div className="profile-tab-content-panel">
        
        {/* ABOUT / SETTINGS TAB */}
        {activeTab === 'about' && (
          <div className="profile-tab-pane about-pane">
            {editMode ? (
              <form onSubmit={handleSaveProfile} className="profile-settings-form">
                <h3 className="pane-title">Edit Channel Details</h3>
                {error && <div className="form-error-msg">{error}</div>}
                
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Username / Nickname *</label>
                    <input 
                      type="text" 
                      value={nickName} 
                      onChange={(e) => setNickName(e.target.value)} 
                      placeholder="Choose username"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password (leave empty to keep current)</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Choose new password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Channel Description / Bio</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Describe your channel..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Update Channel Profile Picture</label>
                  <div className="settings-avatar-row">
                    <img src={profilePicPreview} alt="Preview Avatar" className="settings-preview-avatar" />
                    <div className="settings-pic-upload-wrapper">
                      <button type="button" className="settings-pic-upload-btn">Upload Avatar File</button>
                      <input type="file" accept="image/*" onChange={handlePicChange} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="save-settings-btn" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Channel Changes</>}
                </button>
              </form>
            ) : (
              <div className="profile-about-card">
                <div className="about-bio-col">
                  <h3 className="pane-title">About this Channel</h3>
                  <p className="profile-bio-text">{profile.user_desc}</p>
                </div>

                <div className="about-details-col">
                  <h3 className="pane-title">Channel Stats</h3>
                  <div className="channel-stats-list">
                    <div className="stat-item">
                      <Calendar size={16} />
                      <div>
                        <span className="stat-lbl">Joined Platform</span>
                        <span className="stat-detail">{formatJoinedDate(profile.joined_date)}</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <Award size={16} />
                      <div>
                        <span className="stat-lbl">Karma Score</span>
                        <span className="stat-detail">{profile.karma} points</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <Video size={16} />
                      <div>
                        <span className="stat-lbl">Total Uploads</span>
                        <span className="stat-detail">{profile.total_uploads} videos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* UPLOADS TAB */}
        {activeTab === 'uploads' && (
          <div className="profile-tab-pane uploads-pane">
            <h3 className="pane-title">Uploaded Videos</h3>
            {profile.uploads && profile.uploads.length > 0 ? (
              <div className="profile-videos-grid">
                {profile.uploads.map((vid) => {
                  const cleanTitle = (vid.vid_name || '').replace(/\.[a-zA-Z0-9]+$/, '');
                  return (
                    <div key={vid.vid_id} className="profile-video-card" onClick={() => onPlayVideoId(vid.vid_id)}>
                      <div className="profile-video-thumb-wrapper">
                        <img 
                          src={`./thumbnails/${vid.vid_id}.jpg`} 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          className="profile-video-thumb" 
                          alt={cleanTitle} 
                        />
                        <div className="profile-video-thumb-fallback" style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={24} />
                        </div>
                        <span className="profile-video-duration">{formatTime(vid.duration)}</span>
                      </div>
                      <div className="profile-video-meta">
                        <h4 className="profile-video-title" title={cleanTitle}>{cleanTitle}</h4>
                        <span className="profile-video-views">{vid.views || 0} views • {vid.upload_date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-history-msg">No videos uploaded by this channel yet.</p>
            )}
          </div>
        )}

        {/* COMMENTS HISTORY TAB */}
        {activeTab === 'comments' && (
          <div className="profile-tab-pane comments-pane">
            <h3 className="pane-title">Chronological Comment History</h3>
            {profile.comments && profile.comments.length > 0 ? (
              <div className="profile-comments-timeline">
                {profile.comments.map((com, index) => {
                  const typeLabel = com.type === 'reply' ? 'Replied to a comment' : 'Posted a comment';
                  return (
                    <div key={index} className="timeline-item">
                      <div className="timeline-badge">
                        <MessageSquare size={16} />
                      </div>
                      <div className="timeline-card">
                        <div className="timeline-header">
                          <span className="timeline-type-label">{typeLabel}</span>
                          <span className="timeline-date">{com.date} {com.time.substring(0, 5)}</span>
                        </div>
                        <p className="timeline-comment-text">"{com.text}"</p>
                        
                        {com.attachment_url && (
                          <div className="timeline-attachment-wrapper">
                            {com.attachment_type === 'video' ? (
                              <video className="timeline-att-video" src={com.attachment_url} controls preload="metadata" />
                            ) : (
                              <img className="timeline-att-img" src={com.attachment_url} alt="attachment" />
                            )}
                          </div>
                        )}

                        <div className="timeline-footer">
                          <span className="timeline-points">★ {com.points} points</span>
                          {com.vid_name && (
                            <button className="timeline-video-link" onClick={() => onPlayVideoId(com.vid_id)}>
                              on video: <strong>{com.vid_name.replace(/\.[a-zA-Z0-9]+$/, '')}</strong>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-history-msg">No comment history found for this channel.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
