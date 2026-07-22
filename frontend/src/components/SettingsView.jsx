import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Play, Download, RefreshCw, Trash2,
  RotateCcw, Check, FolderClosed, Home, Database,
  Plus, Pencil, X, GripVertical, Eye, Copy, Save, ChevronDown, ChevronUp,
  Lock, Shield, EyeOff
} from 'lucide-react';

const DEFAULT_PILLS = [
  { id: 'all', label: 'all', filterType: 'all', filterVal: '', sortBy: 'mix', mediaType: 'mixed', excludeShortsInVideoSection: false },
  { id: 'recent', label: 'recent', filterType: 'all', filterVal: '', sortBy: 'recent', mediaType: 'only_videos', excludeShortsInVideoSection: false },
  { id: 'oldest', label: 'oldest', filterType: 'all', filterVal: '', sortBy: 'oldest', mediaType: 'only_videos', excludeShortsInVideoSection: false },
  { id: 'downloads', label: 'downloads', filterType: 'folder', filterVal: '%download%', sortBy: 'recent', mediaType: 'only_videos', excludeShortsInVideoSection: false },
  { id: 'hot', label: 'hot', filterType: 'all', filterVal: '', sortBy: 'hot', mediaType: 'only_videos', excludeShortsInVideoSection: false },
  { id: 'most_liked', label: 'most liked', filterType: 'all', filterVal: '', sortBy: 'likes', mediaType: 'only_videos', excludeShortsInVideoSection: false },
  { id: 'favourite', label: 'favourite', filterType: 'tag', filterVal: 'favourite', sortBy: 'recent', mediaType: 'only_videos', excludeShortsInVideoSection: false }
];

const SORT_OPTIONS = [
  { value: 'mix', label: 'Random Mix' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'hot', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'alpha_asc', label: 'A → Z' },
  { value: 'alpha_desc', label: 'Z → A' },
  { value: 'shortest', label: 'Shortest First' },
  { value: 'longest', label: 'Longest First' },
];

const FILTER_TYPES = [
  { value: 'all', label: 'All Videos (no filter)', hasInput: false },
  { value: 'tag', label: 'Tag / Keyword', placeholder: 'e.g. music', hasInput: true },
  { value: 'folder', label: 'Folder Path', placeholder: 'e.g. %/Music/%', hasInput: true },
  { value: 'extension', label: 'File Extension', placeholder: 'e.g. mp4', hasInput: true },
  { value: 'year', label: 'Upload Year', placeholder: 'e.g. 2023', hasInput: true },
  { value: 'uploader', label: 'Uploader / Author', placeholder: 'e.g. John', hasInput: true },
  { value: 'min_views', label: 'Min Views', placeholder: 'e.g. 1000', hasInput: true },
  { value: 'min_likes', label: 'Min Likes', placeholder: 'e.g. 50', hasInput: true },
  { value: 'min_duration', label: 'Min Duration (mins)', placeholder: 'e.g. 5', hasInput: true },
  { value: 'max_duration', label: 'Max Duration (mins)', placeholder: 'e.g. 10', hasInput: true },
  { value: 'has_subtitles', label: 'Has Subtitles', hasInput: false },
  { value: 'has_description', label: 'Has Description', hasInput: false },
  { value: 'sql', label: 'Custom SQL (WHERE fragment)', placeholder: 'e.g. CAST(views AS UNSIGNED) > 500', hasInput: true },
];

const MEDIA_TYPES = [
  { value: 'only_videos', label: 'Only Video Section (Default)' },
  { value: 'mixed', label: 'Mixed Sections' },
  { value: 'only_shorts', label: 'Only Shorts Section' },
  { value: 'force_shorts', label: 'Force Shorts (Play All Videos as Shorts)' }
];

function buildSqlPreview(filterType, filterVal, sortBy) {
  let where = 'vid_id != 10';
  if (filterType === 'tag' && filterVal)
    where += `\n  AND (tags LIKE '%${filterVal}%' OR vid_name LIKE '%${filterVal}%')`;
  else if (filterType === 'folder' && filterVal)
    where += `\n  AND link LIKE '${filterVal}'`;
  else if (filterType === 'extension' && filterVal)
    where += `\n  AND vid_name LIKE '%.${filterVal}'`;
  else if (filterType === 'year' && filterVal)
    where += `\n  AND upload_date LIKE '${filterVal}%'`;
  else if (filterType === 'uploader' && filterVal)
    where += `\n  AND uploader LIKE '%${filterVal}%'`;
  else if (filterType === 'min_views' && filterVal)
    where += `\n  AND CAST(views AS UNSIGNED) >= ${filterVal}`;
  else if (filterType === 'min_likes' && filterVal)
    where += `\n  AND CAST(likes AS UNSIGNED) >= ${filterVal}`;
  else if (filterType === 'min_duration' && filterVal)
    where += `\n  AND CAST(duration AS UNSIGNED) >= ${parseInt(filterVal) * 60}`;
  else if (filterType === 'max_duration' && filterVal)
    where += `\n  AND CAST(duration AS UNSIGNED) <= ${parseInt(filterVal) * 60}`;
  else if (filterType === 'has_subtitles')
    where += `\n  AND subtitles IS NOT NULL AND subtitles != '' AND subtitles != 'null'`;
  else if (filterType === 'has_description')
    where += `\n  AND description IS NOT NULL AND description != ''`;
  else if (filterType === 'sql' && filterVal)
    where += `\n  AND (${filterVal})`;

  const sortMap = {
    mix: 'RAND()', recent: 'upload_date DESC, upload_time DESC, vid_id DESC',
    oldest: 'upload_date ASC, upload_time ASC, vid_id ASC',
    hot: 'CAST(views AS UNSIGNED) DESC, upload_date DESC',
    likes: 'CAST(likes AS UNSIGNED) DESC, upload_date DESC',
    alpha_asc: 'vid_name ASC', alpha_desc: 'vid_name DESC',
    shortest: 'CAST(duration AS UNSIGNED) ASC, upload_date DESC',
    longest: 'CAST(duration AS UNSIGNED) DESC, upload_date DESC',
  };
  const order = sortMap[sortBy] || 'upload_date DESC';
  return `SELECT * FROM video_metadatas\nWHERE ${where}\nORDER BY ${order}`;
}

function applyCardHoverVars(zoom, glow, color) {
  const root = document.documentElement;
  root.style.setProperty('--card-hover-transform', zoom ? 'translateY(-4px) scale(1.02)' : 'translateY(-2px)');
  root.style.setProperty('--card-hover-shadow', glow ? '0 8px 32px rgba(0,0,0,0.35)' : 'none');
  root.style.setProperty('--card-hover-bg', color !== 'none' && color ? color : 'transparent');
}

