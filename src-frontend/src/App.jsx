// c:\laragon\www\youtube\src-frontend\src\App.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Search, Video, Compass, Folder, Newspaper,
  Tv, ListTodo, Bookmark, ChevronDown, ChevronLeft,
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, Trash2, Edit, RefreshCw, Plus, Check, Loader2,
  ThumbsUp, ThumbsDown, Info, Mic, Bell, Share2, CornerUpLeft,
  Repeat, Shuffle, Download, SkipBack, SkipForward, ListMusic, X, RotateCcw, RotateCw
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { CommentsSection } from './components/CommentsSection';
import { ProfileView } from './components/ProfileView';

// Cookie Helper
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Translate file:/// urls to relative /c:/ or /d:/ apache drives
function translateVideoUrl(url) {
  if (!url) return '';

  // Restore legacy escaped database characters
  let cleanUrl = url
    .replaceAll("!1and1!", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quote&;", "”")
    .replaceAll("&quote;", "“")
    .replaceAll("&quot;", '"')
    .replaceAll("&#43;", "+")
    .replaceAll("&#63;", "?");

  // Convert drive letters to lowercase to match Apache config aliases exactly (/d:/ vs /D:/)
  cleanUrl = cleanUrl.replace(/^file:\/\/\/([a-zA-Z]):\//i, (match, drive) => {
    return '/' + drive.toLowerCase() + ':/';
  });

  // Escape hashes inside file paths so they are not treated as URL fragments, preserving media fragments
  cleanUrl = cleanUrl.replaceAll('#', '%23');
  cleanUrl = cleanUrl.replaceAll('%23t=', '#t=');

  return cleanUrl;
}

// Convert seconds to H:MM:SS format
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const sStr = s < 10 ? '0' + s : s;
  if (h > 0) {
    const mStr = m < 10 ? '0' + m : m;
    return `${h}:${mStr}:${sStr}`;
  }
  return `${m}:${sStr}`;
}

function formatUploadDate(dateStr) {
  if (!dateStr) return '';
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }
  return dateStr;
}