export function SettingsView({ currentUser, showFlashNotification }) {
  const [activeTab, setActiveTab] = useState('appearance');

  // Appearance
  const [theme, setTheme] = useState(() => localStorage.getItem('yt_theme') || 'system');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('yt_accent_color') || 'red');

  // Playback
  const [autoplay, setAutoplay] = useState(() => localStorage.getItem('yt_autoplay') !== 'false');
  const [theaterMode, setTheaterMode] = useState(() => localStorage.getItem('yt_theater_mode') === 'true');
  const [defaultSpeed, setDefaultSpeed] = useState(() => parseFloat(localStorage.getItem('yt_default_speed')) || 1.0);
  const [resumePlayback, setResumePlayback] = useState(() => localStorage.getItem('yt_resume_playing') !== 'false');
  const [skipInterval, setSkipInterval] = useState(() => parseInt(localStorage.getItem('yt_skip_interval')) || 10);
  const [persistVolume, setPersistVolume] = useState(() => localStorage.getItem('yt_persist_volume') !== 'false');

  // Crawler
  const [crawlerAutoDelete, setCrawlerAutoDelete] = useState(() => localStorage.getItem('yt_crawler_auto_delete') === 'true');
  const [crawlerAutoThumbnail, setCrawlerAutoThumbnail] = useState(() => localStorage.getItem('yt_crawler_auto_thumbnail') !== 'false');

  // System
  const [logLevel, setLogLevel] = useState(() => localStorage.getItem('yt_log_level') || 'info');

  // Homepage
  const [hoverPlay, setHoverPlay] = useState(() => localStorage.getItem('yt_hover_play') !== 'false');
  const [cardZoom, setCardZoom] = useState(() => localStorage.getItem('yt_card_zoom') !== 'false');
  const [cardGlow, setCardGlow] = useState(() => localStorage.getItem('yt_card_glow') === 'true');
  const [hoverColor, setHoverColor] = useState(() => localStorage.getItem('yt_card_hover_color') || 'none');
  const [customHoverColor, setCustomHoverColor] = useState(() => {
    const c = localStorage.getItem('yt_card_hover_color') || '';
    return c.startsWith('#') ? c : '#1a1a2e';
  });
  const [pills, setPills] = useState(() => {
    try {
      const cached = sessionStorage.getItem('yt_cached_db_pills') || localStorage.getItem('yt_cached_db_pills');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return DEFAULT_PILLS;
  });

  useEffect(() => {
    fetch('./api/index.php?action=get_pills')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPills(data);
          sessionStorage.setItem('yt_cached_db_pills', JSON.stringify(data));
          localStorage.setItem('yt_cached_db_pills', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);
  const [editingPill, setEditingPill] = useState(null);
  const [isAddingPill, setIsAddingPill] = useState(false);
  const [newPill, setNewPill] = useState({ label: '', filterType: 'all', filterVal: '', sortBy: 'recent', mediaType: 'only_videos', excludeShortsInVideoSection: false });
  const [pillPreviewSql, setPillPreviewSql] = useState('');

  // LocalStorage
  const [lsEntries, setLsEntries] = useState([]);
  const [showAllKeys, setShowAllKeys] = useState(false);
  const [lsSearch, setLsSearch] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingVal, setEditingVal] = useState('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newKey, setNewKey] = useState('yt_');
  const [newVal, setNewVal] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Sub-Tab Navigation States
  const [playbackSubTab, setPlaybackSubTab] = useState('controls'); // 'controls' | 'privacy'
  const [homepageSubTab, setHomepageSubTab] = useState('cards'); // 'cards' | 'pills'
  const [librarySubTab, setLibrarySubTab] = useState('crawler'); // 'crawler' | 'history'

  // Privacy & Sensitive Content Exclusion Lists
  const [exclusionLists, setExclusionLists] = useState([]);
  const [isEditingList, setIsEditingList] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [listName, setListName] = useState('');
  const [selectedVideoIds, setSelectedVideoIds] = useState([]);
  const [selectedPills, setSelectedPills] = useState([]);
  const [excludeNextMode, setExcludeNextMode] = useState('none');
  const [excludeSearchSug, setExcludeSearchSug] = useState(false);
  const [excludeWatchNext, setExcludeWatchNext] = useState(false);
  const [excludeSearchResults, setExcludeSearchResults] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);

  const fetchExclusionLists = async () => {
    try {
      const res = await fetch('./api/index.php?action=exclusion_lists');
      const data = await res.json();
      if (Array.isArray(data)) setExclusionLists(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchExclusionLists();
  }, []);

  const [selectedVideosMap, setSelectedVideosMap] = useState({});

  useEffect(() => {
    if (!videoSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingVideos(true);
      try {
        const res = await fetch(`./api/index.php?action=search_suggestions&include_all=1&q=${encodeURIComponent(videoSearchQuery)}`);
        const data = await res.json();
        if (Array.isArray(data)) setSearchResults(data.slice(0, 15));
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingVideos(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [videoSearchQuery]);

  const handleSaveExclusionList = async () => {
    if (!listName.trim()) {
      showFlashNotification('List name is required');
      return;
    }
    try {
      const payload = {
        id: editingListId || 0,
        list_name: listName.trim(),
        video_ids: selectedVideoIds,
        exclude_pills: selectedPills,
        exclude_next: excludeNextMode,
        exclude_search_suggestions: excludeSearchSug ? 1 : 0,
        exclude_watch_next: excludeWatchNext ? 1 : 0,
        exclude_search_results: excludeSearchResults ? 1 : 0
      };
      const res = await fetch('./api/index.php?action=save_exclusion_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showFlashNotification(editingListId ? 'Exclusion list updated!' : 'Exclusion list created!');
        setIsEditingList(false);
        fetchExclusionLists();
      } else {
        showFlashNotification(data.error || 'Failed to save list');
      }
    } catch (e) {
      console.error(e);
      showFlashNotification('Error saving list');
    }
  };

  const handleDeleteExclusionList = async (id) => {
    if (!window.confirm('Delete this exclusion list?')) return;
    try {
      await fetch('./api/index.php?action=delete_exclusion_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      showFlashNotification('Exclusion list deleted');
      fetchExclusionLists();
    } catch (e) {
      console.error(e);
    }
  };

  const parseVideoIds = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(v => parseInt(v)).filter(Boolean);
    if (typeof val === 'string') return val.split(',').map(v => parseInt(v.trim())).filter(Boolean);
    return [];
  };

  const startEditExclusionList = (list) => {
    setEditingListId(list.id);
    setListName(list.list_name || '');
    setSelectedVideoIds(parseVideoIds(list.video_ids));
    setSelectedPills(Array.isArray(list.exclude_pills) ? list.exclude_pills : []);
    setExcludeNextMode(list.exclude_next || 'none');
    setExcludeSearchSug(!!list.exclude_search_suggestions);
    setExcludeWatchNext(!!list.exclude_watch_next);
    setExcludeSearchResults(!!list.exclude_search_results);
    setVideoSearchQuery('');
    setSearchResults([]);
    setIsEditingList(true);
  };

  const getAvailablePillItems = () => {
    const defaults = [
      { id: 'all', label: 'all' },
      { id: 'recent', label: 'recent' },
      { id: 'oldest', label: 'oldest' },
      { id: 'video_songs', label: 'video songs' },
      { id: 'downloads', label: 'downloads' },
      { id: 'hot', label: 'hot' },
      { id: 'most_liked', label: 'most liked' },
      { id: 'favourite', label: 'favourite' }
    ];
    try {
      const custom = JSON.parse(localStorage.getItem('yt_custom_pills') || '[]');
      if (Array.isArray(custom) && custom.length > 0) {
        return custom.map(p => ({ id: p.id, label: p.label || p.id }));
      }
    } catch (e) {}
    return defaults;
  };

  // Other
  const [isRebuilding, setIsRebuilding] = useState(false);

  // Update SQL preview whenever pill editor form changes
  useEffect(() => {
    if (editingPill) {
      setPillPreviewSql(buildSqlPreview(editingPill.filterType, editingPill.filterVal, editingPill.sortBy));
    } else if (isAddingPill) {
      setPillPreviewSql(buildSqlPreview(newPill.filterType, newPill.filterVal, newPill.sortBy));
    }
  }, [editingPill, newPill, isAddingPill]);

  // Load localStorage entries when switching to that tab
  useEffect(() => {
    if (activeTab === 'localstorage') loadLsEntries();
  }, [activeTab]);

  const loadLsEntries = () => {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      entries.push({ key, value: localStorage.getItem(key) });
    }
    entries.sort((a, b) => a.key.localeCompare(b.key));
    setLsEntries(entries);
  };

  const applyThemeVars = (selTheme, selAccent) => {
    const root = document.documentElement;
    let primary = '#ff0000'; let hover = '#cc0000';
    if (selAccent === 'blue') { primary = '#00f0ff'; hover = '#00b8cc'; }
    else if (selAccent === 'purple') { primary = '#b829ff'; hover = '#8f12cc'; }
    else if (selAccent === 'green') { primary = '#10b981'; hover = '#059669'; }
    else if (selAccent === 'gold') { primary = '#f59e0b'; hover = '#d97706'; }
    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--primary-hover', hover);
    root.style.setProperty('--accent-color', primary);
    let themeToApply = selTheme;
    if (selTheme === 'system') themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (themeToApply === 'oled') {
      root.style.setProperty('--bg-color', '#000000'); root.style.setProperty('--card-bg', '#0c0c0c');
      root.style.setProperty('--sidebar-bg', '#000000'); root.style.setProperty('--bg-secondary', '#080808');
      root.style.setProperty('--text-color', '#f1f1f1'); root.style.setProperty('--text-secondary', '#aaa');
      root.style.setProperty('--text-primary', '#f1f1f1'); root.style.setProperty('--border-color', '#222222');
      root.style.setProperty('--glass-bg', 'rgba(12,12,12,0.8)'); root.style.setProperty('--glass-border', 'rgba(255,255,255,0.03)');
      root.style.setProperty('--hover-color', '#151515');
    } else if (themeToApply === 'light') {
      root.style.setProperty('--bg-color', '#f8f9fa'); root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--sidebar-bg', '#0f0f0f'); root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--text-color', '#1a1a1a'); root.style.setProperty('--text-secondary', '#606060');
      root.style.setProperty('--text-primary', '#1a1a1a'); root.style.setProperty('--border-color', '#e5e7eb');
      root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.8)'); root.style.setProperty('--glass-border', 'rgba(0,0,0,0.06)');
      root.style.setProperty('--hover-color', '#f3f4f6');
    } else {
      root.style.setProperty('--bg-color', '#0f0f0f'); root.style.setProperty('--card-bg', '#1f1f1f');
      root.style.setProperty('--sidebar-bg', '#0f0f0f'); root.style.setProperty('--bg-secondary', '#1a1a1a');
      root.style.setProperty('--text-color', '#f1f1f1'); root.style.setProperty('--text-secondary', '#aaa');
      root.style.setProperty('--text-primary', '#f1f1f1'); root.style.setProperty('--border-color', '#3f3f3f');
      root.style.setProperty('--glass-bg', 'rgba(31,31,31,0.7)'); root.style.setProperty('--glass-border', 'rgba(255,255,255,0.05)');
      root.style.setProperty('--hover-color', '#272727');
    }
  };

  const handleSaveAppearance = (newTheme, newAccent) => {
    localStorage.setItem('yt_theme', newTheme); localStorage.setItem('yt_accent_color', newAccent);
    setTheme(newTheme); setAccentColor(newAccent);
    applyThemeVars(newTheme, newAccent);
    showFlashNotification('Appearance settings updated!');
  };

  const updateSetting = (key, value, setter) => {
    localStorage.setItem(key, String(value));
    setter(value);
    showFlashNotification('Setting saved!');
  };

  const handleRebuildSearchIndex = async () => {
    if (isRebuilding) return;
    setIsRebuilding(true);
    try {
      const res = await fetch('./api/index.php?action=rebuild_search_index', { method: 'POST' });
      const data = await res.json();
      if (data && data.success) showFlashNotification(`Successfully re-indexed ${data.count} videos!`);
      else showFlashNotification(data.error || 'Failed to rebuild search index.');
    } catch (e) { showFlashNotification('Error communicating with database.'); }
    finally { setIsRebuilding(false); }
  };

  const handleClearHistory = (type) => {
    if (type === 'search') { localStorage.removeItem('yt_search_history'); showFlashNotification('Search history cleared!'); }
    else if (type === 'playback') { localStorage.removeItem('yt_playback_history'); showFlashNotification('Playback history cleared!'); }
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset all settings to defaults?')) return;
    ['yt_theme', 'yt_accent_color', 'yt_autoplay', 'yt_theater_mode', 'yt_default_speed', 'yt_resume_playing',
      'yt_skip_interval', 'yt_persist_volume', 'yt_crawler_auto_delete', 'yt_crawler_auto_thumbnail', 'yt_log_level',
      'yt_hover_play', 'yt_card_zoom', 'yt_card_glow', 'yt_card_hover_color', 'yt_custom_pills'].forEach(k => localStorage.removeItem(k));
    setTheme('system'); setAccentColor('red'); setAutoplay(true); setTheaterMode(false);
    setDefaultSpeed(1.0); setResumePlayback(true); setSkipInterval(10); setPersistVolume(true);
    setCrawlerAutoDelete(false); setCrawlerAutoThumbnail(true); setLogLevel('info');
    setHoverPlay(true); setCardZoom(true); setCardGlow(false); setHoverColor('none');
    setPills(DEFAULT_PILLS);
    applyThemeVars('system', 'red');
    applyCardHoverVars(true, false, 'none');
    window.dispatchEvent(new CustomEvent('yt-pills-changed'));
    showFlashNotification('All settings reset to defaults.');
  };

  // ---------- Pill helpers ----------
  const savePills = async (updated) => {
    setPills(updated);
    sessionStorage.setItem('yt_cached_db_pills', JSON.stringify(updated));
    localStorage.setItem('yt_cached_db_pills', JSON.stringify(updated));
    try {
      await fetch('./api/index.php?action=save_pills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      window.dispatchEvent(new CustomEvent('yt-pills-changed'));
    } catch (e) {
      console.error('Error saving pills to DB:', e);
    }
  };

  const movePill = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= pills.length) return;
    const updated = [...pills];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    savePills(updated);
  };

  const dragPillIdx = useRef(null);
  const dragOverPillIdx = useRef(null);

  const handleDeletePill = (id) => {
    savePills(pills.filter(p => p.id !== id));
    showFlashNotification('Pill removed.');
  };

  const handleSaveEditPill = () => {
    if (!editingPill.label.trim()) { showFlashNotification('Pill label cannot be empty.'); return; }
    savePills(pills.map(p => p.id === editingPill.id ? { ...editingPill, label: editingPill.label.trim() } : p));
    setEditingPill(null);
    showFlashNotification('Pill updated!');
  };

  const handleAddPill = () => {
    if (!newPill.label.trim()) { showFlashNotification('Pill label cannot be empty.'); return; }
    const id = 'custom_' + Date.now();
    savePills([...pills, { ...newPill, id, label: newPill.label.trim() }]);
    setNewPill({ label: '', filterType: 'tag', filterVal: '', sortBy: 'recent' });
    setIsAddingPill(false);
    showFlashNotification('New pill added!');
  };

  const handleResetPills = () => {
    if (!window.confirm('Reset pills to defaults?')) return;
    savePills(DEFAULT_PILLS);
    showFlashNotification('Pills reset to defaults.');
  };

  // ---------- LocalStorage helpers ----------
  const handleLsSave = (key) => {
    localStorage.setItem(key, editingVal);
    setEditingKey(null);
    loadLsEntries();
    showFlashNotification('Value saved!');
  };

  const handleLsDelete = (key) => {
    if (!window.confirm(`Delete "${key}"?`)) return;
    localStorage.removeItem(key);
    loadLsEntries();
    showFlashNotification('Key deleted.');
  };

  const handleLsCopy = (key, val) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  };

  const handleLsAddEntry = () => {
    if (!newKey.trim()) { showFlashNotification('Key cannot be empty.'); return; }
    localStorage.setItem(newKey.trim(), newVal);
    setNewKey('yt_'); setNewVal(''); setIsAddingEntry(false);
    loadLsEntries();
    showFlashNotification('Entry added!');
  };

  const handleExportLs = () => {
    const obj = {};
    lsEntries.forEach(e => { obj[e.key] = e.value; });
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    showFlashNotification('Copied all entries to clipboard as JSON!');
  };

  const filteredLsEntries = lsEntries.filter(e => {
    if (!showAllKeys && !e.key.startsWith('yt_')) return false;
    if (lsSearch && !e.key.toLowerCase().includes(lsSearch.toLowerCase()) && !e.value.toLowerCase().includes(lsSearch.toLowerCase())) return false;
    return true;
  });

  const filterTypeInfo = (ft) => FILTER_TYPES.find(f => f.value === ft) || FILTER_TYPES[0];

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Sparkles },
    { id: 'playback', label: 'Playback & Player', icon: Play },
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'library', label: 'Library & Sync', icon: FolderClosed },
    { id: 'system', label: 'System & Debug', icon: RotateCcw },
    { id: 'localstorage', label: 'LocalStorage', icon: Database },
  ];

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: value ? 'var(--primary-color)' : 'var(--border-color)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block'
      }} />
    </button>
  );

  const SettingRow = ({ label, desc, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-color)', fontSize: 14 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your custom app preferences, player behaviors, and offline databases.</p>
      </div>

      <div className="settings-layout">
        {/* LEFT TAB MENU */}
        <div className="settings-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="settings-content-panel">

          {/* ======================== APPEARANCE ======================== */}
          {activeTab === 'appearance' && (
            <div className="settings-panel-section">
              <h2>Appearance</h2>
              <p className="section-desc">Customize the color scheme, layout theme, and visual styling of your organizer.</p>

              <div className="settings-control-group">
                <label className="control-label">Theme Mode</label>
                <div className="theme-options-grid">
                  <button className={`theme-option-card system-mode-card ${theme === 'system' ? 'selected' : ''}`} onClick={() => handleSaveAppearance('system', accentColor)}>
                    <div className="theme-preview-box system-box"><div className="preview-left-half" /><div className="preview-right-half" /></div>
                    <span>System Default</span>
                  </button>
                  <button className={`theme-option-card dark-mode-card ${theme === 'dark' ? 'selected' : ''}`} onClick={() => handleSaveAppearance('dark', accentColor)}>
                    <div className="theme-preview-box dark-box"><div style={{ width: '100%', height: '100%', background: '#111', borderRadius: 6 }} /></div>
                    <span>Dark</span>
                  </button>
                  <button className={`theme-option-card oled-mode-card ${theme === 'oled' ? 'selected' : ''}`} onClick={() => handleSaveAppearance('oled', accentColor)}>
                    <div className="theme-preview-box oled-box"><div style={{ width: '100%', height: '100%', background: '#000', borderRadius: 6 }} /></div>
                    <span>OLED Black</span>
                  </button>
                  <button className={`theme-option-card light-mode-card ${theme === 'light' ? 'selected' : ''}`} onClick={() => handleSaveAppearance('light', accentColor)}>
                    <div className="theme-preview-box light-box"><div style={{ width: '100%', height: '100%', background: '#f5f5f5', borderRadius: 6 }} /></div>
                    <span>Light</span>
                  </button>
                </div>
              </div>

              <div className="settings-control-group">
                <label className="control-label">Accent Color</label>
                <p className="control-desc">Changes highlights, active icons, buttons, and system accent marks.</p>
                <div className="accent-options-list">
                  {[
                    { id: 'red', name: 'YouTube Red', color: '#ff0000' },
                    { id: 'blue', name: 'Cyberpunk Blue', color: '#00f0ff' },
                    { id: 'purple', name: 'Neon Purple', color: '#b829ff' },
                    { id: 'green', name: 'Emerald Green', color: '#10b981' },
                    { id: 'gold', name: 'Amber Gold', color: '#f59e0b' }
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      className={`accent-color-circle ${accentColor === acc.id ? 'active' : ''}`}
                      style={{ backgroundColor: acc.color }}
                      title={acc.name}
                      onClick={() => handleSaveAppearance(theme, acc.id)}
                    >
                      {accentColor === acc.id && <Check size={14} style={{ color: acc.id === 'blue' || acc.id === 'gold' ? '#000' : '#fff' }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================== PLAYBACK ======================== */}
          {activeTab === 'playback' && (
            <div className="settings-panel-section">
              <h2>Playback & Player</h2>
              <p className="section-desc">Control default behaviors of the video player, session memory, and privacy exclusions.</p>

              {/* Sub-Tab Navigation Bar */}
              <div className="settings-subtab-bar">
                <button
                  className={`settings-subtab-btn ${playbackSubTab === 'controls' ? 'active' : ''}`}
                  onClick={() => setPlaybackSubTab('controls')}
                >
                  <Play size={14} /> Player Preferences
                </button>
                <button
                  className={`settings-subtab-btn ${playbackSubTab === 'privacy' ? 'active' : ''}`}
                  onClick={() => setPlaybackSubTab('privacy')}
                >
                  <Lock size={14} /> Privacy Exclusions ({exclusionLists.length})
                </button>
              </div>

              {playbackSubTab === 'controls' && (
                <div>
                  <SettingRow label="Autoplay Next Video" desc="Automatically play the next video when current one ends.">
                    <Toggle value={autoplay} onChange={v => updateSetting('yt_autoplay', v, setAutoplay)} />
                  </SettingRow>
                  <SettingRow label="Theater Mode by Default" desc="Open player in theater (wide) mode automatically.">
                    <Toggle value={theaterMode} onChange={v => updateSetting('yt_theater_mode', v, setTheaterMode)} />
                  </SettingRow>
                  <SettingRow label="Resume Playback" desc="Remember and resume video position on revisit.">
                    <Toggle value={resumePlayback} onChange={v => updateSetting('yt_resume_playing', v, setResumePlayback)} />
                  </SettingRow>
                  <SettingRow label="Remember Volume" desc="Persist volume level across sessions. Disable to always start at 50%.">
                    <Toggle value={persistVolume} onChange={v => updateSetting('yt_persist_volume', v, setPersistVolume)} />
                  </SettingRow>

                  <SettingRow label="Default Playback Speed" desc="Speed the player starts at when opening any video.">
                    <select className="settings-select" value={defaultSpeed}
                      onChange={e => updateSetting('yt_default_speed', parseFloat(e.target.value), setDefaultSpeed)}>
                      {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(s => <option key={s} value={s}>{s}x</option>)}
                    </select>
                  </SettingRow>

                  <SettingRow label="Arrow Key Skip Interval" desc="How many seconds Left/Right arrow keys seek in the player.">
                    <select className="settings-select" value={skipInterval}
                      onChange={e => updateSetting('yt_skip_interval', parseInt(e.target.value), setSkipInterval)}>
                      {[5, 10, 15, 20, 30].map(s => <option key={s} value={s}>{s}s</option>)}
                    </select>
                  </SettingRow>
                </div>
              )}

              {playbackSubTab === 'privacy' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ color: 'var(--text-color)', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                        <Lock size={18} style={{ color: 'var(--primary-color)' }} />
                        Sensitive Content & Privacy Exclusion Lists
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
                        Create custom video lists to exclude sensitive content from homepage pills, autoplays, search bar suggestions, and Watch Next recommendations. Saved in database across all devices.
                      </p>
                    </div>
                    {!isEditingList && (
                      <button
                        onClick={() => {
                          setEditingListId(null);
                          setListName('');
                          setSelectedVideoIds([]);
                          setSelectedPills([]);
                          setExcludeNextMode('none');
                          setExcludeSearchSug(false);
                          setExcludeWatchNext(false);
                          setExcludeSearchResults(false);
                          setVideoSearchQuery('');
                          setSearchResults([]);
                          setIsEditingList(true);
                        }}
                        style={{
                          padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--primary-color)',
                          color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
                        }}
                      >
                        <Plus size={14} /> New Exclusion List
                      </button>
                    )}
                  </div>

                {/* List Cards */}
                {!isEditingList && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                    {exclusionLists.length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 13 }}>
                        No privacy exclusion lists created yet. Click "New Exclusion List" above to create your first list.
                      </div>
                    )}
                    {exclusionLists.map(list => {
                      const vids = parseVideoIds(list.video_ids);
                      return (
                        <div key={list.id} style={{ padding: 14, background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-color)' }}>{list.list_name}</span>
                              <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 12, fontSize: 11, color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                📹 {vids.length} videos
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => startEditExclusionList(list)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 10px', color: 'var(--text-color)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Pencil size={13} /> Edit
                              </button>
                              <button onClick={() => handleDeleteExclusionList(list.id)} style={{ background: 'none', border: '1px solid #ef444440', borderRadius: 6, padding: '4px 10px', color: '#ef4444', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </div>
                          {/* Badges */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
                            {list.exclude_pills && list.exclude_pills.length > 0 && (
                              <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: 6 }}>
                                Pills: {(list.exclude_pills.includes('*') || list.exclude_pills.includes('ALL_PILLS')) ? 'All Pills (Current & Future)' : list.exclude_pills.join(', ')}
                              </span>
                            )}
                            {list.exclude_next !== 'none' && (
                              <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '2px 8px', borderRadius: 6 }}>
                                Autoplay: {list.exclude_next.replace('_', ' ')}
                              </span>
                            )}
                            {list.exclude_search_suggestions === 1 && (
                              <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '2px 8px', borderRadius: 6 }}>
                                Search Suggestions
                              </span>
                            )}
                            {list.exclude_watch_next === 1 && (
                              <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: 6 }}>
                                Watch Next Sidebar
                              </span>
                            )}
                            {list.exclude_search_results === 1 && (
                              <span style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.2)', padding: '2px 8px', borderRadius: 6 }}>
                                Search Results
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Editor Modal / Inline Form */}
                {isEditingList && (
                  <div style={{ marginTop: 14, padding: 20, background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                      <h4 style={{ color: 'var(--text-color)', margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Lock size={18} style={{ color: 'var(--primary-color)' }} />
                        {editingListId ? 'Edit Exclusion List' : 'New Privacy Exclusion List'}
                      </h4>
                      <button
                        onClick={() => setIsEditingList(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* SECTION 1: List Details & Videos */}
                    <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                        1. List Details & Video Selection
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>List Name</label>
                        <input
                          value={listName}
                          onChange={e => setListName(e.target.value)}
                          placeholder="e.g. Sensitive Vlogs / Private Collection"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontSize: 13, boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                          Add Videos to List ({selectedVideoIds.length} selected)
                        </label>
                        <input
                          value={videoSearchQuery}
                          onChange={e => setVideoSearchQuery(e.target.value)}
                          placeholder="Type to search video titles or keywords..."
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontSize: 13, boxSizing: 'border-box' }}
                        />
                        
                        {/* Search Suggestions Dropdown */}
                        {searchResults.length > 0 && (
                          <div style={{ marginTop: 6, maxHeight: 180, overflowY: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {searchResults.map(vid => {
                              const isAdded = selectedVideoIds.includes(vid.vid_id);
                              return (
                                <div key={vid.vid_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, background: 'var(--bg-secondary)', gap: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                    <img
                                      src={`./thumbnails/${vid.vid_id}.jpg`}
                                      alt=""
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                      style={{ width: 40, height: 24, borderRadius: 4, objectFit: 'cover', background: '#000', flexShrink: 0 }}
                                    />
                                    <span style={{ fontSize: 12, color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {vid.vid_name.replace(/\.[a-zA-Z0-9]+$/, '')}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (isAdded) {
                                        setSelectedVideoIds(selectedVideoIds.filter(id => id !== vid.vid_id));
                                      } else {
                                        setSelectedVideoIds([...selectedVideoIds, vid.vid_id]);
                                        setSelectedVideosMap(prev => ({ ...prev, [vid.vid_id]: vid.vid_name }));
                                      }
                                    }}
                                    style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: isAdded ? '#ef4444' : 'var(--primary-color)', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}
                                  >
                                    {isAdded ? 'Remove' : '+ Add'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Selected Video Chips */}
                        {selectedVideoIds.length > 0 && (
                          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {selectedVideoIds.map(id => (
                              <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '3px 8px 3px 4px', fontSize: 11, color: 'var(--text-color)' }}>
                                <img
                                  src={`./thumbnails/${id}.jpg`}
                                  alt=""
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                  style={{ width: 22, height: 14, borderRadius: 3, objectFit: 'cover', background: '#000', flexShrink: 0 }}
                                />
                                <span>{selectedVideosMap[id] ? selectedVideosMap[id].replace(/\.[a-zA-Z0-9]+$/, '') : `Video #${id}`}</span>
                                <button
                                  onClick={() => setSelectedVideoIds(selectedVideoIds.filter(vId => vId !== id))}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 700, marginLeft: 2 }}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 2: Homepage & Autoplay Exclusion Rules */}
                    <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                        2. Homepage Pills & Autoplay Rules
                      </div>

                      {/* Exclude From Homepage Pills */}
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                          Exclude from Homepage Category Pills
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {/* Exclude ALL pills wildcard checkbox */}
                          {(() => {
                            const isAllChecked = selectedPills.includes('*') || selectedPills.includes('ALL_PILLS');
                            return (
                              <label style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
                                border: isAllChecked ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                background: isAllChecked ? 'rgba(var(--primary-color-rgb, 255, 0, 0), 0.1)' : 'var(--card-bg)',
                                color: 'var(--text-color)', fontSize: 12, fontWeight: 600, cursor: 'pointer', userSelect: 'none'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={isAllChecked}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedPills(['*', 'ALL_PILLS', ...getAvailablePillItems().map(p => p.id)]);
                                    } else {
                                      setSelectedPills([]);
                                    }
                                  }}
                                />
                                <span>Exclude from ALL pills (current & future pills)</span>
                              </label>
                            );
                          })()}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                            {getAvailablePillItems().map(pill => {
                              const isAllChecked = selectedPills.includes('*') || selectedPills.includes('ALL_PILLS');
                              const checked = isAllChecked || selectedPills.includes(pill.id);
                              return (
                                <label key={pill.id} style={{
                                  display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 16,
                                  border: checked ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                  background: checked ? 'var(--primary-color)' : 'var(--card-bg)',
                                  color: checked ? '#fff' : 'var(--text-color)', fontSize: 11, cursor: 'pointer', userSelect: 'none',
                                  opacity: isAllChecked ? 0.75 : 1
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        setSelectedPills([...selectedPills.filter(p => p !== '*' && p !== 'ALL_PILLS'), pill.id]);
                                      } else {
                                        setSelectedPills(selectedPills.filter(p => p !== pill.id && p !== '*' && p !== 'ALL_PILLS'));
                                      }
                                    }}
                                    style={{ display: 'none' }}
                                  />
                                  <span>{pill.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Exclude from Autoplay / Next Play */}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                          Exclude from Autoplay / Next Play Queue
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[
                            { id: 'none', label: 'Allow in Next Play (No Exclusion)' },
                            { id: 'random_next', label: 'Exclude in Random Next Play' },
                            { id: 'normal_next', label: 'Exclude in Normal Next Play' },
                            { id: 'both', label: 'Exclude in Both (Random & Normal)' }
                          ].map(opt => (
                            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: excludeNextMode === opt.id ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', background: excludeNextMode === opt.id ? 'rgba(var(--primary-color-rgb, 255, 0, 0), 0.08)' : 'var(--card-bg)', color: 'var(--text-color)', fontSize: 12, cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="exclude_next_mode"
                                checked={excludeNextMode === opt.id}
                                onChange={() => setExcludeNextMode(opt.id)}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Search & Sidebar Visibility */}
                    <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                        3. Search & Sidebar Visibility Exclusions
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-color)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={excludeSearchSug} onChange={e => setExcludeSearchSug(e.target.checked)} />
                        <span>Exclude videos from search bar auto-complete suggestions</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-color)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={excludeWatchNext} onChange={e => setExcludeWatchNext(e.target.checked)} />
                        <span>Exclude videos from Watch Next right sidebar recommendations</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-color)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={excludeSearchResults} onChange={e => setExcludeSearchResults(e.target.checked)} />
                        <span>Exclude videos from main video search results query</span>
                      </label>
                    </div>

                    {/* Form Buttons */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                      <button
                        onClick={() => setIsEditingList(false)}
                        style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveExclusionList}
                        style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Save size={14} /> Save List
                      </button>
                    </div>
                  </div>
                )}
                </div>
              )}
            </div>
          )}

          {/* ======================== HOMEPAGE ======================== */}
          {activeTab === 'homepage' && (
            <div className="settings-panel-section">
              <h2>Homepage</h2>
              <p className="section-desc">Customize card behavior, hover effects, and the category pill bar on the home feed.</p>

              {/* Sub-Tab Navigation Bar */}
              <div className="settings-subtab-bar">
                <button
                  className={`settings-subtab-btn ${homepageSubTab === 'cards' ? 'active' : ''}`}
                  onClick={() => setHomepageSubTab('cards')}
                >
                  <Eye size={14} /> Card & Hover Behaviors
                </button>
                <button
                  className={`settings-subtab-btn ${homepageSubTab === 'pills' ? 'active' : ''}`}
                  onClick={() => setHomepageSubTab('pills')}
                >
                  <Home size={14} /> Category Pills Manager ({pills.length})
                </button>
              </div>

              {homepageSubTab === 'cards' && (
                <div>
                  <SettingRow label="Hover-to-Play Preview" desc="Show a silent video preview when hovering over a video card.">
                    <Toggle value={hoverPlay} onChange={v => {
                      localStorage.setItem('yt_hover_play', v);
                      setHoverPlay(v);
                      showFlashNotification('Setting saved!');
                    }} />
                  </SettingRow>

                  <SettingRow label="Scale Card on Hover" desc="Slightly zoom and lift the card when hovering.">
                    <Toggle value={cardZoom} onChange={v => {
                      localStorage.setItem('yt_card_zoom', v);
                      setCardZoom(v);
                      applyCardHoverVars(v, cardGlow, hoverColor);
                      showFlashNotification('Setting saved!');
                    }} />
                  </SettingRow>

                  <SettingRow label="Glow Shadow on Hover" desc="Show a dark drop shadow when hovering over cards.">
                    <Toggle value={cardGlow} onChange={v => {
                      localStorage.setItem('yt_card_glow', v);
                      setCardGlow(v);
                      applyCardHoverVars(cardZoom, v, hoverColor);
                      showFlashNotification('Setting saved!');
                    }} />
                  </SettingRow>

                  <SettingRow label="Card Hover Background Tint" desc="Apply a subtle background color when hovering a card.">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {['none', 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.15)', 'rgba(99,102,241,0.12)', 'rgba(239,68,68,0.1)'].map(c => (
                        <button key={c} title={c === 'none' ? 'None' : c}
                          onClick={() => {
                            localStorage.setItem('yt_card_hover_color', c);
                            setHoverColor(c);
                            applyCardHoverVars(cardZoom, cardGlow, c);
                            showFlashNotification('Setting saved!');
                          }}
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: hoverColor === c ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                            background: c === 'none' ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 0 0 / 10px 10px' : c,
                            cursor: 'pointer', flexShrink: 0
                          }} />
                      ))}
                      <input type="color" title="Custom color" value={customHoverColor}
                        onChange={e => setCustomHoverColor(e.target.value)}
                        onBlur={() => {
                          localStorage.setItem('yt_card_hover_color', customHoverColor);
                          setHoverColor(customHoverColor);
                          applyCardHoverVars(cardZoom, cardGlow, customHoverColor);
                          showFlashNotification('Setting saved!');
                        }}
                        style={{ width: 28, height: 28, border: hoverColor === customHoverColor && customHoverColor.startsWith('#') ? '2px solid var(--primary-color)' : '2px solid var(--border-color)', borderRadius: 6, cursor: 'pointer', padding: 0, background: 'none' }} />
                    </div>
                  </SettingRow>
                </div>
              )}

              {homepageSubTab === 'pills' && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ color: 'var(--text-color)', fontSize: 15, marginBottom: 4 }}>Category Pills Bar</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Add, edit, reorder using drag-and-drop or arrows, or delete the filter pills shown on the home feed.</p>
                  </div>

              {/* Pills List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pills.map((pill, idx) => {
                  const isThisEditing = editingPill && editingPill.id === pill.id;
                  return (
                    <React.Fragment key={pill.id}>
                      <div
                        draggable
                        onDragStart={() => { dragPillIdx.current = idx; }}
                        onDragOver={(e) => { e.preventDefault(); dragOverPillIdx.current = idx; }}
                        onDrop={() => {
                          if (dragPillIdx.current !== null && dragOverPillIdx.current !== null && dragPillIdx.current !== dragOverPillIdx.current) {
                            movePill(dragPillIdx.current, dragOverPillIdx.current);
                          }
                          dragPillIdx.current = null;
                          dragOverPillIdx.current = null;
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          background: 'var(--card-bg)', borderRadius: 10,
                          border: isThisEditing ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                          cursor: 'grab'
                        }}
                      >
                        <GripVertical size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                          <button
                            onClick={() => movePill(idx, idx - 1)}
                            disabled={idx === 0}
                            style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? 'var(--border-color)' : 'var(--text-secondary)', padding: 0 }}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => movePill(idx, idx + 1)}
                            disabled={idx === pills.length - 1}
                            style={{ background: 'none', border: 'none', cursor: idx === pills.length - 1 ? 'default' : 'pointer', color: idx === pills.length - 1 ? 'var(--border-color)' : 'var(--text-secondary)', padding: 0 }}
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <span style={{
                          background: 'var(--primary-color)', color: '#fff', borderRadius: 20,
                          padding: '2px 10px', fontSize: 12, fontWeight: 600, flexShrink: 0
                        }}>{pill.label}</span>
                        <span style={{
                          background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: 12,
                          padding: '2px 8px', fontSize: 11, border: '1px solid var(--border-color)', flexShrink: 0
                        }}>
                          {MEDIA_TYPES.find(m => m.value === (pill.mediaType || 'only_videos'))?.label || 'Only Video Section'}
                          {pill.excludeShortsInVideoSection ? ' (No Shorts)' : ''}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>
                          {filterTypeInfo(pill.filterType).label}{pill.filterVal ? ` → "${pill.filterVal}"` : ''} · {SORT_OPTIONS.find(s => s.value === pill.sortBy)?.label || pill.sortBy}
                        </span>
                        <button onClick={() => { setEditingPill({ ...pill }); setIsAddingPill(false); setPillPreviewSql(buildSqlPreview(pill.filterType, pill.filterVal, pill.sortBy)); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeletePill(pill.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
                          <X size={14} />
                        </button>
                      </div>

                      {/* INLINE EDIT FORM FOR THIS PILL */}
                      {isThisEditing && (() => {
                        const form = editingPill;
                        const setForm = (upd) => setEditingPill(p => ({ ...p, ...upd }));
                        const ftInfo = filterTypeInfo(form.filterType);
                        return (
                          <div style={{ marginTop: 4, marginBottom: 8, padding: 16, background: 'var(--card-bg)', borderRadius: 12, border: '2px solid var(--primary-color)' }}>
                            <h4 style={{ color: 'var(--text-color)', marginBottom: 14, fontSize: 14 }}>Edit Pill</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                              <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Label</label>
                                <input value={form.label} onChange={e => setForm({ label: e.target.value })}
                                  placeholder="e.g. my music"
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13, boxSizing: 'border-box' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Sort By</label>
                                <select value={form.sortBy} onChange={e => setForm({ sortBy: e.target.value })}
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13 }}>
                                  {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Rendered Content</label>
                                <select value={form.mediaType || 'only_videos'} onChange={e => setForm({ mediaType: e.target.value })}
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13 }}>
                                  {MEDIA_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                {(form.mediaType === 'only_videos' || form.mediaType === 'mixed' || !form.mediaType) && (
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-color)', cursor: 'pointer', marginTop: 8 }}>
                                    <input
                                      type="checkbox"
                                      checked={Boolean(form.excludeShortsInVideoSection)}
                                      onChange={e => setForm({ excludeShortsInVideoSection: e.target.checked })}
                                    />
                                    <span>Exclude Shorts in Video Sections</span>
                                  </label>
                                )}
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Filter Type</label>
                                <select value={form.filterType} onChange={e => setForm({ filterType: e.target.value, filterVal: '' })}
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13 }}>
                                  {FILTER_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                              </div>
                              {ftInfo.hasInput && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Filter Value</label>
                                  <input value={form.filterVal} onChange={e => setForm({ filterVal: e.target.value })}
                                    placeholder={ftInfo.placeholder || ''}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13, boxSizing: 'border-box' }} />
                                </div>
                              )}
                            </div>

                            {/* SQL Preview */}
                            <div style={{ marginTop: 12 }}>
                              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>SQL Preview</label>
                              <pre style={{
                                background: '#0d0d0d', color: '#a3e635', padding: '10px 14px', borderRadius: 8,
                                fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: 0,
                                border: '1px solid #333', lineHeight: 1.6
                              }}>{buildSqlPreview(form.filterType, form.filterVal, form.sortBy)}</pre>
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                              <button onClick={handleSaveEditPill}
                                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Save size={14} /> Save Changes
                              </button>
                              <button onClick={() => setEditingPill(null)}
                                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* NEW PILL FORM AT THE BOTTOM */}
              {isAddingPill && (() => {
                const form = newPill;
                const setForm = (upd) => setNewPill(p => ({ ...p, ...upd }));
                const ftInfo = filterTypeInfo(form.filterType);
                return (
                  <div style={{ marginTop: 12, padding: 16, background: 'var(--card-bg)', borderRadius: 12, border: '2px solid var(--primary-color)' }}>
                    <h4 style={{ color: 'var(--text-color)', marginBottom: 14, fontSize: 14 }}>New Pill</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Label</label>
                        <input value={form.label} onChange={e => setForm({ label: e.target.value })}
                          placeholder="e.g. my music"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13, boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Sort By</label>
                        <select value={form.sortBy} onChange={e => setForm({ sortBy: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13 }}>
                          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Rendered Content</label>
                        <select value={form.mediaType || 'only_videos'} onChange={e => setForm({ mediaType: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13 }}>
                          {MEDIA_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        {(form.mediaType === 'only_videos' || form.mediaType === 'mixed' || !form.mediaType) && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-color)', cursor: 'pointer', marginTop: 8 }}>
                            <input
                              type="checkbox"
                              checked={Boolean(form.excludeShortsInVideoSection)}
                              onChange={e => setForm({ excludeShortsInVideoSection: e.target.checked })}
                            />
                            <span>Exclude Shorts in Video Sections</span>
                          </label>
                        )}
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Filter Type</label>
                        <select value={form.filterType} onChange={e => setForm({ filterType: e.target.value, filterVal: '' })}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13 }}>
                          {FILTER_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>
                      {ftInfo.hasInput && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Filter Value</label>
                          <input value={form.filterVal} onChange={e => setForm({ filterVal: e.target.value })}
                            placeholder={ftInfo.placeholder || ''}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13, boxSizing: 'border-box' }} />
                        </div>
                      )}
                    </div>

                    {/* SQL Preview */}
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>SQL Preview</label>
                      <pre style={{
                        background: '#0d0d0d', color: '#a3e635', padding: '10px 14px', borderRadius: 8,
                        fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: 0,
                        border: '1px solid #333', lineHeight: 1.6
                      }}>{buildSqlPreview(form.filterType, form.filterVal, form.sortBy)}</pre>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={handleAddPill}
                        style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Save size={14} /> Add Pill
                      </button>
                      <button onClick={() => setIsAddingPill(false)}
                        style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button onClick={() => { setIsAddingPill(true); setEditingPill(null); }}
                  disabled={isAddingPill || !!editingPill}
                  style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: (isAddingPill || !!editingPill) ? 0.5 : 1 }}>
                  <Plus size={14} /> Add New Pill
                </button>
                <button onClick={handleResetPills}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RotateCcw size={14} /> Reset to Defaults
                </button>
              </div>
              </div>
              )}
            </div>
          )}

          {/* ======================== LIBRARY ======================== */}
          {activeTab === 'library' && (
            <div className="settings-panel-section">
              <h2>Library & Sync</h2>
              <p className="section-desc">Manage your local video database, crawler behavior, and indexing preferences.</p>

              {/* Sub-Tab Navigation Bar */}
              <div className="settings-subtab-bar">
                <button
                  className={`settings-subtab-btn ${librarySubTab === 'crawler' ? 'active' : ''}`}
                  onClick={() => setLibrarySubTab('crawler')}
                >
                  <RefreshCw size={14} /> Crawler & Indexing
                </button>
                <button
                  className={`settings-subtab-btn ${librarySubTab === 'history' ? 'active' : ''}`}
                  onClick={() => setLibrarySubTab('history')}
                >
                  <Trash2 size={14} /> History & Reset
                </button>
              </div>

              {librarySubTab === 'crawler' && (
                <div>
                  <SettingRow label="Auto-Delete Invalid Entries" desc="Automatically remove database entries pointing to missing files during crawl.">
                    <Toggle value={crawlerAutoDelete} onChange={v => updateSetting('yt_crawler_auto_delete', v, setCrawlerAutoDelete)} />
                  </SettingRow>
                  <SettingRow label="Auto-Generate Missing Thumbnails" desc="Auto-generate thumbnails from video frames for entries without a thumbnail file.">
                    <Toggle value={crawlerAutoThumbnail} onChange={v => updateSetting('yt_crawler_auto_thumbnail', v, setCrawlerAutoThumbnail)} />
                  </SettingRow>

                  <div style={{ marginTop: 20 }}>
                    <div className="settings-action-card">
                      <div className="action-card-text">
                        <span className="action-card-title">Rebuild Search Index</span>
                        <span className="action-card-desc">Re-generates the normalized search column for all videos. Run this after bulk metadata edits.</span>
                      </div>
                      <button className="settings-action-btn btn-primary" onClick={handleRebuildSearchIndex} disabled={isRebuilding}>
                        <RefreshCw size={16} className={isRebuilding ? 'spin' : ''} />
                        <span>{isRebuilding ? 'Rebuilding...' : 'Rebuild Index'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {librarySubTab === 'history' && (
                <div style={{ marginTop: 10 }}>
                  <div className="settings-action-card border-danger">
                    <div className="action-card-text">
                      <span className="action-card-title">Clear Playback History</span>
                      <span className="action-card-desc">Removes all locally stored resume positions from your browser storage.</span>
                    </div>
                    <button className="settings-action-btn btn-danger" onClick={() => handleClearHistory('playback')}>
                      <Trash2 size={16} /><span>Clear History</span>
                    </button>
                  </div>

                  <div className="settings-action-card border-danger">
                    <div className="action-card-text">
                      <span className="action-card-title">Clear Search History</span>
                      <span className="action-card-desc">Removes all local stored query suggestions from search bars.</span>
                    </div>
                    <button className="settings-action-btn btn-danger" onClick={() => handleClearHistory('search')}>
                      <Trash2 size={16} /><span>Clear History</span>
                    </button>
                  </div>

                  <div className="settings-action-card border-danger">
                    <div className="action-card-text">
                      <span className="action-card-title">Reset App Configurations</span>
                      <span className="action-card-desc">Restores all player settings, themes, and UI preferences back to clean default states.</span>
                    </div>
                    <button className="settings-action-btn btn-danger" onClick={handleResetDefaults}>
                      <RotateCcw size={16} /><span>Reset Defaults</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================== SYSTEM ======================== */}
          {activeTab === 'system' && (
            <div className="settings-panel-section">
              <h2>System & Debug</h2>
              <p className="section-desc">Advanced internal settings for controlling app behavior, diagnostics, and developer tools.</p>

              <SettingRow label="Console Log Level" desc="Filter the verbosity of browser console output from this app.">
                <select className="settings-select" value={logLevel}
                  onChange={e => updateSetting('yt_log_level', e.target.value, setLogLevel)}>
                  <option value="error">Errors Only</option>
                  <option value="warn">Warnings & Errors</option>
                  <option value="info">Standard Info</option>
                  <option value="debug">Verbose Debugging</option>
                </select>
              </SettingRow>
            </div>
          )}

          {/* ======================== LOCALSTORAGE ======================== */}
          {activeTab === 'localstorage' && (
            <div className="settings-panel-section">
              <h2>LocalStorage Inspector</h2>
              <p className="section-desc">View, edit, add or delete all browser localStorage entries used by this app.</p>

              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  placeholder="Search keys or values..."
                  value={lsSearch}
                  onChange={e => setLsSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13 }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={showAllKeys} onChange={e => setShowAllKeys(e.target.checked)} />
                  Show all keys
                </label>
                <button onClick={loadLsEntries} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <button onClick={handleExportLs} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Copy size={13} /> Export JSON
                </button>
                <button onClick={() => setIsAddingEntry(true)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <Plus size={13} /> Add Entry
                </button>
              </div>

              {/* Add Entry Form */}
              {isAddingEntry && (
                <div style={{ marginBottom: 14, padding: 14, background: 'var(--card-bg)', borderRadius: 10, border: '2px solid var(--primary-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Key</label>
                      <input value={newKey} onChange={e => setNewKey(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Value</label>
                      <input value={newVal} onChange={e => setNewVal(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleLsAddEntry} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Save</button>
                    <button onClick={() => setIsAddingEntry(false)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                Showing <strong style={{ color: 'var(--text-color)' }}>{filteredLsEntries.length}</strong> / {lsEntries.length} total entries
                {!showAllKeys && <span> · <button onClick={() => setShowAllKeys(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: 12, padding: 0 }}>show all</button></span>}
              </div>

              {/* Entries List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredLsEntries.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0', fontSize: 14 }}>No entries found.</div>
                )}
                {filteredLsEntries.map(entry => (
                  <div key={entry.key} style={{
                    background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border-color)',
                    padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code style={{ fontSize: 12, color: 'var(--primary-color)', fontWeight: 700, flex: 1, fontFamily: 'monospace' }}>{entry.key}</code>
                      <button title="Copy value" onClick={() => handleLsCopy(entry.key, entry.value)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedKey === entry.key ? '#22c55e' : 'var(--text-secondary)', padding: 4, display: 'flex', alignItems: 'center' }}>
                        {copiedKey === entry.key ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                      <button title="Edit value" onClick={() => { setEditingKey(entry.key); setEditingVal(entry.value); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, display: 'flex', alignItems: 'center' }}>
                        <Pencil size={13} />
                      </button>
                      <button title="Delete key" onClick={() => handleLsDelete(entry.key)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {editingKey === entry.key ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <textarea value={editingVal} onChange={e => setEditingVal(e.target.value)}
                          rows={Math.min(6, (editingVal.match(/\n/g) || []).length + 2)}
                          style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary-color)', background: 'var(--bg-secondary)', color: 'var(--text-color)', fontSize: 12, fontFamily: 'monospace', resize: 'vertical' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <button onClick={() => handleLsSave(entry.key)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Save</button>
                          <button onClick={() => setEditingKey(null)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace',
                        background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: 6,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                      }} title={entry.value}>
                        {entry.value || <em style={{ opacity: 0.5 }}>(empty)</em>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Danger Zone */}
              <div style={{ marginTop: 24, padding: 16, borderRadius: 10, border: '1px solid #ef444440', background: 'rgba(239,68,68,0.04)' }}>
                <h4 style={{ color: '#ef4444', fontSize: 14, marginBottom: 8 }}>⚠️ Danger Zone</h4>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => {
                    if (!window.confirm('Clear all yt_ localStorage keys? This will reset all app settings.')) return;
                    Object.keys(localStorage).filter(k => k.startsWith('yt_')).forEach(k => localStorage.removeItem(k));
                    loadLsEntries();
                    showFlashNotification('All yt_ keys cleared!');
                  }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ef4444', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    Clear all yt_ keys
                  </button>
                  <button onClick={() => {
                    if (!window.confirm('Clear ENTIRE localStorage? This affects all sites sharing this origin.')) return;
                    localStorage.clear();
                    loadLsEntries();
                    showFlashNotification('LocalStorage cleared!');
                  }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    Clear ALL localStorage
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}