export default function App() {
  // App views: 'home' | 'player' | 'crawler'
  const [currentView, setCurrentView] = useState('home');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [playingVideo, setPlayingVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentSort, setCurrentSort] = useState('recent'); // 'recent' | 'mix'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('yt_sidebar_collapsed') === 'true';
  });

  // Playlists States
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(-1);
  const [playlistView, setPlaylistView] = useState(null);

  // Mobile UI States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(() => localStorage.getItem('yt_theater_mode') === 'true');

  // Search Suggestions states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const suggestionsContainerRef = useRef(null);

  // User details from cookies
  const [user, setUser] = useState(() => {
    const name = getCookie('loggedusername') || null;
    const pic = getCookie('loggeduserpic') || './Userdatabase/ProfilePic/defaulta.jpg';
    const privilege = getCookie('loggeduserprivilege') || 'USER';
    const num = getCookie('loggedusernum') ? parseInt(getCookie('loggedusernum')) : null;
    return { name, pic, privilege, num };
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const userDropdownRef = useRef(null);

  // Global Flash Notification States
  const [showNotification, setShowNotification] = useState('');
  const [notifKey, setNotifKey] = useState(0);
  const notificationTimeoutRef = useRef(null);

  const showFlashNotification = (text) => {
    setShowNotification(text);
    setNotifKey(prev => prev + 1);

    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    if (text) {
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification('');
      }, 1800);
    }
  };

  // Fetch video details and set to play (used on URL load & popstate)
  const fetchVideoAndPlay = async (videoId, updateUrl = false) => {
    setLoading(true);
    try {
      const res = await fetch(`./api/index.php?action=video&id=${videoId}`);
      const data = await res.json();
      if (data && !data.error) {
        if (updateUrl) {
          window.history.pushState(null, '', `?v=${videoId}`);
        }
        setPlayingVideo(data);
        setCurrentView('player');
      } else {
        setCurrentView('home');
        setPlayingVideo(null);
        fetchVideos();
      }
    } catch (e) {
      console.error('Error fetching video details:', e);
      setCurrentView('home');
      setPlayingVideo(null);
      fetchVideos();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Read session cookies if available
    const name = getCookie('loggedusername') || null;
    const pic = getCookie('loggeduserpic') || './Userdatabase/ProfilePic/defaulta.jpg';
    const privilege = getCookie('loggeduserprivilege') || 'USER';
    const num = getCookie('loggedusernum') ? parseInt(getCookie('loggedusernum')) : null;
    setUser({ name, pic, privilege, num });

    fetchVideos();
    fetchPlaylists();

    // Check URL parameters on mount
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    const page = params.get('page');
    const userParam = params.get('user');

    if (videoId) {
      fetchVideoAndPlay(videoId);
    } else if (page === 'crawler') {
      setCurrentView('crawler');
    } else if (page === 'profile' && userParam) {
      setProfileUsername(userParam);
      setCurrentView('profile');
    } else {
      setCurrentView('home');
    }

    // Popstate listener (for browser back/forward buttons)
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const vId = p.get('v');
      const pg = p.get('page');
      const usr = p.get('user');

      if (vId) {
        fetchVideoAndPlay(vId);
      } else if (pg === 'crawler') {
        setCurrentView('crawler');
        setPlayingVideo(null);
      } else if (pg === 'profile' && usr) {
        setProfileUsername(usr);
        setCurrentView('profile');
        setPlayingVideo(null);
      } else {
        setCurrentView('home');
        setPlayingVideo(null);
        fetchVideos();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // Debounced search suggestions fetcher
  useEffect(() => {
    setActiveSuggestionIndex(-1);
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`./api/index.php?action=search_suggestions&q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (e) {
        console.error('Error fetching suggestions:', e);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const scrollSuggestionIntoView = (index) => {
    const container = suggestionsContainerRef.current;
    if (!container) return;
    const items = container.querySelectorAll('.suggestion-item');
    const activeItem = items[index];
    if (!activeItem) return;

    const containerHeight = container.clientHeight;
    const containerScrollTop = container.scrollTop;
    const itemHeight = activeItem.clientHeight;
    const itemOffsetTop = activeItem.offsetTop;

    if (itemOffsetTop + itemHeight > containerScrollTop + containerHeight) {
      container.scrollTop = itemOffsetTop + itemHeight - containerHeight;
    } else if (itemOffsetTop < containerScrollTop) {
      container.scrollTop = itemOffsetTop;
    }
  };

  const handleSearchInputKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => {
        const nextIdx = (prev + 1) % suggestions.length;
        setTimeout(() => scrollSuggestionIntoView(nextIdx), 0);
        return nextIdx;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => {
        const nextIdx = (prev - 1 + suggestions.length) % suggestions.length;
        setTimeout(() => scrollSuggestionIntoView(nextIdx), 0);
        return nextIdx;
      });
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[activeSuggestionIndex];
        // Don't update search input text, just play the video (user request)
        fetchVideoAndPlay(selected.vid_id, true);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Global keydown hotkey listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      // '/' focuses the search input
      if (e.code === 'Slash' || e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          setMobileSearchActive(true);
          setTimeout(() => {
            searchInput.focus();
          }, 50);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (activePlaylist) {
      const updated = playlists.find(p => p.id === activePlaylist.id);
      if (updated) {
        setActivePlaylist(updated);
      }
    }
  }, [playlists]);

  useEffect(() => {
    if (currentView === 'player' && isTheaterMode) {
      setIsSidebarCollapsed(true);
    } else {
      const saved = localStorage.getItem('yt_sidebar_collapsed') === 'true';
      setIsSidebarCollapsed(saved);
    }
  }, [currentView, isTheaterMode]);



  // Fetch Videos
  const fetchVideos = async (q = '', category = 'all', sort = 'recent') => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: 'videos',
        q,
        category,
        sort
      });
      const res = await fetch(`./api/index.php?${queryParams.toString()}`);
      const data = await res.json();
      setVideos(data);
    } catch (e) {
      console.error('Error fetching videos:', e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVideos(searchQuery, activeCategory, currentSort);
    setMobileSearchActive(false);
  };

  const handlePillSelect = (category, sort) => {
    setActiveCategory(category);
    setCurrentSort(sort);
    fetchVideos(searchQuery, category, sort);
  };

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('./api/index.php?action=playlists');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlaylists(data);
      }
    } catch (e) {
      console.error('Error fetching playlists:', e);
    }
  };

  const createPlaylist = async (name) => {
    try {
      const res = await fetch('./api/index.php?action=create_playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.status === 'success') {
        await fetchPlaylists();
        showFlashNotification(`Created playlist: ${name}`);
        return data;
      } else {
        showFlashNotification(`Error: ${data.message || 'failed'}`);
      }
    } catch (e) {
      console.error('Error creating playlist:', e);
    }
  };

  const deletePlaylist = async (id) => {
    try {
      const res = await fetch('./api/index.php?action=delete_playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        await fetchPlaylists();
        if (playlistView && playlistView.id === id) {
          handleGoHome();
        }
        showFlashNotification('Playlist deleted');
      }
    } catch (e) {
      console.error('Error deleting playlist:', e);
    }
  };

  const addVideoToPlaylist = async (playlistId, vidId) => {
    try {
      const res = await fetch('./api/index.php?action=add_to_playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_id: playlistId, vid_id: vidId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        await fetchPlaylists();
        showFlashNotification('Added to playlist');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeVideoFromPlaylist = async (playlistId, vidId) => {
    try {
      const res = await fetch('./api/index.php?action=remove_from_playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_id: playlistId, vid_id: vidId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        await fetchPlaylists();
        showFlashNotification('Removed from playlist');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('./api/index.php?action=logout');
      const data = await res.json();
      if (data.status === 'success') {
        setUser({
          name: null,
          pic: './Userdatabase/ProfilePic/defaulta.jpg',
          privilege: 'USER',
          num: null
        });
        setShowUserDropdown(false);
        showFlashNotification('Logged out successfully!');
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const updatePlaylistOrder = async (playlistId, videoIds) => {
    try {
      await fetch('./api/index.php?action=update_playlist_videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_id: playlistId, video_ids: videoIds })
      });
      await fetchPlaylists();
    } catch (e) {
      console.error(e);
    }
  };

  // Load a video for playing
  const handlePlayVideo = async (video, keepMiniPlayer = false) => {
    const shouldKeepMini = keepMiniPlayer;

    // Update browser history URL if NOT keeping in miniplayer
    if (!shouldKeepMini) {
      window.history.pushState(null, '', `?v=${video.vid_id}`);
    }
    localStorage.setItem('yt_last_playing_video_id', video.vid_id);

    try {
      const res = await fetch(`./api/index.php?action=video&id=${video.vid_id}`);
      const data = await res.json();
      setPlayingVideo(data);
      if (!shouldKeepMini) {
        setCurrentView('player');
        window.scrollTo(0, 0);
      }

      // Increment views in DB
      await fetch('./api/index.php?action=add_view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid_id: video.vid_id })
      });
    } catch (e) {
      console.error('Error fetching video details:', e);
    }
  };

  const playRandomVideo = async (keepMiniPlayer = false) => {
    try {
      const res = await fetch('./api/index.php?action=random_video');
      const data = await res.json();
      if (data && data.vid_id) {
        handlePlayVideo(data, keepMiniPlayer);
      }
    } catch (e) {
      console.error('Error fetching random video:', e);
    }
  };

  // Trigger home redirect
  const handleGoHome = () => {
    window.history.pushState(null, '', window.location.pathname);
    setCurrentView('home');
    fetchVideos();
  };

  // Trigger crawler redirect
  const handleGoToCrawler = () => {
    window.history.pushState(null, '', '?page=crawler');
    setCurrentView('crawler');
  };

  // Trigger profile page redirect
  const handleGoToProfile = (username, updateUrl = true) => {
    setProfileUsername(username);
    setCurrentView('profile');
    if (updateUrl) {
      window.history.pushState(null, '', `?page=profile&user=${encodeURIComponent(username)}`);
    }
  };

  return (
    <div className="app-container">
      {/* HEADER COMPONENT */}
      <header className="main-header">
        <div className="header-left">
          <button
            className="menu-toggle-btn"
            onClick={() => {
              setIsSidebarCollapsed(prev => {
                const newVal = !prev;
                localStorage.setItem('yt_sidebar_collapsed', newVal);
                return newVal;
              });
              setMobileSidebarOpen(prev => !prev);
            }}
          >
            <Menu size={20} />
          </button>

          <div className="logo-container" style={{ cursor: 'pointer' }} onClick={handleGoHome}>
            <img
              src="./yt-logo.png"
              alt="YouTube"
              style={{ height: '24px', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>

        <div className={`header-center ${mobileSearchActive ? 'mobile-active' : ''}`}>
          {mobileSearchActive && (
            <button
              style={{ marginRight: '8px' }}
              onClick={() => setMobileSearchActive(false)}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div style={{ position: 'relative', flex: 1 }}>
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={handleSearchInputKeyDown}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    fetchVideos('', activeCategory, currentSort);
                  }}
                >
                  &times;
                </button>
              )}
              <button type="submit" className="search-submit-btn">
                <Search size={18} />
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsContainerRef} className="search-suggestions-dropdown">
                {suggestions.map((sug, index) => (
                  <div
                    key={sug.vid_id}
                    className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      fetchVideoAndPlay(sug.vid_id, true);
                      setShowSuggestions(false);
                    }}
                  >
                    <Search size={14} className="suggestion-icon" />
                    <span>{sug.vid_name.replace(/\.[a-zA-Z0-9]+$/, '')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="voice-search-btn">
            <Mic size={18} />
          </button>
        </div>

        <div className="header-right">
          <button
            className="header-icon-btn d-mobile-only"
            style={{ display: mobileSearchActive ? 'none' : '' }}
            onClick={() => setMobileSearchActive(true)}
          >
            <Search size={20} />
          </button>
          <button
            className="header-icon-btn"
            onClick={handleGoToCrawler}
            title="Crawl Folders"
          >
            <Plus size={20} />
          </button>
          <button
            className="header-icon-btn"
            onClick={() => {
              // Rando song helper
              if (videos.length > 0) {
                const randIndex = Math.floor(Math.random() * videos.length);
                handlePlayVideo(videos[randIndex]);
              }
            }}
            title="Play Random Video"
          >
            <RefreshCw size={20} />
          </button>
          <button className="header-icon-btn" title="Notifications">
            <Bell size={20} />
          </button>
          <div ref={userDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              className="header-avatar-btn"
              onClick={() => {
                if (user.name) {
                  setShowUserDropdown(!showUserDropdown);
                } else {
                  setAuthModalTab('login');
                  setShowAuthModal(true);
                }
              }}
              title={user.name ? `Logged in as ${user.name}` : "Sign In"}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <img src={user.pic} alt="Channel" className="user-avatar" />
            </button>
            {showUserDropdown && (
              <div className="user-menu-dropdown">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '13px', color: '#aaa' }}>
                  Signed in as <strong style={{ color: '#fff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</strong>
                </div>
                <button
                  className="user-menu-item"
                  onClick={() => {
                    setShowUserDropdown(false);
                    handleGoToProfile(user.name);
                  }}
                >
                  <Info size={16} /> Channel Details
                </button>
                <button className="user-menu-item" onClick={handleLogout}>
                  <CornerUpLeft size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY COMPONENT */}
      <div className="app-content">
        {/* SIDEBAR */}
        <aside className={`main-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'open-mobile' : ''} ${isTheaterMode && currentView === 'player' ? (isSidebarCollapsed ? 'theater-hidden' : 'theater-overlay') : ''}`}>

          {/* Main Nav */}
          <nav className="sidebar-nav">
            <button
              className={`sidebar-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => { handleGoHome(); setMobileSidebarOpen(false); }}
              title="Explore"
            >
              <span className="sidebar-item-icon"><Compass size={20} /></span>
              <span className="sidebar-item-label">Explore</span>
            </button>

            <button
              className={`sidebar-item ${currentView === 'player' ? 'active' : ''}`}
              onClick={() => {
                setMobileSidebarOpen(false);
                if (playingVideo) {
                  setCurrentView('player');
                } else {
                  const lastVidId = localStorage.getItem('yt_last_playing_video_id');
                  if (lastVidId) {
                    fetchVideoAndPlay(lastVidId, true);
                  }
                }
              }}
              title="Now Playing"
              disabled={!playingVideo && !localStorage.getItem('yt_last_playing_video_id')}
            >
              <span className="sidebar-item-icon"><Play size={20} /></span>
              <span className="sidebar-item-label">Now Playing</span>
            </button>

            <button
              className={`sidebar-item ${currentView === 'crawler' ? 'active' : ''}`}
              onClick={() => { handleGoToCrawler(); setMobileSidebarOpen(false); }}
              title="Crawl Folders"
            >
              <span className="sidebar-item-icon"><Folder size={20} /></span>
              <span className="sidebar-item-label">Crawl Folders</span>
            </button>

            <a href="/" className="sidebar-item" title="Local Server">
              <span className="sidebar-item-icon"><Tv size={20} /></span>
              <span className="sidebar-item-label">Local Server</span>
            </a>
          </nav>

          <div className="sidebar-divider" />

          {/* Workspace Nav */}
          <div className="sidebar-section-label">Workspace</div>
          <nav className="sidebar-nav">
            <a href="/Explorer/" className="sidebar-item" title="Explorer">
              <span className="sidebar-item-icon"><Folder size={20} /></span>
              <span className="sidebar-item-label">Explorer</span>
            </a>
            <a href="#" className="sidebar-item" title="Journal">
              <span className="sidebar-item-icon"><Newspaper size={20} /></span>
              <span className="sidebar-item-label">Journal</span>
            </a>
            <a href="#" className="sidebar-item" title="To Do">
              <span className="sidebar-item-icon"><ListTodo size={20} /></span>
              <span className="sidebar-item-label">To Do</span>
            </a>
            <a href="#" className="sidebar-item" title="Favorites">
              <span className="sidebar-item-icon"><Bookmark size={20} /></span>
              <span className="sidebar-item-label">Favorites</span>
            </a>
          </nav>

          <div className="sidebar-divider" />

          {/* Playlists Nav */}
          <div className="sidebar-section-label">Playlists</div>
          <nav className="sidebar-nav">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                className={`sidebar-item ${currentView === 'playlist' && playlistView?.id === pl.id ? 'active' : ''}`}
                onClick={() => {
                  setPlaylistView(pl);
                  setCurrentView('playlist');
                  setMobileSidebarOpen(false);
                }}
                title={pl.playlist_name}
              >
                <span className="sidebar-item-icon"><ListMusic size={20} /></span>
                <span className="sidebar-item-label">{pl.playlist_name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Sidebar overlay backdrop in Theater Mode */}
        {isTheaterMode && currentView === 'player' && !isSidebarCollapsed && (
          <div
            className="theater-sidebar-backdrop"
            onClick={() => {
              setIsSidebarCollapsed(true);
              localStorage.setItem('yt_sidebar_collapsed', 'true');
            }}
            style={{
              position: 'fixed',
              top: 'var(--header-height)',
              left: 0,
              width: '100vw',
              height: 'calc(100vh - var(--header-height))',
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9990,
              backdropFilter: 'blur(2px)',
              transition: 'opacity 0.2s ease-in-out'
            }}
          />
        )}

        {/* MAIN DISPLAY CONTAINER */}
        <main className={`main-view ${currentView === 'player' ? 'player-mode' : ''} ${isSidebarCollapsed ? 'expanded-content' : ''} ${isTheaterMode && currentView === 'player' ? 'theater-mode' : ''}`}>
          {currentView === 'home' && (
            <HomeView
              videos={videos}
              loading={loading}
              activeCategory={activeCategory}
              currentSort={currentSort}
              onPillSelect={handlePillSelect}
              onPlayVideo={handlePlayVideo}
            />
          )}

          {(currentView === 'player' || playingVideo) && (
            <PlayerView
              video={playingVideo}
              onVideoDeleted={handleGoHome}
              allVideos={videos}
              onPlayVideo={(video, pl, index, keepMiniPlayer) => {
                if (pl !== undefined) setActivePlaylist(pl);
                if (index !== undefined) setCurrentPlaylistIndex(index);
                handlePlayVideo(video, keepMiniPlayer);
              }}
              isMiniPlayer={currentView !== 'player'}
              onExpand={() => {
                if (playingVideo) {
                  window.history.pushState(null, '', `?v=${playingVideo.vid_id}`);
                }
                setCurrentView('player');
                window.scrollTo(0, 0);
              }}
              onClose={() => setPlayingVideo(null)}
              isTheaterMode={isTheaterMode}
              setIsTheaterMode={setIsTheaterMode}
              isSidebarCollapsed={isSidebarCollapsed}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
              onPlayRandom={(keepMiniPlayer) => playRandomVideo(keepMiniPlayer)}
              playlists={playlists}
              activePlaylist={activePlaylist}
              setActivePlaylist={setActivePlaylist}
              currentPlaylistIndex={currentPlaylistIndex}
              setCurrentPlaylistIndex={setCurrentPlaylistIndex}
              addVideoToPlaylist={addVideoToPlaylist}
              removeVideoFromPlaylist={removeVideoFromPlaylist}
              createPlaylist={createPlaylist}
              updatePlaylistOrder={updatePlaylistOrder}
              currentUser={user}
              onOpenAuth={(tab) => { setAuthModalTab(tab || 'login'); setShowAuthModal(true); }}
              onNavigateToProfile={handleGoToProfile}
              showFlashNotification={showFlashNotification}
            />
          )}

          {currentView === 'crawler' && (
            <CrawlerView />
          )}

          {currentView === 'playlist' && playlistView && (
            <PlaylistView
              playlist={playlists.find(p => p.id === playlistView.id) || playlistView}
              allVideos={videos}
              onPlayVideo={(video, pl, index) => {
                setActivePlaylist(pl);
                setCurrentPlaylistIndex(index);
                handlePlayVideo(video);
              }}
              onRemoveVideo={removeVideoFromPlaylist}
              onReorder={updatePlaylistOrder}
              onDeletePlaylist={deletePlaylist}
              onPlayPlaylist={(pl) => {
                const listVideos = (pl.video_ids || [])
                  .map(id => videos.find(v => v.vid_id === parseInt(id)))
                  .filter(Boolean);
                if (listVideos.length > 0) {
                  setActivePlaylist(pl);
                  setCurrentPlaylistIndex(0);
                  handlePlayVideo(listVideos[0]);
                }
              }}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              username={profileUsername}
              currentUser={user}
              onPlayVideoId={(vidId) => fetchVideoAndPlay(vidId, true)}
              onUpdateUserSession={(updatedUser) => setUser(updatedUser)}
            />
          )}
        </main>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(loggedInUser) => {
            setUser({
              name: loggedInUser.user_name,
              pic: loggedInUser.user_pic,
              privilege: loggedInUser.privilege,
              num: loggedInUser.user_num
            });
            showFlashNotification(`Logged in as ${loggedInUser.user_name}!`);
          }}
          initialTab={authModalTab}
        />
      )}

      {showNotification && (
        <div key={notifKey} className="player-notification-banner">
          {showNotification}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------
// SUB-VIEW: HomeView
// ----------------------------------------
function HomeView({ videos, loading, activeCategory, currentSort, onPillSelect, onPlayVideo }) {
  const [visibleCount, setVisibleCount] = useState(24);

  const staticPills = [
    { id: 'all', label: 'all', category: 'all', sort: 'recent' },
    { id: 'oldest', label: 'oldest', category: 'all', sort: 'oldest' },
    { id: 'video_songs', label: 'video songs', category: 'video songs', sort: 'recent' },
    { id: 'downloads', label: 'downloads', category: 'downloads', sort: 'recent' },
    { id: 'hot', label: 'hot', category: 'all', sort: 'hot' },
    { id: 'most_liked', label: 'most liked', category: 'all', sort: 'likes' },
    { id: 'favourite', label: 'favourite', category: 'favourite', sort: 'recent' }
  ];

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        setVisibleCount(prev => Math.min(prev + 24, videos.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [videos]);

  // Reset infinite scroll count when filter/videos changes
  useEffect(() => {
    setVisibleCount(24);
  }, [videos]);

  const visibleVideos = videos.slice(0, visibleCount);

  return (
    <>
      {/* Category Selection Bar */}
      <div className="category-bar">
        {staticPills.map((pill) => {
          const isActive = activeCategory === pill.category && currentSort === pill.sort;
          return (
            <button
              key={pill.id}
              className={`category-pill ${isActive ? 'active' : ''}`}
              onClick={() => onPillSelect(pill.category, pill.sort)}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="video-grid">
          {[...Array(8)].map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-thumbnail"></div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="skeleton-avatar"></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton-title"></div>
                  <div className="skeleton-meta"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
          <Folder size={48} style={{ marginBottom: '12px' }} />
          <p>No video files found. Go to the Crawl Folders page to import videos!</p>
        </div>
      ) : (
        <div className="video-grid">
          {visibleVideos.map((vid) => (
            <VideoCard key={vid.vid_id} video={vid} onClick={() => onPlayVideo(vid)} />
          ))}
        </div>
      )}
    </>
  );
}

// ----------------------------------------
// SUB-COMPONENT: VideoCard
// ----------------------------------------
function VideoCard({ video, onClick }) {
  const cleanTitle = video.vid_name.replace(/\.[a-zA-Z0-9]+$/, '');
  const [duration, setDuration] = useState(video.duration || 0);
  const [hasThumbnail, setHasThumbnail] = useState(null); // null = checking, true = exists, false = needs capture
  const [isHovered, setIsHovered] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(`./thumbnails/${video.vid_id}.jpg`);

  const videoRef = useRef(null);
  const hiddenVideoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Helper to format date
  const getNiceTime = () => {
    if (!video.upload_date) return '';
    try {
      const now = new Date();
      const upload = new Date(video.upload_date + 'T' + (video.upload_time || '00:00:00'));
      const diffMs = now - upload;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffDays > 365) return Math.floor(diffDays / 365) + ' years ago';
      if (diffDays > 30) return Math.floor(diffDays / 30) + ' months ago';
      if (diffDays > 0) return diffDays + ' days ago';
      if (diffHrs > 0) return diffHrs + ' hours ago';
      if (diffMins > 0) return diffMins + ' minutes ago';
      return 'just now';
    } catch (e) {
      return video.upload_date;
    }
  };

  // Thumbnail generation from canvas
  const captureThumbnail = () => {
    const vidEl = hiddenVideoRef.current;
    if (!vidEl) return;

    vidEl.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = vidEl.videoWidth || 640;
        canvas.height = vidEl.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(vidEl, 0, 0, canvas.width, canvas.height);

        // Convert to JPG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Save thumbnail to server
        fetch('./api/index.php?action=save_thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vid_id: video.vid_id, image: dataUrl })
        }).then(() => {
          setHasThumbnail(true);
          // Append cache buster to load it immediately
          setThumbnailSrc(`./thumbnails/${video.vid_id}.jpg?t=${Date.now()}`);
        }).catch(err => {
          console.error("Failed to save client thumbnail:", err);
          setHasThumbnail(true); // Set to true to avoid loop on error
        });

        // Also backfill duration if it was 0!
        if (duration === 0) {
          const dur = Math.round(vidEl.duration);
          if (dur > 0) {
            setDuration(dur);
            fetch('./api/index.php?action=update_duration', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vid_id: video.vid_id, duration: dur })
            });
          }
        }
      } catch (err) {
        console.error('Error generating canvas thumbnail:', err);
        setHasThumbnail(true); // Fallback to avoid infinite loop
      }
    };

    vidEl.currentTime = 6;
  };

  return (
    <div
      className="video-card"
      onClick={onClick}
      onMouseEnter={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(true);
        }, 400);
      }}
      onMouseLeave={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(false);
        setVideoPlaying(false);
      }}
    >
      <div className="thumbnail-container">
        {/* If thumbnail is not verified yet, load invisible image to test if it exists */}
        {hasThumbnail === null && (
          <img
            src={thumbnailSrc}
            style={{ display: 'none' }}
            onLoad={() => setHasThumbnail(true)}
            onError={() => setHasThumbnail(false)}
            alt=""
          />
        )}

        {/* If thumbnail does not exist, load a hidden video element to capture a frame */}
        {hasThumbnail === false && (
          <video
            ref={hiddenVideoRef}
            src={translateVideoUrl(video.link)}
            style={{ display: 'none' }}
            preload="metadata"
            muted
            crossOrigin="anonymous"
            onLoadedMetadata={captureThumbnail}
          />
        )}

        {hasThumbnail === true && (
          <img
            src={thumbnailSrc}
            alt={cleanTitle}
            className="video-card-thumbnail"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: videoPlaying ? 1 : 3,
              opacity: videoPlaying ? 0 : 1,
              transition: 'opacity 0.25s ease-in-out',
              pointerEvents: 'none'
            }}
            loading="lazy"
          />
        )}

        {isHovered && (
          <video
            ref={videoRef}
            src={translateVideoUrl(video.link)}
            className="video-card-thumbnail"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 2,
              backgroundColor: '#000'
            }}
            autoPlay
            muted
            loop
            playsInline
            onPlaying={() => setVideoPlaying(true)}
          />
        )}

        {hasThumbnail !== true && !isHovered && (
          <div className="skeleton-thumbnail" style={{ height: '100%', margin: 0 }}></div>
        )}

        {duration > 0 && (
          <span className="video-card-duration">
            {formatTime(duration)}
          </span>
        )}
      </div>

      <div className="video-card-details">
        <img src={video.uploader_img} alt="" className="channel-avatar" />
        <div className="video-text-details">
          <span className="video-card-title">{cleanTitle}</span>
          <span className="video-card-channel">{video.uploader_name}</span>
          <div className="video-card-meta">
            <span>{video.views || 0} views</span>
            <span>•</span>
            <span>{getNiceTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------
// SUB-VIEW: PlayerView
// ----------------------------------------
function SidebarVideoCard({ vid, onPlayVideo }) {
  const [hasThumb, setHasThumb] = useState(null);
  const [thumbSrc, setThumbSrc] = useState(`./thumbnails/${vid.vid_id}.jpg`);

  return (
    <div className="sidebar-video-row" onClick={() => onPlayVideo(vid)}>
      <div className="sidebar-thumbnail-wrapper">
        {hasThumb === null && (
          <img
            src={thumbSrc}
            style={{ display: 'none' }}
            onLoad={() => setHasThumb(true)}
            onError={() => setHasThumb(false)}
            alt=""
          />
        )}
        {hasThumb === true ? (
          <img
            src={thumbSrc}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
            loading="lazy"
          />
        ) : (
          <video
            src={translateVideoUrl(vid.link) + '#t=5'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
            muted
            preload="metadata"
          />
        )}
        {vid.duration > 0 && (
          <span className="video-card-duration" style={{ fontSize: '10px', bottom: '4px', right: '4px' }}>
            {formatTime(vid.duration)}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <span className="sidebar-title">{vid.vid_name.replace(/\.[a-zA-Z0-9]+$/, '')}</span>
        <span className="sidebar-channel">{vid.uploader_name}</span>
        <span style={{ fontSize: '11px', color: '#aaa' }}>{vid.views || 0} views</span>
      </div>
    </div>
  );
}

function PlayerView({
  video, onVideoDeleted, allVideos, onPlayVideo, isMiniPlayer, onExpand, onClose, isTheaterMode, setIsTheaterMode, onPlayRandom,
  playlists, activePlaylist, setActivePlaylist, currentPlaylistIndex, setCurrentPlaylistIndex,
  addVideoToPlaylist, removeVideoFromPlaylist, createPlaylist, updatePlaylistOrder,
  isSidebarCollapsed, setIsSidebarCollapsed, currentUser, onOpenAuth, onNavigateToProfile, showFlashNotification
}) {
  const [likes, setLikes] = useState(parseInt(video.likes) || 0);
  const [dislikes, setDislikes] = useState(parseInt(video.dislikes) || 0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Metadata edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState(video.vid_name);
  const [editDesc, setEditDesc] = useState(video.description);
  const [editTags, setEditTags] = useState(video.tags);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Casting States
  const [showCastMenu, setShowCastMenu] = useState(false);
  const [castMode, setCastMode] = useState(null); // 'select', 'legacy', 'modern'
  const [castDevice, setCastDevice] = useState(null);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [discovering, setDiscovering] = useState(false);
  const [serverIps, setServerIps] = useState([]);
  const [selectedServerIp, setSelectedServerIp] = useState(() => localStorage.getItem('yt_cast_server_ip') || '');
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [pendingTranscodeDevice, setPendingTranscodeDevice] = useState(null);

  // Playback control states
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(parseInt(video.duration) || 0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('yt_volume') ?? '0.5'));
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom video player wrapper ref
  const playerWrapperRef = useRef(null);

  // Settings extra states
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isRandom, setIsRandom] = useState(() => localStorage.getItem('yt_random') === 'true');
  const [showStats, setShowStats] = useState(false);
  const [settingsSubmenu, setSettingsSubmenu] = useState('main'); // 'main' or 'speed'
  const [userActive, setUserActive] = useState(true);

  // Draggable position state for miniplayer
  const [miniPlayerPos, setMiniPlayerPos] = useState({ x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const volumeRef = useRef(volume);

  const handleMouseDown = (e) => {
    if (!isMiniPlayer) return;
    if (e.target.closest('button')) return; // ignore control button clicks

    e.preventDefault();
    isDragging.current = true;
    setIsDraggingState(true);
    document.body.classList.add('mini-player-dragging');
    dragStartPos.current = {
      x: e.clientX - miniPlayerPos.x,
      y: e.clientY - miniPlayerPos.y
    };

    const onMouseMove = (ev) => {
      if (!isDragging.current) return;
      const newX = ev.clientX - dragStartPos.current.x;
      const newY = ev.clientY - dragStartPos.current.y;
      setMiniPlayerPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      isDragging.current = false;
      setIsDraggingState(false);
      document.body.classList.remove('mini-player-dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Helper functions for previous and next video navigation (reused in both control bars)
  const handlePrevVideo = () => {
    if (activePlaylist && (activePlaylist.video_ids || []).length > 0) {
      const ids = activePlaylist.video_ids;
      let prevIdx = currentPlaylistIndex - 1;
      if (prevIdx < 0) prevIdx = ids.length - 1;
      const prevVid = allVideos.find(v => v.vid_id === parseInt(ids[prevIdx]));
      if (prevVid) onPlayVideo(prevVid, activePlaylist, prevIdx, isMiniPlayer);
    } else {
      const idx = allVideos.findIndex(v => v.vid_id === video.vid_id);
      if (idx > 0) onPlayVideo(allVideos[idx - 1], undefined, undefined, isMiniPlayer);
    }
  };

  const handleNextVideo = () => {
    if (activePlaylist && (activePlaylist.video_ids || []).length > 0) {
      const ids = activePlaylist.video_ids;
      let nextIdx = currentPlaylistIndex + 1;
      if (isRandom) {
        nextIdx = Math.floor(Math.random() * ids.length);
      } else if (nextIdx >= ids.length) {
        nextIdx = 0;
      }
      const nextVid = allVideos.find(v => v.vid_id === parseInt(ids[nextIdx]));
      if (nextVid) onPlayVideo(nextVid, activePlaylist, nextIdx, isMiniPlayer);
    } else if (isRandom) {
      onPlayRandom(isMiniPlayer);
    } else {
      const idx = allVideos.findIndex(v => v.vid_id === video.vid_id);
      if (idx < allVideos.length - 1) onPlayVideo(allVideos[idx + 1], undefined, undefined, isMiniPlayer);
    }
  };

  // Drag and drop queue reordering refs & handlers
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (e, position) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    if (!activePlaylist) return;
    const copyListItems = [...(activePlaylist.video_ids || [])];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;

    // Save to database
    updatePlaylistOrder(activePlaylist.id, copyListItems);
  };

  const handleIframeLoad = (e) => {
    const iframe = e.target;
    if (iframe && iframe.contentWindow) {
      try {
        const body = iframe.contentWindow.document.body;
        if (body) {
          iframe.style.height = `${body.scrollHeight}px`;
          const observer = new iframe.contentWindow.MutationObserver(() => {
            iframe.style.height = `${body.scrollHeight}px`;
          });
          observer.observe(body, { childList: true, subtree: true, attributes: true });
        }
      } catch (err) {
        console.error("Failed to auto-resize comments iframe:", err);
      }
    }
  };

  // Scrubbing/timeline drag states
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressContainerRef = useRef(null);

  // Hover preview states
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const [showHoverPreview, setShowHoverPreview] = useState(false);
  const previewCanvasRef = useRef(null);
  const previewVideoRef = useRef(null);
  const previewSeekDebounce = useRef(null);
  const lastPreviewTime = useRef(-999); // tracks last seeked preview time
  const [isVideoFocused, setIsVideoFocused] = useState(false);

  // Theater and Reverse Autoplay states
  const [isReverseAutoplay, setIsReverseAutoplay] = useState(false);


  // Keep volumeRef in sync with the volume state so the keydown closure always reads the latest value
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Expose parent seek helper for iframe comments
  useEffect(() => {
    window.seekVideoTo = (seconds) => {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds;
        setCurrentTime(seconds);
        videoRef.current.play().catch(e => console.error(e));
        setIsPlaying(true);
      }
    };
    return () => {
      delete window.seekVideoTo;
    };
  }, []);

  const parseTimestampToSeconds = (timestampStr) => {
    const parts = timestampStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const formatUPnPTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const hStr = h < 10 ? '0' + h : h;
    const mStr = m < 10 ? '0' + m : m;
    const sStr = s < 10 ? '0' + s : s;
    return `${hStr}:${mStr}:${sStr}`;
  };

  const renderDescription = (text) => {
    if (!text) return 'Enjoy!';
    const combinedRegex = /(https?:\/\/[^\s]+)|(\d{1,2}:\d{2}(?::\d{2})?)/g;
    const parts = text.split(combinedRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3ea6ff', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }

      if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(part)) {
        const seconds = parseTimestampToSeconds(part);
        return (
          <span
            key={index}
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = seconds;
                setCurrentTime(seconds);
                videoRef.current.play().catch(e => console.error(e));
                setIsPlaying(true);
                showFlashNotification(`Seek to ${part}`);
              }
            }}
            style={{ color: '#3ea6ff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {part}
          </span>
        );
      }

      return part;
    });
  };

  useEffect(() => {
    // Reset states when video changes
    setLikes(parseInt(video.likes) || 0);
    setDislikes(parseInt(video.dislikes) || 0);
    setLiked(false);
    setDisliked(false);
    setEditTitle(video.vid_name);
    setEditDesc(video.description);
    setEditTags(video.tags);
    setIsDescriptionExpanded(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(parseInt(video.duration) || 0);

    setPlaybackSpeed(1);
    setIsLooping(false);
    setShowStats(false);
    setSettingsSubmenu('main');
    showFlashNotification('');
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      if (!isMiniPlayer) {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.focus();
          }
        }, 150);
      }
    }
  }, [video]);

  // Casting Actions
  const loadServerIps = async () => {
    try {
      const res = await fetch('./api/index.php?action=get_server_ips');
      const data = await res.json();
      setServerIps(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedServerIp) {
        setSelectedServerIp(data[0]);
        localStorage.setItem('yt_cast_server_ip', data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const discoverDevices = async () => {
    setDiscovering(true);
    setDiscoveredDevices([]);
    try {
      const res = await fetch(`./api/index.php?action=cast_discover&server_ip=${encodeURIComponent(selectedServerIp)}`);
      const data = await res.json();
      setDiscoveredDevices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showFlashNotification('Failed to discover casting devices.');
    } finally {
      setDiscovering(false);
    }
  };

  const startCasting = (device) => {
    const isMp4 = video.link && video.link.toLowerCase().endsWith('.mp4');
    if (!isMp4) {
      setPendingTranscodeDevice(device);
      return;
    }
    executeCast(device);
  };

  const executeCast = async (device) => {
    setPendingTranscodeDevice(null);
    setIsTranscoding(true);

    const localHostIp = selectedServerIp || window.location.hostname;
    const translatedPath = translateVideoUrl(video.link);
    const encodedPath = translatedPath.split('/').map(seg => {
      if (seg.match(/^[a-zA-Z]:$/)) return seg;
      return encodeURIComponent(seg);
    }).join('/');

    const mediaUrl = `${window.location.protocol}//${localHostIp}${encodedPath}`;

    try {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      setCurrentTime(0);

      const setRes = await fetch(`./api/index.php?action=cast_control&server_ip=${encodeURIComponent(selectedServerIp)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          control_url: device.control_url,
          action: 'set_uri',
          media_url: mediaUrl,
          video_link: video.link,
          title: video.vid_name.replace(/\.[a-zA-Z0-9]+$/, '')
        })
      });
      const setResult = await setRes.json();

      if (setResult && setResult.status === 'success') {
        // Wait a brief moment for the TV to transition and register the new URI
        await new Promise(resolve => setTimeout(resolve, 800));

        await fetch('./api/index.php?action=cast_control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            control_url: device.control_url,
            action: 'play'
          })
        });

        setCastDevice(device);
        setIsPlaying(true);
        showFlashNotification(`Casting to ${device.name}!`);
      } else {
        showFlashNotification('Failed to connect to TV. Make sure it is on.');
      }
    } catch (e) {
      console.error(e);
      showFlashNotification('Casting error occurred.');
    } finally {
      setIsTranscoding(false);
    }
  };

  const handleRemoteControl = async (action) => {
    if (!castDevice) return;
    try {
      await fetch('./api/index.php?action=cast_control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          control_url: castDevice.control_url,
          action: action
        })
      });
      if (action === 'stop') {
        setCastDevice(null);
        setIsPlaying(false);
        showFlashNotification('Stopped casting.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoteSeek = async (seconds) => {
    if (!castDevice) return;
    try {
      const targetTime = formatUPnPTime(seconds);
      await fetch('./api/index.php?action=cast_control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          control_url: castDevice.control_url,
          action: 'seek',
          target: targetTime
        })
      });
      showFlashNotification(`Seeked to ${formatTime(seconds)}`);
    } catch (e) {
      console.error('Remote seek error:', e);
    }
  };

  // Poll TV position every 2 seconds when casting
  useEffect(() => {
    if (!castDevice || !isPlaying) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`./api/index.php?action=cast_control&server_ip=${encodeURIComponent(selectedServerIp)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            control_url: castDevice.control_url,
            action: 'get_position'
          })
        });
        const data = await res.json();
        if (isSubscribed && data && data.status === 'success') {
          const tvPos = parseInt(data.position) || 0;
          const tvDur = parseInt(data.duration) || duration;

          setCurrentTime(tvPos);
          if (videoRef.current) {
            videoRef.current.currentTime = tvPos;
          }
          if (tvDur > 0 && tvDur !== duration) {
            setDuration(tvDur);
          }

          // Auto-advance if TV video has ended (RelTime equals or exceeds TrackDuration, and TrackDuration > 0)
          if (tvDur > 0 && tvPos >= tvDur - 1) {
            clearInterval(interval);
            handleVideoEnded();
          }
        }
      } catch (e) {
        console.error('Error polling TV position:', e);
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [castDevice, isPlaying, duration, selectedServerIp]);

  // Auto-cast next video when video changes and casting is active
  const prevVideoIdRef = useRef(video.vid_id);
  useEffect(() => {
    if (castDevice && prevVideoIdRef.current !== video.vid_id) {
      startCasting(castDevice);
    }
    prevVideoIdRef.current = video.vid_id;
  }, [video.vid_id, castDevice]);

  const startModernCast = async () => {
    if (!navigator.presentation) {
      showFlashNotification('Native browser casting not supported by your browser.');
      return;
    }

    const localHostIp = selectedServerIp || window.location.hostname;
    const translatedPath = translateVideoUrl(video.link);
    const encodedPath = translatedPath.split('/').map(seg => {
      if (seg.match(/^[a-zA-Z]:$/)) return seg;
      return encodeURIComponent(seg);
    }).join('/');

    const mediaUrl = `${window.location.protocol}//${localHostIp}${encodedPath}`;
    
    const request = new PresentationRequest([mediaUrl]);
    try {
      const connection = await request.start();
      showFlashNotification('Casting session started!');
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      connection.onclose = () => {
        showFlashNotification('Casting session ended.');
      };
    } catch (e) {
      console.log('Presentation API error:', e);
      showFlashNotification('Native casting cancelled or no devices found.');
    }
  };

  // Video playback listeners
  const togglePlay = () => {
    if (castDevice) {
      if (isPlaying) {
        handleRemoteControl('pause');
        setIsPlaying(false);
      } else {
        handleRemoteControl('play');
        setIsPlaying(true);
      }
      return;
    }
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.error("Playback interrupted:", e));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isScrubbing) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);

    // If duration in DB was 0, save it!
    if (parseInt(video.duration) === 0) {
      const dur = Math.round(videoRef.current.duration);
      fetch('./api/index.php?action=update_duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid_id: video.vid_id, duration: dur })
      });
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    localStorage.setItem('yt_volume', vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    const muted = !isMuted;
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  };

  const seekToPosition = (e) => {
    if (!videoRef.current || duration === 0 || !progressContainerRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const handleProgressMouseDown = (e) => {
    setIsScrubbing(true);
    seekToPosition(e);
  };

  const handleProgressMouseMove = (e) => {
    if (!progressContainerRef.current || duration === 0) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    const targetTime = pos * duration;
    setHoverTime(targetTime);
    setHoverX(e.clientX - rect.left);
    setShowHoverPreview(true);

    // Only seek preview video if time changed by >= 2 seconds (legacy behavior)
    if (Math.abs(targetTime - lastPreviewTime.current) >= 2) {
      lastPreviewTime.current = targetTime;
      if (previewSeekDebounce.current) clearTimeout(previewSeekDebounce.current);
      previewSeekDebounce.current = setTimeout(() => {
        const pv = previewVideoRef.current;
        if (!pv) return;
        pv.currentTime = targetTime;
      }, 60);
    }
  };

  const handlePreviewMetadataLoaded = () => {
    const pv = previewVideoRef.current;
    if (pv && hoverTime !== null) {
      pv.currentTime = hoverTime;
    }
  };

  const handleProgressMouseLeave = () => {
    setShowHoverPreview(false);
  };

  useEffect(() => {
    const handleWindowMouseMove = (e) => {
      if (isScrubbing) {
        seekToPosition(e);
      }
    };

    const handleWindowMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isScrubbing, duration]);

  const toggleFullscreen = () => {
    if (!playerWrapperRef.current) return;
    if (!isFullscreen) {
      if (playerWrapperRef.current.requestFullscreen) {
        playerWrapperRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Handle wheel volume scrolling without scrolling the page
  useEffect(() => {
    const wrapper = playerWrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e) => {
      e.preventDefault();
      let change = e.deltaY < 0 ? 0.05 : -0.05;
      setVolume(prev => {
        let newVol = Math.max(0, Math.min(1, prev + change));
        newVol = Math.round(newVol * 100) / 100;
        if (videoRef.current) {
          videoRef.current.volume = newVol;
          videoRef.current.muted = newVol === 0;
        }
        setIsMuted(newVol === 0);
        showFlashNotification(`Volume: ${Math.round(newVol * 100)}%`);
        return newVol;
      });
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, [playerWrapperRef.current, videoRef.current]);

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showFlashNotification('Exit Picture-in-Picture');
      } else {
        await videoRef.current.requestPictureInPicture();
        showFlashNotification('Entered Picture-in-Picture');
      }
    } catch (e) {
      console.error(e);
      showFlashNotification('PiP Mode not supported');
    }
  };

  // Inactivity detection in fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setUserActive(true);
      return;
    }
    let timeoutId;
    const handleActivity = () => {
      setUserActive(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setUserActive(false);
      }, 4000);
    };

    const wrapper = playerWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('mousemove', handleActivity);
      wrapper.addEventListener('keydown', handleActivity);
    }
    handleActivity();

    return () => {
      if (wrapper) {
        wrapper.removeEventListener('mousemove', handleActivity);
        wrapper.removeEventListener('keydown', handleActivity);
      }
      clearTimeout(timeoutId);
    };
  }, [isFullscreen]);

  // Hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'KeyL') {
        e.preventDefault();
        setIsLooping(prev => {
          const next = !prev;
          showFlashNotification(`Loop Video: ${next ? 'ON' : 'OFF'}`);
          return next;
        });
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        setIsRandom(prev => {
          const next = !prev;
          localStorage.setItem('yt_random', String(next));
          showFlashNotification(`Random Play: ${next ? 'ON' : 'OFF'}`);
          return next;
        });
      }
      if (e.code === 'KeyO') {
        e.preventDefault();
        setShowSettings(prev => !prev);
      }
      if (castDevice) {
        if (e.code === 'Space') {
          e.preventDefault();
          togglePlay();
        }
        return;
      }
      if (e.code === 'KeyT') {
        e.preventDefault();
        setIsTheaterMode(prev => {
          const newVal = !prev;
          localStorage.setItem('yt_theater_mode', newVal);
          if (newVal) {
            setIsSidebarCollapsed(true);
            localStorage.setItem('yt_sidebar_collapsed', 'true');
          }
          showFlashNotification(`Theater Mode: ${newVal ? 'ON' : 'OFF'}`);
          return newVal;
        });
      }
      if (e.code === 'NumpadAdd') {
        e.preventDefault();
        setPlaybackSpeed(prev => {
          const newVal = Math.min(2.0, prev + 0.125);
          if (videoRef.current) videoRef.current.playbackRate = newVal;
          showFlashNotification(`Speed: ${newVal}x`);
          return newVal;
        });
      }
      if (e.code === 'NumpadSubtract') {
        e.preventDefault();
        setPlaybackSpeed(prev => {
          const newVal = Math.max(0.25, prev - 0.125);
          if (videoRef.current) videoRef.current.playbackRate = newVal;
          showFlashNotification(`Speed: ${newVal}x`);
          return newVal;
        });
      }
      if (e.code === 'Numpad0') {
        e.preventDefault();
        setIsReverseAutoplay(prev => {
          const newVal = !prev;
          if (newVal) {
            setIsRandom(false);
            localStorage.setItem('yt_random', 'false');
          }
          showFlashNotification(`Opposite Day (Reverse Autoplay): ${newVal ? 'ON' : 'OFF'}`);
          return newVal;
        });
      }
      if (e.code === 'Numpad5' || e.keyCode === 12) {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.focus();
        }
        showFlashNotification('Player Focused');
      }
      if (e.keyCode === 80) { // Key P
        e.preventDefault();
        if (activePlaylist && (activePlaylist.video_ids || []).length > 0) {
          const ids = activePlaylist.video_ids;
          let prevIdx = currentPlaylistIndex - 1;
          if (prevIdx < 0) prevIdx = ids.length - 1;
          const prevVid = allVideos.find(v => v.vid_id === parseInt(ids[prevIdx]));
          if (prevVid) onPlayVideo(prevVid, activePlaylist, prevIdx);
        } else {
          const currentIndex = allVideos.findIndex(v => v.vid_id === video.vid_id);
          if (currentIndex > 0) {
            onPlayVideo(allVideos[currentIndex - 1]);
          }
        }
      }
      if (e.keyCode === 78) { // Key N
        e.preventDefault();
        if (activePlaylist && (activePlaylist.video_ids || []).length > 0) {
          const ids = activePlaylist.video_ids;
          let nextIdx = currentPlaylistIndex + 1;
          if (isRandom) {
            nextIdx = Math.floor(Math.random() * ids.length);
          } else if (nextIdx >= ids.length) {
            nextIdx = 0;
          }
          const nextVid = allVideos.find(v => v.vid_id === parseInt(ids[nextIdx]));
          if (nextVid) onPlayVideo(nextVid, activePlaylist, nextIdx);
        } else if (isRandom) {
          onPlayRandom();
        } else {
          const currentIndex = allVideos.findIndex(v => v.vid_id === video.vid_id);
          if (currentIndex !== -1 && currentIndex < allVideos.length - 1) {
            onPlayVideo(allVideos[currentIndex + 1]);
          }
        }
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
      if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
      // Arrow Left/Right: seek ±5s (always active on player page)
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          const newTime = Math.max(0, videoRef.current.currentTime - 5);
          videoRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          if (castDevice) {
            handleRemoteSeek(newTime);
          } else {
            showFlashNotification(`⏪ ${formatTime(newTime)}`);
          }
        }
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) {
          const newTime = Math.min(duration, videoRef.current.currentTime + 5);
          videoRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          if (castDevice) {
            handleRemoteSeek(newTime);
          } else {
            showFlashNotification(`⏩ ${formatTime(newTime)}`);
          }
        }
      }
      // Arrow Up/Down: volume ±2% — only when video element is focused
      if (isVideoFocused) {
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          const newVol = Math.min(1, Math.round((volumeRef.current + 0.02) * 100) / 100);
          volumeRef.current = newVol;
          if (videoRef.current) { videoRef.current.volume = newVol; videoRef.current.muted = false; }
          setIsMuted(false);
          setVolume(newVol);
          localStorage.setItem('yt_volume', newVol);
          showFlashNotification(`Volume: ${Math.round(newVol * 100)}%`);
        }
        if (e.code === 'ArrowDown') {
          e.preventDefault();
          const newVol = Math.max(0, Math.round((volumeRef.current - 0.02) * 100) / 100);
          volumeRef.current = newVol;
          if (videoRef.current) { videoRef.current.volume = newVol; videoRef.current.muted = newVol === 0; }
          setIsMuted(newVol === 0);
          setVolume(newVol);
          localStorage.setItem('yt_volume', newVol);
          showFlashNotification(`Volume: ${Math.round(newVol * 100)}%`);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen, duration, playbackSpeed, allVideos, video, isVideoFocused, castDevice]);

  const handleVideoEnded = () => {
    if (isLooping) return;
    if (activePlaylist && (activePlaylist.video_ids || []).length > 0) {
      const ids = activePlaylist.video_ids;
      let nextIdx = currentPlaylistIndex + 1;
      if (isRandom) {
        nextIdx = Math.floor(Math.random() * ids.length);
      } else if (nextIdx >= ids.length) {
        nextIdx = 0; // wrap around
      }
      const nextVid = allVideos.find(v => v.vid_id === parseInt(ids[nextIdx]));
      if (nextVid) {
        onPlayVideo(nextVid, activePlaylist, nextIdx, isMiniPlayer);
      }
    } else if (isReverseAutoplay) {
      const currentIndex = allVideos.findIndex(v => v.vid_id === video.vid_id);
      if (currentIndex > 0) {
        onPlayVideo(allVideos[currentIndex - 1], undefined, undefined, isMiniPlayer);
      }
    } else if (isRandom) {
      onPlayRandom(isMiniPlayer);
    } else {
      const currentIndex = allVideos.findIndex(v => v.vid_id === video.vid_id);
      if (currentIndex !== -1 && currentIndex < allVideos.length - 1) {
        onPlayVideo(allVideos[currentIndex + 1], undefined, undefined, isMiniPlayer);
      }
    }
  };

  // Likes & Dislikes API triggers
  const handleLike = async () => {
    let action = 'increment';

    if (liked) {
      setLikes(prev => Math.max(0, prev - 1));
      setLiked(false);
      action = 'decrement';
    } else {
      setLikes(prev => prev + 1);
      setLiked(true);
      if (disliked) {
        setDislikes(prev => Math.max(0, prev - 1));
        setDisliked(false);
        await fetch('./api/index.php?action=toggle_like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vid_id: video.vid_id, type: 'dislike', action: 'decrement' })
        });
      }
    }

    await fetch('./api/index.php?action=toggle_like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid_id: video.vid_id, type: 'like', action: action })
    });
  };

  const handleDislike = async () => {
    let action = 'increment';

    if (disliked) {
      setDislikes(prev => Math.max(0, prev - 1));
      setDisliked(false);
      action = 'decrement';
    } else {
      setDislikes(prev => prev + 1);
      setDisliked(true);
      if (liked) {
        setLikes(prev => Math.max(0, prev - 1));
        setLiked(false);
        await fetch('./api/index.php?action=toggle_like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vid_id: video.vid_id, type: 'like', action: 'decrement' })
        });
      }
    }

    await fetch('./api/index.php?action=toggle_like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid_id: video.vid_id, type: 'dislike', action: action })
    });
  };

  // Video delete trigger
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this video from the database index?")) {
      try {
        const res = await fetch('./api/index.php?action=delete_video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vid_id: video.vid_id })
        });
        const data = await res.json();
        if (data.success) {
          onVideoDeleted();
        }
      } catch (e) {
        console.error("Error deleting video:", e);
      }
    }
  };

  // Metadata update trigger
  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch('./api/index.php?action=update_metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vid_id: video.vid_id,
          vid_name: editTitle,
          description: editDesc,
          tags: editTags
        })
      });
      const data = await res.json();
      if (data.success) {
        video.vid_name = editTitle;
        video.description = editDesc;
        video.tags = editTags;
        setShowEditModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Recommendations queue
  const recommendations = allVideos
    .filter(v => v.vid_id !== video.vid_id && v.vid_id !== 10)
    .slice(0, 10);

  return (
    <div
      className={`player-page-container ${isTheaterMode ? 'theater-layout' : ''} ${isMiniPlayer ? 'mini-player' : ''} ${isDraggingState ? 'dragging' : ''}`}
      style={isMiniPlayer ? {
        transform: `translate(${miniPlayerPos.x}px, ${miniPlayerPos.y}px)`,
        cursor: isDraggingState ? 'grabbing' : 'grab'
      } : {}}
    >
      {/* Sleek Custom HTML5 Video Player */}
      <div
        ref={playerWrapperRef}
        className={`video-player-wrapper ${isFullscreen && !userActive ? 'hide-controls' : ''}`}
      >
        {isMiniPlayer && (
          <>
            {/* Hover Controls Panel */}
            <div
              className="mini-player-hover-controls"
              onMouseDown={handleMouseDown}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease-in-out',
                cursor: isDraggingState ? 'grabbing' : 'grab'
              }}
            >
              {/* Center Controls Row - Exactly centered vertically & horizontally */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', pointerEvents: 'auto' }}>
                {/* Previous */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevVideo();
                  }}
                  className="mini-ctrl-btn"
                  title="Previous video"
                >
                  <SkipBack size={18} fill="currentColor" />
                </button>

                {/* Play / Pause */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="mini-ctrl-btn play-pause-btn"
                  title={isPlaying ? 'Pause' : 'Play'}
                  style={{ width: '40px', height: '40px', background: '#ff0000', color: '#fff', borderRadius: '50%' }}
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>

                {/* Next */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextVideo();
                  }}
                  className="mini-ctrl-btn"
                  title="Next video"
                >
                  <SkipForward size={18} fill="currentColor" />
                </button>
              </div>

              {/* Bottom Left Row (Mute & Expand) - Absolute positioned to keep center clear */}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '10px', alignItems: 'center', pointerEvents: 'auto' }}>
                {/* Mute */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="mini-ctrl-btn-secondary"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                {/* Expand */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand();
                  }}
                  className="mini-ctrl-btn-secondary"
                  title="Expand player"
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>

            {/* Close Button (Always visible on hover, z-index 70) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  videoRef.current.pause();
                }
                onClose();
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                zIndex: 70,
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                transition: 'background 0.2s',
                opacity: 0,
                pointerEvents: 'none'
              }}
              className="mini-player-close-btn"
              title="Close mini player"
            >
              <X size={16} />
            </button>

            {/* Clean Red Progress Timeline Bar at the bottom of the Mini-player */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'rgba(255,255,255,0.2)',
                zIndex: 65,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  width: `${(currentTime / (duration || 1)) * 100}%`,
                  height: '100%',
                  background: 'var(--primary-color)',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
          </>
        )}
        <video
          ref={videoRef}
          src={translateVideoUrl(video.link)}
          className="html5-video"
          autoPlay={!castDevice}
          loop={isLooping}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          onFocus={() => setIsVideoFocused(true)}
          onBlur={() => setIsVideoFocused(false)}
          tabIndex={0}
        />
        {(castDevice || isTranscoding) && (
          <div className="player-cast-active-overlay">
            {isTranscoding ? (
              <div className="cast-transcode-loader">
                <div className="cast-spinner"></div>
                <div className="cast-active-title" style={{ marginTop: '16px' }}>Preparing Media for TV...</div>
                <div className="cast-active-status">Re-encoding video format for compatibility</div>
                <span style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>This may take a moment depending on the video file size.</span>
              </div>
            ) : (
              <>
                <Tv size={64} className="cast-active-icon" />
                <div className="cast-active-title">Casting to {castDevice.name}</div>
                 <div className="cast-active-status">Playing: {video.vid_name.replace(/\.[a-zA-Z0-9]+$/, '')}</div>
                <div 
                  className="cast-active-time-meter" 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#3ea6ff', 
                    marginTop: '8px', 
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: '#fff' }}>{formatTime(currentTime)}</span>
                  <span style={{ color: '#606060' }}>/</span>
                  <span style={{ color: '#aaa' }}>{formatTime(duration)}</span>
                </div>
                <div className="cast-active-controls">
                  <button className="cast-remote-btn" onClick={handlePrevVideo} title="Previous Video">
                    <SkipBack size={24} fill="currentColor" />
                  </button>
                  <button 
                    className="cast-remote-btn" 
                    onClick={() => {
                      if (videoRef.current) {
                        const newTime = Math.max(0, videoRef.current.currentTime - 10);
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                        handleRemoteSeek(newTime);
                      }
                    }} 
                    title="Seek Backward 10s"
                    style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                  >
                    <RotateCcw size={18} />
                    <span style={{ fontSize: '9px', fontWeight: 'bold', opacity: 0.8 }}>10s</span>
                  </button>
                  <button className="cast-remote-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                  </button>
                  <button 
                    className="cast-remote-btn" 
                    onClick={() => {
                      if (videoRef.current) {
                        const newTime = Math.min(duration, videoRef.current.currentTime + 10);
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                        handleRemoteSeek(newTime);
                      }
                    }} 
                    title="Seek Forward 10s"
                    style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                  >
                    <RotateCw size={18} />
                    <span style={{ fontSize: '9px', fontWeight: 'bold', opacity: 0.8 }}>10s</span>
                  </button>
                  <button className="cast-remote-btn" onClick={handleNextVideo} title="Next Video">
                    <SkipForward size={24} fill="currentColor" />
                  </button>
                  <button className="cast-remote-btn stop" onClick={() => handleRemoteControl('stop')} title="Disconnect">
                    Disconnect
                  </button>
                </div>

                <div className="cast-active-options" style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <button 
                    className={`cast-option-toggle-btn ${isRandom ? 'active' : ''}`}
                    onClick={() => {
                      const next = !isRandom;
                      setIsRandom(next);
                      localStorage.setItem('yt_random', String(next));
                      showFlashNotification(`Random Play: ${next ? 'ON' : 'OFF'}`);
                    }}
                    title="Toggle Random Playback"
                    style={{
                      background: isRandom ? 'rgba(62, 166, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: isRandom ? '1px solid #3ea6ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      color: isRandom ? '#3ea6ff' : '#aaa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Shuffle size={16} /> Random
                  </button>

                  <button 
                    className={`cast-option-toggle-btn ${isLooping ? 'active' : ''}`}
                    onClick={() => {
                      const next = !isLooping;
                      setIsLooping(next);
                      showFlashNotification(`Loop Video: ${next ? 'ON' : 'OFF'}`);
                    }}
                    title="Toggle Loop Video"
                    style={{
                      background: isLooping ? 'rgba(62, 166, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: isLooping ? '1px solid #3ea6ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      color: isLooping ? '#3ea6ff' : '#aaa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Repeat size={16} /> Loop
                  </button>

                  <button 
                    className={`cast-option-toggle-btn ${isReverseAutoplay ? 'active' : ''}`}
                    onClick={() => {
                      const next = !isReverseAutoplay;
                      setIsReverseAutoplay(next);
                      showFlashNotification(`Reverse Mode: ${next ? 'ON' : 'OFF'}`);
                    }}
                    title="Toggle Reverse Autoplay"
                    style={{
                      background: isReverseAutoplay ? 'rgba(62, 166, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: isReverseAutoplay ? '1px solid #3ea6ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      color: isReverseAutoplay ? '#3ea6ff' : '#aaa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <CornerUpLeft size={16} /> Reverse
                  </button>
                </div>
              </>
            )}
          </div>
        )}



        {/* Stats for Nerds Overlay */}
        {showStats && (
          <div className="stats-for-nerds-overlay">
            <div className="stats-header">
              <span>Stats for Nerds</span>
              <button onClick={() => setShowStats(false)}>&times;</button>
            </div>
            <div className="stats-body">
              <div><strong>Resolution:</strong> {video.width && video.height ? `${video.width}x${video.height}` : '1080p (FHD)'}</div>
              <div><strong>Aspect Ratio:</strong> {video.aspect_ratio || '16:9'}</div>
              <div><strong>File Size:</strong> {video.filesize ? `${(video.filesize / (1024 * 1024)).toFixed(2)} MB` : 'Calculating...'}</div>
              <div><strong>Bitrate:</strong> {video.bitrate ? `${video.bitrate} kbps` : 'Calculating...'}</div>
              <div><strong>Frame Rate:</strong> {video.framerate ? `${video.framerate} fps` : '30 fps'}</div>
              <div><strong>Codec:</strong> {video.codec || 'h264'}</div>
              <div style={{ wordBreak: 'break-all' }}><strong>Source:</strong> {video.link}</div>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="player-controls-overlay">
          {/* Progress Slider with Hover Preview & Dragging */}
          <div
            ref={progressContainerRef}
            className="progress-bar-hit-area"
            onMouseDown={handleProgressMouseDown}
            onMouseMove={handleProgressMouseMove}
            onMouseLeave={handleProgressMouseLeave}
          >
            <div className="progress-bar-container">
              <div
                className="progress-bar-played"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              ></div>
              <div
                className="progress-bar-knob"
                style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
              ></div>
            </div>

            {/* Hover Preview Tooltip (real frame via canvas) */}
            <div
              className="timeline-hover-preview"
              style={{
                left: `${hoverX}px`,
                display: (showHoverPreview && hoverTime !== null) ? 'flex' : 'none'
              }}
            >
              <canvas
                ref={previewCanvasRef}
                width={160}
                height={90}
                className="hover-preview-thumb"
              />
              <div className="hover-preview-time">{formatTime(hoverTime || 0)}</div>
            </div>

            {/* Hidden video element for frame extraction */}
            <video
              ref={previewVideoRef}
              src={showHoverPreview ? translateVideoUrl(video.link) : ''}
              style={{ display: 'none' }}
              muted
              preload="metadata"
              onLoadedMetadata={handlePreviewMetadataLoaded}
              onSeeked={() => {
                const pv = previewVideoRef.current;
                const canvas = previewCanvasRef.current;
                if (!pv || !canvas) return;
                const ctx = canvas.getContext('2d');
                const cw = canvas.width;
                const ch = canvas.height;
                // Draw preserving aspect ratio with letterboxing
                const vidAspect = pv.videoWidth / pv.videoHeight;
                const canvasAspect = cw / ch;
                let drawW, drawH, offsetX, offsetY;
                if (vidAspect > canvasAspect) {
                  drawW = cw;
                  drawH = cw / vidAspect;
                  offsetX = 0;
                  offsetY = (ch - drawH) / 2;
                } else {
                  drawH = ch;
                  drawW = ch * vidAspect;
                  offsetX = (cw - drawW) / 2;
                  offsetY = 0;
                }
                ctx.clearRect(0, 0, cw, ch);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, cw, ch);
                ctx.drawImage(pv, offsetX, offsetY, drawW, drawH);
              }}
            />
          </div>

          {/* Buttons Row */}
          <div className="controls-row">
            <div className="controls-group">
              <button
                className="control-btn"
                title="Previous video"
                onClick={handlePrevVideo}
              >
                <SkipBack size={20} fill="currentColor" />
              </button>

              <button className="control-btn" onClick={togglePlay}>
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>

              <button
                className="control-btn"
                title="Next video"
                onClick={handleNextVideo}
              >
                <SkipForward size={20} fill="currentColor" />
              </button>

              <div className="volume-container">
                <button className="control-btn" onClick={toggleMute}>
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  className="volume-slider"
                  onChange={handleVolumeChange}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${(isMuted ? 0 : volume) * 100}%, #666 ${(isMuted ? 0 : volume) * 100}%, #666 100%)`
                  }}
                />
              </div>

              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="controls-group">
              <button
                className="control-btn"
                onClick={togglePip}
                title="Picture-in-Picture"
              >
                <Share2 size={20} />
              </button>
              <button
                className={`control-btn theater-mode ${isTheaterMode ? 'active' : ''}`}
                onClick={() => {
                  setIsTheaterMode(prev => {
                    const newVal = !prev;
                    localStorage.setItem('yt_theater_mode', newVal);
                    if (newVal) {
                      setIsSidebarCollapsed(true);
                      localStorage.setItem('yt_sidebar_collapsed', 'true');
                    }
                    showFlashNotification(`Theater Mode: ${newVal ? 'ON' : 'OFF'}`);
                    return newVal;
                  });
                }}
                title="Theater Mode (t)"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  {isTheaterMode ? (
                    <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 9H6V9h12v6z" />
                  ) : (
                    <path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z" />
                  )}
                </svg>
              </button>
              <button
                className={`control-btn ${showCastMenu ? 'cast-active' : ''}`}
                onClick={() => {
                  setShowCastMenu(!showCastMenu);
                  setShowSettings(false);
                }}
                title="Cast"
              >
                <Tv size={20} />
              </button>
              <button
                className={`control-btn ${showSettings ? 'settings-active' : ''}`}
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowCastMenu(false);
                }}
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button className="control-btn" onClick={toggleFullscreen} title="Fullscreen (f)">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Cast Device Selector Dropdown */}
        {showCastMenu && (
          <div className="player-cast-dropdown">
            {!castMode ? (
              <div className="cast-menu-list">
                <div className="cast-menu-header">Cast to Device</div>
                <div
                  className="cast-menu-item"
                  onClick={() => {
                    setCastMode('legacy');
                    loadServerIps();
                    discoverDevices();
                  }}
                >
                  <span className="settings-item-left"><Tv size={16} /> Legacy Mode (DLNA / UPnP)</span>
                </div>
                <div
                  className="cast-menu-item"
                  onClick={() => {
                    setCastMode('modern');
                    startModernCast();
                    setShowCastMenu(false);
                  }}
                >
                  <span className="settings-item-left"><Tv size={16} /> Modern Mode (Google Cast / AirPlay)</span>
                </div>
              </div>
            ) : castMode === 'legacy' ? (
              <div className="cast-menu-list">
                <div className="cast-menu-header" onClick={() => setCastMode(null)} style={{ cursor: 'pointer' }}>
                  <span>&lt; Back to Protocol Selection</span>
                </div>
                
                {/* Local IP Selector */}
                <div className="cast-ip-config">
                  <label>Server LAN IP Address:</label>
                  <select
                    value={selectedServerIp}
                    onChange={(e) => {
                      const newIp = e.target.value;
                      setSelectedServerIp(newIp);
                      localStorage.setItem('yt_cast_server_ip', newIp);
                      // Trigger discovery on the new interface
                      setTimeout(() => {
                        discoverDevices();
                      }, 100);
                    }}
                    className="cast-ip-select"
                  >
                    {serverIps.map((ip, idx) => (
                      <option key={idx} value={ip}>{ip}</option>
                    ))}
                    {serverIps.length === 0 && <option value="">Auto-Detecting...</option>}
                  </select>
                  <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>
                    Select the local IP where your XAMPP server runs.
                  </div>
                </div>

                <div className="cast-divider"></div>

                <div className="cast-devices-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Renderers Found:</span>
                    <button
                      className="cast-refresh-btn"
                      onClick={discoverDevices}
                      disabled={discovering}
                    >
                      {discovering ? <Loader2 className="animate-spin" size={12} /> : 'Refresh'}
                    </button>
                  </div>

                  {discovering ? (
                    <div className="cast-status-text">Scanning network via SSDP...</div>
                  ) : discoveredDevices.length === 0 ? (
                    <div className="cast-status-text">No DLNA renderers discovered on local network.</div>
                  ) : (
                    discoveredDevices.map((device, idx) => (
                      <div
                        key={idx}
                        className={`cast-device-row ${castDevice?.control_url === device.control_url ? 'active' : ''}`}
                        onClick={() => {
                          if (castDevice?.control_url === device.control_url) {
                            handleRemoteControl('stop');
                          } else {
                            startCasting(device);
                          }
                          setShowCastMenu(false);
                        }}
                      >
                        <Tv size={14} />
                        <span>{device.name}</span>
                        {castDevice?.control_url === device.control_url && (
                          <span className="cast-connected-badge">Connected</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* YouTube Style Settings Dropdown */}
        {showSettings && (
          <div className="player-settings-dropdown">
            {settingsSubmenu === 'main' ? (
              <div className="settings-menu-list">
                <div className="settings-menu-item" onClick={() => setSettingsSubmenu('speed')}>
                  <span className="settings-item-left"><RefreshCw size={16} /> Playback Speed</span>
                  <span className="settings-item-right">{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`} &gt;</span>
                </div>

                <div className="settings-menu-item" onClick={() => setIsLooping(!isLooping)}>
                  <span className="settings-item-left"><Repeat size={16} /> Loop Video</span>
                  <span className={`settings-item-right toggle-badge ${isLooping ? 'active' : ''}`}>
                    {isLooping ? 'ON' : 'OFF'}
                  </span>
                </div>

                <div className="settings-menu-item" onClick={() => {
                  const next = !isRandom;
                  setIsRandom(next);
                  localStorage.setItem('yt_random', String(next));
                }}>
                  <span className="settings-item-left"><Shuffle size={16} /> Random Play</span>
                  <span className={`settings-item-right toggle-badge ${isRandom ? 'active' : ''}`}>
                    {isRandom ? 'ON' : 'OFF'}
                  </span>
                </div>

                <div className="settings-menu-item" onClick={() => {
                  const next = !isReverseAutoplay;
                  setIsReverseAutoplay(next);
                  showFlashNotification(`Reverse Mode: ${next ? 'ON' : 'OFF'}`);
                }}>
                  <span className="settings-item-left"><CornerUpLeft size={16} /> Reverse Mode</span>
                  <span className={`settings-item-right toggle-badge ${isReverseAutoplay ? 'active' : ''}`}>
                    {isReverseAutoplay ? 'ON' : 'OFF'}
                  </span>
                </div>

                <div className="settings-menu-item" onClick={() => { setShowStats(!showStats); setShowSettings(false); }}>
                  <span className="settings-item-left"><Info size={16} /> Stats for Nerds</span>
                </div>

                <a
                  href={translateVideoUrl(video.link)}
                  download
                  className="settings-menu-item settings-item-link"
                  onClick={() => setShowSettings(false)}
                >
                  <span className="settings-item-left"><Download size={16} /> Download File</span>
                </a>
              </div>
            ) : (
              <div className="settings-menu-list">
                <div className="settings-menu-header" onClick={() => setSettingsSubmenu('main')}>
                  <span>&lt; Playback Speed</span>
                </div>
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                  <div
                    key={speed}
                    className={`settings-menu-item ${playbackSpeed === speed ? 'active' : ''}`}
                    onClick={() => {
                      setPlaybackSpeed(speed);
                      if (videoRef.current) {
                        videoRef.current.playbackRate = speed;
                      }
                      setSettingsSubmenu('main');
                    }}
                  >
                    <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                    {playbackSpeed === speed && <span style={{ color: 'var(--primary-color)' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transcode Confirmation Modal */}
      {pendingTranscodeDevice && (
        <div className="cast-transcode-modal-backdrop">
          <div className="cast-transcode-modal">
            <h3>Incompatible Video Format</h3>
            <p>
              The video <strong>"{video.vid_name.replace(/\.[a-zA-Z0-9]+$/, '')}"</strong> is not natively supported by your TV.
            </p>
            <p className="modal-desc">
              We can re-encode this video container to MP4 (H.264 / AAC) in the background. Your original file will not be changed.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn confirm"
                onClick={() => executeCast(pendingTranscodeDevice)}
              >
                Re-encode & Cast
              </button>
              <button
                className="modal-btn cancel"
                onClick={() => {
                  setPendingTranscodeDevice(null);
                  if (activePlaylist && playlists.find(p => p.pl_id === activePlaylist)?.videos?.length > 1) {
                    handleNextVideo();
                  } else {
                    if (videoRef.current) videoRef.current.pause();
                  }
                }}
              >
                Skip Video
              </button>
            </div>
          </div>
        </div>
      )}

      {!isMiniPlayer && (
        <>
          <div className="player-main-col">
            {/* Video details metadata block */}
            <div className="video-metadata-details">
              <h1 className="video-detail-title">{video.vid_name.replace(/\.[a-zA-Z0-9]+$/, '')}</h1>

              <div className="video-detail-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={video.uploader_img}
                    alt=""
                    className="channel-avatar"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigateToProfile && onNavigateToProfile(video.uploader_name)}
                  />
                  <div>
                    <div
                      style={{ fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                      onClick={() => onNavigateToProfile && onNavigateToProfile(video.uploader_name)}
                    >
                      {video.uploader_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Channel Owner</div>
                  </div>
                </div>

                <div className="detail-actions-right">
                  {/* Split Pill Like/Dislike Button Group */}
                  <div className="like-dislike-pill-group">
                    <button className={`like-btn-pill ${liked ? 'active' : ''}`} onClick={handleLike}>
                      <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} /> <span>{likes}</span>
                    </button>
                    <div className="pill-separator"></div>
                    <button className={`dislike-btn-pill ${disliked ? 'active' : ''}`} onClick={handleDislike}>
                      <ThumbsDown size={16} fill={disliked ? "currentColor" : "none"} /> <span>{dislikes}</span>
                    </button>
                  </div>

                  <button className="action-pill-btn" onClick={() => setShowEditModal(true)}>
                    <Edit size={16} /> <span>Edit</span>
                  </button>
                  <button className="action-pill-btn delete-pill-btn" onClick={handleDelete}>
                    <Trash2 size={16} /> <span>Delete</span>
                  </button>
                  <button className="action-pill-btn" onClick={() => setShowSaveModal(true)}>
                    <Bookmark size={16} /> <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Premium Glassmorphic Description Card */}
              <div
                className={`description-card ${isDescriptionExpanded ? 'expanded' : 'collapsed'}`}
                onClick={() => { if (!isDescriptionExpanded) setIsDescriptionExpanded(true); }}
                style={{ cursor: !isDescriptionExpanded ? 'pointer' : 'default' }}
              >
                <div className="description-meta">
                  {video.views || 0} views • Uploaded at {formatUploadDate(video.upload_date)}
                </div>
                <div className="description-content-area">
                  <p className="video-detail-description">
                    {renderDescription(video.description)}
                  </p>
                  {video.tags && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {video.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="vid-timestamps" style={{ fontSize: '13px' }}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="description-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                  }}
                >
                  {isDescriptionExpanded ? 'Show less' : '...Show more'}
                </button>
              </div>
            </div>

            {/* Native React Comments Section */}
            <CommentsSection
              key={video.vid_id}
              videoId={video.vid_id}
              currentUser={currentUser}
              onOpenAuth={onOpenAuth}
              onNavigateToProfile={onNavigateToProfile}
              showFlashNotification={showFlashNotification}
              onSeekVideo={(seconds) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = seconds;
                  setCurrentTime(seconds);
                }
              }}
            />
          </div>

          {/* RIGHT COLUMN: RECOMMENDATIONS & PLAYLIST QUEUE */}
          <div className="player-sidebar-col">
            {activePlaylist && (
              <div className="playlist-queue-panel" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}>
                {/* Playlist Queue Header */}
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <ListMusic size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                      <span>{activePlaylist.playlist_name}</span>
                    </h3>
                    <button
                      onClick={() => setActivePlaylist(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#aaa',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }}
                      title="Close playlist queue"
                    >
                      Clear Queue
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {currentPlaylistIndex + 1} / {(activePlaylist.video_ids || []).length} videos
                    </span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => {
                          const next = !isRandom;
                          setIsRandom(next);
                          localStorage.setItem('yt_random', String(next));
                          showFlashNotification(`Playlist Shuffle: ${next ? 'ON' : 'OFF'}`);
                        }}
                        style={{ background: 'none', border: 'none', color: isRandom ? 'var(--primary-color)' : '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Shuffle playlist"
                      >
                        <Shuffle size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setIsLooping(prev => !prev);
                          showFlashNotification(`Playlist Loop: ${!isLooping ? 'ON' : 'OFF'}`);
                        }}
                        style={{ background: 'none', border: 'none', color: isLooping ? 'var(--primary-color)' : '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Loop playlist"
                      >
                        <Repeat size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrollable Playlist Queue Video List */}
                <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {(activePlaylist.video_ids || []).map((id, idx) => {
                    const vid = allVideos.find(v => v.vid_id === parseInt(id));
                    if (!vid) return null;
                    const isCurrent = parseInt(id) === video.vid_id;
                    const cleanTitle = (vid.vid_name || '').replace(/\.[a-zA-Z0-9]+$/, '');
                    return (
                      <div
                        key={vid.vid_id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnter={(e) => handleDragEnter(e, idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => onPlayVideo(vid, activePlaylist, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 16px',
                          cursor: 'grab',
                          background: isCurrent ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                          transition: 'background 0.2s',
                          userSelect: 'none'
                        }}
                        className="queue-item"
                      >
                        <div style={{ fontSize: '11px', color: isCurrent ? 'var(--primary-color)' : '#666', fontWeight: 'bold', width: '16px', textAlign: 'center', flexShrink: 0 }}>
                          {isCurrent ? '▶' : idx + 1}
                        </div>

                        <div style={{
                          width: '64px',
                          height: '36px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: '#000',
                          position: 'relative',
                          flexShrink: 0
                        }}>
                          <img
                            src={`./thumbnails/${vid.vid_id}.jpg`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                            <Play size={12} />
                          </div>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: isCurrent ? 'bold' : 'normal',
                            color: isCurrent ? 'var(--primary-color)' : '#fff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {cleanTitle}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {vid.uploader_name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>Watch Next</h2>

            {recommendations.map(vid => (
              <SidebarVideoCard key={vid.vid_id} vid={vid} onPlayVideo={onPlayVideo} />
            ))}
          </div>

          {/* Metadata Editing Modal Overlay */}
          {showEditModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <span className="modal-title">Edit Video Metadata</span>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
                </div>
                <form onSubmit={handleSaveMetadata} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Video Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="form-input"
                      rows={4}
                      style={{ fontFamily: 'inherit' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="videosongs, downloads, fun"
                      className="form-input"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '8px 20px' }}
                      disabled={savingEdit}
                    >
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Save to Playlist Modal Overlay */}
          {showSaveModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '360px', padding: '24px', background: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="modal-header" style={{ marginBottom: '20px' }}>
                  <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}>
                    <Bookmark size={20} className="text-primary-color" style={{ color: 'var(--primary-color)' }} /> Save video to...
                  </span>
                  <button className="modal-close" onClick={() => setShowSaveModal(false)}>&times;</button>
                </div>

                {/* Playlists checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
                  {playlists.map(pl => {
                    const isSaved = pl.video_ids && pl.video_ids.includes(video.vid_id);
                    return (
                      <label key={pl.id} className="playlist-save-item">
                        <input
                          type="checkbox"
                          checked={isSaved}
                          onChange={() => {
                            if (isSaved) {
                              removeVideoFromPlaylist(pl.id, video.vid_id);
                            } else {
                              addVideoToPlaylist(pl.id, video.vid_id);
                            }
                          }}
                          className="playlist-save-checkbox"
                        />
                        <span className="playlist-save-label-text">{pl.playlist_name}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Create Playlist Form */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>Create a new playlist</span>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (newPlaylistName.trim()) {
                      const pl = await createPlaylist(newPlaylistName.trim());
                      if (pl && pl.id) {
                        await addVideoToPlaylist(pl.id, video.vid_id);
                      }
                      setNewPlaylistName('');
                    }
                  }} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="create-pl-input-container">
                      <input
                        type="text"
                        placeholder="Enter playlist name..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        className="create-pl-input"
                        required
                      />
                      <div className="create-pl-focus-line"></div>
                    </div>
                    <button
                      type="submit"
                      className="create-pl-btn"
                      disabled={!newPlaylistName.trim()}
                    >
                      + Create Playlist
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ----------------------------------------
// SUB-VIEW: CrawlerView
// ----------------------------------------
function CrawlerView() {
  const [directory, setDirectory] = useState('D:/Video songs');
  const [recursive, setRecursive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [generatingThumbs, setGeneratingThumbs] = useState(false);
  const [logs, setLogs] = useState([
    { type: 'info', text: 'Crawler Engine Initialized.' },
    { type: 'info', text: 'Select a folder preset or type a custom path to start syncing.' }
  ]);
  const [migratingDates, setMigratingDates] = useState(false);

  // Dynamic presets
  const [presetFolders, setPresetFolders] = useState(() => {
    const saved = localStorage.getItem('yt_crawler_presets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { name: 'Downloads', path: 'C:/Users/ihars/Downloads' },
      { name: 'Video Songs', path: 'D:/Video songs' },
      { name: '0-Entertainment', path: 'D:/0-entertainment' },
      { name: 'Desktop', path: 'C:/Users/ihars/Desktop' }
    ];
  });

  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetPath, setNewPresetPath] = useState('');

  const handleAddPreset = (e) => {
    e.preventDefault();
    if (!newPresetName.trim() || !newPresetPath.trim()) return;
    const updated = [...presetFolders, { name: newPresetName.trim(), path: newPresetPath.trim() }];
    setPresetFolders(updated);
    localStorage.setItem('yt_crawler_presets', JSON.stringify(updated));
    setNewPresetName('');
    setNewPresetPath('');
    setLogs(prev => [...prev, { type: 'success', text: `Added directory preset: "${newPresetName}"` }]);
  };

  const handleRemovePreset = (name) => {
    const updated = presetFolders.filter(p => p.name !== name);
    setPresetFolders(updated);
    localStorage.setItem('yt_crawler_presets', JSON.stringify(updated));
    setLogs(prev => [...prev, { type: 'info', text: `Removed directory preset: "${name}"` }]);
  };

  const handleMigrateDates = async () => {
    setMigratingDates(true);
    setLogs(prev => [
      ...prev,
      { type: 'info', text: 'Starting database date migration based on video file modification dates (mtime)...' }
    ]);
    try {
      const res = await fetch('./api/migrate_dates.php');
      const data = await res.json();
      if (data.status === 'success') {
        setLogs(prev => [
          ...prev,
          { type: 'success', text: `Migration completed: ${data.message}` },
          { type: 'success', text: `Updated: ${data.updated} videos in database.` },
          { type: 'info', text: `Missing files: ${data.missing_files} videos skipped (file not found).` }
        ]);
      } else {
        setLogs(prev => [
          ...prev,
          { type: 'error', text: `Migration failed: ${data.message}` }
        ]);
      }
    } catch (e) {
      setLogs(prev => [
        ...prev,
        { type: 'error', text: `HTTP connection error: ${e.message}` }
      ]);
    } finally {
      setMigratingDates(false);
    }
  };

  const handleGenerateMissingThumbnails = async () => {
    setGeneratingThumbs(true);
    setLogs(prev => [
      ...prev,
      { type: 'info', text: 'Starting batch server-side thumbnail generation via FFmpeg...' }
    ]);

    let remaining = 1;
    let totalGenerated = 0;
    let totalFailed = 0;

    try {
      while (remaining > 0) {
        const res = await fetch('./api/index.php?action=generate_missing_thumbnails');
        const data = await res.json();

        if (data.error) {
          setLogs(prev => [
            ...prev,
            { type: 'error', text: `Thumbnail generation failed: ${data.error}` }
          ]);
          break;
        }

        remaining = data.remaining;
        totalGenerated += data.generated;
        totalFailed += data.failed;

        setLogs(prev => [
          ...prev,
          { type: 'info', text: `Batch processed: ${data.batch_processed}. Generated: ${data.generated} new. Failed: ${data.failed}. Remaining: ${data.remaining} of ${data.total}` }
        ]);

        if (data.failed_list && data.failed_list.length > 0) {
          setLogs(prev => {
            const list = [...prev];
            data.failed_list.forEach(v => {
              list.push({ type: 'error', text: `[ID: ${v.id}] ${v.name} failed (FFmpeg extraction error)` });
            });
            return list;
          });
        }

        if (data.batch_processed === 0) {
          break;
        }

        // Tiny delay of 200ms between requests
        await new Promise(r => setTimeout(r, 200));
      }

      setLogs(prev => [
        ...prev,
        { type: 'success', text: `Bulk thumbnail generation completed! Total new generated: ${totalGenerated}. Total failed: ${totalFailed}.` }
      ]);
    } catch (e) {
      setLogs(prev => [
        ...prev,
        { type: 'error', text: `HTTP connection error: ${e.message}` }
      ]);
    } finally {
      setGeneratingThumbs(false);
    }
  };



  const handleCrawl = async () => {
    setScanning(true);
    setLogs(prev => [
      ...prev,
      { type: 'info', text: `Starting scan on: "${directory}"...` }
    ]);

    try {
      const res = await fetch('./api/index.php?action=crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directory, recursive })
      });
      const data = await res.json();

      if (data.error) {
        setLogs(prev => [
          ...prev,
          { type: 'error', text: `Scan failed: ${data.error}` }
        ]);
      } else {
        setLogs(prev => [
          ...prev,
          { type: 'success', text: `Scan completed successfully!` },
          { type: 'success', text: `Added ${data.added} new videos.` },
          { type: 'info', text: `Skipped ${data.skipped} already indexed videos.` }
        ]);
        if (data.new_videos && data.new_videos.length > 0) {
          data.new_videos.forEach(v => {
            setLogs(prev => [
              ...prev,
              { type: 'success', text: `  + Added: ${v.name} (Duration: ${v.duration > 0 ? formatTime(v.duration) : 'Scanned by server'})` }
            ]);
          });
        }
      }
    } catch (e) {
      setLogs(prev => [
        ...prev,
        { type: 'error', text: `HTTP connection error: ${e.message}` }
      ]);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="crawler-container">
      <div className="crawler-header">
        <h1 className="crawler-title">Filesystem Sync & Crawler</h1>
        <p className="crawler-desc">Specify local directories to search for videos. The system automatically extracts durations, file sizes, resolutions, bitrates, and last modified dates on index.</p>
      </div>

      <div className="crawler-section">
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Directory Presets</h2>
        <div className="crawler-presets">
          {presetFolders.map((preset) => (
            <div key={preset.name} className="preset-card">
              <span className="preset-name">
                <Folder size={18} className="logo-icon" /> {preset.name}
              </span>
              <span className="preset-path" title={preset.path}>{preset.path}</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  className="btn-primary"
                  style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}
                  onClick={() => setDirectory(preset.path)}
                >
                  Select
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#cc0000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => handleRemovePreset(preset.name)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Preset Form */}
        <form onSubmit={handleAddPreset} style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Preset Name</label>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="e.g. My Fun Videos"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '13px' }}
              required
            />
          </div>
          <div style={{ flex: 2, minWidth: '250px' }}>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Folder Path</label>
            <input
              type="text"
              value={newPresetPath}
              onChange={(e) => setNewPresetPath(e.target.value)}
              placeholder="e.g. D:/My Videos"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '13px' }}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '8px 16px', height: '36px', fontSize: '13px' }}>
            Add Preset
          </button>
        </form>
      </div>

      <div className="crawler-section">
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Sync Configuration</h2>
        <div className="crawler-form">
          <div className="form-group">
            <label className="form-label">Absolute Directory Path (Windows Format)</label>
            <input
              type="text"
              value={directory}
              onChange={(e) => setDirectory(e.target.value)}
              className="form-input"
              placeholder="e.g. D:/My Videos"
            />
          </div>

          <label className="form-checkbox-group">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
            />
            <span className="form-label" style={{ fontWeight: 'normal' }}>Recursive scanning (include subdirectories)</span>
          </label>

          <button
            className="btn-primary"
            onClick={handleCrawl}
            disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {scanning ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Scanning Directory...</span>
              </>
            ) : (
              <span>Run Sync Crawler</span>
            )}
          </button>

          <button
            className="btn-primary"
            onClick={handleGenerateMissingThumbnails}
            disabled={generatingThumbs || scanning}
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#383838',
              color: '#fff'
            }}
          >
            {generatingThumbs ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Extracting Thumbnails...</span>
              </>
            ) : (
              <span>Bulk Generate Missing Thumbnails (FFmpeg)</span>
            )}
          </button>

          <button
            className="btn-primary"
            onClick={handleMigrateDates}
            disabled={migratingDates || scanning}
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#4a3b2c',
              color: '#fff'
            }}
          >
            {migratingDates ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Migrating Dates...</span>
              </>
            ) : (
              <span>Migrate Video File Modification Dates</span>
            )}
          </button>
        </div>
      </div>

      <div className="crawler-section">
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Output logs Console</h2>
        <div className="crawler-logs">
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.type}`}>
              [{log.type.toUpperCase()}] {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------
// SUB-VIEW: PlaylistView
// ----------------------------------------
function PlaylistView({ playlist, allVideos, onPlayVideo, onRemoveVideo, onReorder, onDeletePlaylist, onPlayPlaylist }) {
  const playlistVideos = (playlist.video_ids || [])
    .map(id => allVideos.find(v => v.vid_id === parseInt(id)))
    .filter(Boolean);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (e, position) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    const copyListItems = [...playlistVideos];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;

    const newIds = copyListItems.map(v => v.vid_id);
    onReorder(playlist.id, newIds);
  };

  return (
    <div className="crawler-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <div className="crawler-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
        <div>
          <h1 className="crawler-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ListMusic size={28} style={{ color: 'var(--primary-color)' }} /> {playlist.playlist_name}
          </h1>
          <p className="crawler-desc" style={{ marginTop: '6px' }}>
            {playlistVideos.length} {playlistVideos.length === 1 ? 'video' : 'videos'} • Drag & drop items to reorder playlist queue
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {playlistVideos.length > 0 && (
            <button
              className="btn-primary"
              onClick={() => onPlayPlaylist(playlist)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold' }}
            >
              <Play size={18} fill="currentColor" /> Play All
            </button>
          )}
          {playlist.playlist_name !== 'default' && (
            <button
              className="btn-secondary"
              onClick={() => {
                if (confirm('Are you sure you want to delete this playlist?')) {
                  onDeletePlaylist(playlist.id);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '20px', backgroundColor: '#cc0000', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={18} /> Delete Playlist
            </button>
          )}
        </div>
      </div>

      {playlistVideos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#aaa' }}>
          <ListMusic size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px' }}>This playlist has no videos yet.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '6px' }}>To add videos, click the "Save" button below any video player.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
          {playlistVideos.map((vid, idx) => {
            const cleanTitle = (vid.vid_name || '').replace(/\.[a-zA-Z0-9]+$/, '');
            const hasThumbnail = vid.thumbnail && vid.thumbnail !== '0';
            const thumbnailSrc = hasThumbnail ? `./api/index.php?action=thumbnail&id=${vid.vid_id}` : '';
            return (
              <div
                key={vid.vid_id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'grab',
                  transition: 'background 0.2s, transform 0.1s'
                }}
                className="playlist-item-row"
              >
                <div style={{ color: '#666', fontSize: '14px', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>
                  {idx + 1}
                </div>

                <div
                  onClick={() => onPlayVideo(vid, playlist, idx)}
                  style={{
                    width: '120px',
                    height: '68px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#000',
                    position: 'relative',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={`./thumbnails/${vid.vid_id}.jpg`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                    <Play size={20} />
                  </div>
                  {vid.duration > 0 && (
                    <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>
                      {formatTime(vid.duration)}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    onClick={() => onPlayVideo(vid, playlist, idx)}
                    style={{ fontSize: '15px', fontWeight: '600', color: '#fff', cursor: 'pointer', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {cleanTitle}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#aaa', marginTop: '4px', display: 'inline-block' }}>
                    {vid.uploader_name}
                  </span>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => onRemoveVideo(playlist.id, vid.vid_id)}
                  style={{ padding: '8px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove from playlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
