import React, { useState, useEffect, useRef } from 'react';
import { Download, Link, Image, Music, Video, Film, Clock, User, Eye, ThumbsUp, Settings, Folder, ChevronDown, X, Loader2, CheckCircle, AlertCircle, AlertTriangle, RefreshCw, Trash2, Maximize2, Minimize2 } from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatNumber(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes > 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
  if (bytes > 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
  if (bytes > 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' B';
}

function getDirectoryPresets() {
  const saved = localStorage.getItem('yt_crawler_presets');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return [
    { name: 'Server Downloads', path: '' },
    { name: 'Custom...', path: '__custom__' },
  ];
}

function cleanVideoUrl(rawUrl) {
  try {
    let s = rawUrl.trim();
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    const url = new URL(s);
    let host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtube.com' || host === 'youtu.be') {
      let vid = '';
      if (host === 'youtu.be') {
        vid = url.pathname.replace(/^\//, '').split('/')[0];
      } else {
        vid = url.searchParams.get('v') || '';
      }
      if (vid && /^[a-zA-Z0-9_-]{11}$/.test(vid)) {
        return 'https://www.youtube.com/watch?v=' + vid;
      }
    }
    const trackParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source', 'si', 'list', 'start_radio', 'index', 'feature', 'pp'];
    const params = new URLSearchParams(url.search);
    let changed = false;
    for (const key of trackParams) {
      if (params.has(key)) { params.delete(key); changed = true; }
    }
    if (changed) {
      const qs = params.toString();
      return url.origin + url.pathname + (qs ? '?' + qs : '') + (url.hash || '');
    }
  } catch {}
  return rawUrl.trim();
}

const QUALITY_PRESETS = [
  { label: 'Best Video + Audio', value: 'best' },
  { label: '4K (2160p)', value: 'bestvideo[height<=2160]+bestaudio/best[height<=2160]' },
  { label: '1440p', value: 'bestvideo[height<=1440]+bestaudio/best[height<=1440]' },
  { label: '1080p', value: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]' },
  { label: '720p', value: 'bestvideo[height<=720]+bestaudio/best[height<=720]' },
  { label: '480p', value: 'bestvideo[height<=480]+bestaudio/best[height<=480]' },
  { label: '360p', value: 'bestvideo[height<=360]+bestaudio/best[height<=360]' },
  { label: 'Audio Only (Best)', value: 'bestaudio' },
];

const CODEC_OPTIONS = [
  { label: 'Best', value: '' },
  { label: 'h264 (AVC)', value: 'avc1' },
  { label: 'AV1', value: 'av01' },
  { label: 'VP9', value: 'vp9' },
];

const CONTAINER_OPTIONS = [
  { label: 'Best', value: '' },
  { label: 'MP4', value: 'mp4' },
  { label: 'MKV', value: 'mkv' },
  { label: 'WebM', value: 'webm' },
];

const AUDIO_FORMATS = [
  { label: 'Best', value: 'best' },
  { label: 'MP3', value: 'mp3' },
  { label: 'M4A', value: 'm4a' },
  { label: 'Opus', value: 'opus' },
  { label: 'FLAC', value: 'flac' },
  { label: 'WAV', value: 'wav' },
];

export function DownloaderView({ currentUser }) {
  const [url, setUrl] = useState('');
  const [fetchedItems, setFetchedItems] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const [ytdlpStatus, setYtdlpStatus] = useState({ checking: true, installed: false, version: null, updateAvailable: false });
  const [updating, setUpdating] = useState(false);

  const [quality, setQuality] = useState(QUALITY_PRESETS[0].value);
  const [codec, setCodec] = useState('');
  const [container, setContainer] = useState('mp4');
  const [audioFormat, setAudioFormat] = useState('best');
  const [subsEnabled, setSubsEnabled] = useState(false);
  const [subsLang, setSubsLang] = useState('en');
  const [presets, setPresets] = useState(() => getDirectoryPresets());
  const [destinationPreset, setDestinationPreset] = useState(() => {
    const p = getDirectoryPresets();
    return p.length > 0 ? p[0].name : 'Server Downloads';
  });
  const [customPath, setCustomPath] = useState('');
  const [filenameTemplate, setFilenameTemplate] = useState('%(title)s.%(ext)s');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [throttle, setThrottle] = useState('');
  const [customArgs, setCustomArgs] = useState('');

  const [queueActive, setQueueActive] = useState(false);
  const [currentDownloadId, setCurrentDownloadId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [downloadEta, setDownloadEta] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');
  const [showPathSelector, setShowPathSelector] = useState(false);
  const pathSelectorRef = useRef(null);
  const urlInputRef = useRef(null);
  const [pasteHint, setPasteHint] = useState('');
  const [expandedFormats, setExpandedFormats] = useState({});

  useEffect(() => {
    checkYtdlp();
    const syncPresets = () => {
      const updated = getDirectoryPresets();
      setPresets(updated);
      setDestinationPreset(prev => {
        const stillExists = updated.some(p => p.name === prev);
        return !stillExists && updated.length > 0 ? updated[0].name : prev;
      });
    };
    window.addEventListener('storage', syncPresets);
    return () => window.removeEventListener('storage', syncPresets);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (pathSelectorRef.current && !pathSelectorRef.current.contains(e.target)) {
        setShowPathSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const checkYtdlp = async () => {
    setYtdlpStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await fetch('./api/index.php?action=ytdlp_verify');
      const data = await res.json();
      setYtdlpStatus({ checking: false, installed: data.installed, version: data.version, updateAvailable: data.update_available, updateMessage: data.update_message });
    } catch {
      setYtdlpStatus({ checking: false, installed: false, version: null, updateAvailable: false });
    }
  };

  const handleUpdateYtdlp = async () => {
    setUpdating(true);
    try {
      const res = await fetch('./api/index.php?action=ytdlp_update', { method: 'POST' });
      const data = await res.json();
      if (data.success) setYtdlpStatus(prev => ({ ...prev, version: data.version, updateAvailable: false }));
    } catch {}
    setUpdating(false);
  };

  const getAvailableQualities = (formats) => {
    if (!formats || formats.length === 0) return [];
    const hasVideo = formats.some(f => f.has_video);
    const hasAudio = formats.some(f => f.has_audio);
    const opts = [{ label: 'Best', value: 'bestvideo+bestaudio/best', height: 99999 }];
    const seen = new Set();
    const videoFormats = formats.filter(f => f.has_video && f.height)
      .sort((a, b) => (b.height || 0) - (a.height || 0));
    for (const f of videoFormats) {
      const h = f.height;
      if (seen.has(h)) continue;
      seen.add(h);
      const codec = f.vcodec?.split('.')[0] || '';
      const label = `${h}p${codec ? ' (' + codec + ')' : ''}${f.filesize ? ' ' + formatBytes(f.filesize) : ''}`;
      opts.push({ label, value: `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]`, height: h });
    }
    if (hasAudio) opts.push({ label: 'Audio Only', value: 'bestaudio', height: 0 });
    return opts;
  };

  const autoSelectQuality = (formats) => {
    const hasVideo = formats.some(f => f.has_video);
    const hasAudio = formats.some(f => f.has_audio);
    if (!hasVideo && hasAudio) return 'bestaudio';
    return 'bestvideo+bestaudio/best';
  };

  const getBestFormatForQuality = (formats) => {
    if (!formats || formats.length === 0) return 'best';
    let maxHeight = 0;
    if (quality.includes('2160')) maxHeight = 2160;
    else if (quality.includes('1440')) maxHeight = 1440;
    else if (quality.includes('1080')) maxHeight = 1080;
    else if (quality.includes('720')) maxHeight = 720;
    else if (quality.includes('480')) maxHeight = 480;
    else if (quality.includes('360')) maxHeight = 360;
    if (quality === 'bestaudio') return 'bestaudio';
    let bestFormat = null;
    for (const f of formats) {
      if (!f.has_video) continue;
      if (maxHeight > 0 && f.height && f.height > maxHeight) continue;
      if (codec && f.vcodec && !f.vcodec.includes(codec)) continue;
      if (container && f.ext && f.ext !== container && !(container === 'mp4' && f.ext === 'm4a')) continue;
      if (!bestFormat || (f.height || 0) > (bestFormat.height || 0)) bestFormat = f;
    }
    return bestFormat ? bestFormat.format_id : 'best';
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) return;
    const cleaned = cleanVideoUrl(url);
    setFetching(true);
    setError('');

    const tempItem = {
      id: Date.now(),
      url: url.trim(),
      cleanedUrl: cleaned,
      title: 'Fetching...',
      thumbnail: '',
      duration: 0,
      durationString: '',
      uploader: '',
      formats: [],
      quality: quality,
      status: 'fetching',
      progress: 0, speed: '', eta: '', file: '', size: '', indexed: false, vid_id: null, error: '',
    };
    setFetchedItems(prev => [...prev, tempItem]);
    setUrl('');

    try {
      const formData = new URLSearchParams();
      formData.append('url', cleaned);
      const res = await fetch('./api/index.php?action=ytdlp_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setFetchedItems(prev => prev.map(item => item.id === tempItem.id ? { ...item, status: 'failed', error: data.error } : item));
      } else {
        const avail = data.formats || [];
        const itemQuality = avail.length > 0 ? autoSelectQuality(avail) : quality;
        setFetchedItems(prev => prev.map(item => item.id === tempItem.id ? {
          ...item,
          title: data.title || 'Unknown',
          thumbnail: data.thumbnail || '',
          duration: data.duration || 0,
          durationString: data.duration_string || '0:00',
          uploader: data.uploader || 'Unknown',
          formats: avail,
          quality: itemQuality,
          status: 'ready',
        } : item));
      }
    } catch (e) {
      setError('Failed to fetch video information. Check the URL.');
      setFetchedItems(prev => prev.map(item => item.id === tempItem.id ? { ...item, status: 'failed', error: 'Connection error' } : item));
    }
    setFetching(false);
  };

  const removeFetchedItem = (id) => {
    setFetchedItems(prev => prev.filter(item => item.id !== id));
    setExpandedFormats(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const updateItem = (id, updates) => {
    setFetchedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const downloadItem = async (item) => {
    setQueueActive(true);
    setCurrentDownloadId(item.id);
    setDownloadProgress(0);
    setDownloadSpeed('');
    setDownloadEta('');
    setDownloadStatus('Starting download...');
    updateItem(item.id, { status: 'downloading', progress: 0, speed: '', eta: '', error: '' });

    let destPath = '';
    if (destinationPreset === 'Custom...') {
      destPath = customPath;
    } else {
      const preset = presets.find(p => p.name === destinationPreset);
      if (preset) destPath = preset.path;
    }

    let formatArg = item.quality || quality;
    if (!formatArg.startsWith('best') && !formatArg.startsWith('bestvideo') && item.formats) {
      formatArg = getBestFormatForQuality(item.formats);
    }

    let extraArgs = '';
    if (codec) extraArgs += ` --video-multistreams --prefer-free-formats --format-sort ${codec === 'avc1' ? '+codec:avc1' : '+' + codec}`;
    if (container) extraArgs += ` --merge-output-format ${container}`;
    if (subsEnabled) extraArgs += ` --write-subs --sub-langs ${subsLang} --embed-subs`;
    if (throttle) extraArgs += ` --limit-rate ${throttle}`;
    if (customArgs) extraArgs += ' ' + customArgs;

    try {
      const formData = new URLSearchParams();
      formData.append('url', item.url);
      formData.append('source_url', item.cleanedUrl);
      formData.append('format', formatArg);
      formData.append('destination', destPath);
      formData.append('filename', filenameTemplate);
      formData.append('extra_args', extraArgs);

      const res = await fetch('./api/index.php?action=ytdlp_download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const msg = JSON.parse(line.slice(6));

              if (msg.type === 'progress') {
                setDownloadProgress(msg.percent);
                setDownloadSpeed(msg.speed || '');
                setDownloadEta(msg.eta || '');
                setDownloadStatus(`Downloading... ${msg.percent}%`);
                updateItem(item.id, { progress: msg.percent, speed: msg.speed || '', eta: msg.eta || '' });
              } else if (msg.type === 'info') {
                setDownloadStatus(msg.message);
              } else if (msg.type === 'complete') {
                setDownloadProgress(100);
                setDownloadStatus('Processing...');
                updateItem(item.id, { progress: 100 });
              } else if (msg.type === 'done') {
                setDownloadProgress(100);
                setDownloadStatus('Completed!');
                updateItem(item.id, { status: 'done', progress: 100, file: msg.file, size: msg.size_formatted, indexed: msg.indexed, vid_id: msg.vid_id });
              } else if (msg.type === 'error') {
                setDownloadStatus('Error: ' + msg.message);
                setError(msg.message);
                updateItem(item.id, { status: 'failed', error: msg.message });
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      setDownloadStatus('Download failed');
      setError('Connection error');
      updateItem(item.id, { status: 'failed', error: 'Connection error' });
      setHistory(prev => [{ id: Date.now(), url: item.url, title: item.title || 'Unknown', timestamp: new Date().toLocaleString(), success: false, error: 'Connection error' }, ...prev]);
    }

    setCurrentDownloadId(null);
    const remaining = fetchedItems.filter(f => f.status === 'ready').length;
    if (remaining === 0) {
      setQueueActive(false);
      setDownloadStatus('');
    }
  };

  const handleDownloadAll = async () => {
    const ready = [...fetchedItems.filter(f => f.status === 'ready')];
    if (ready.length === 0) return;
    for (const item of ready) {
      await downloadItem(item);
    }
    setQueueActive(false);
    setCurrentDownloadId(null);
    setDownloadStatus('');
  };

  const handleDownloadSingle = (item) => {
    if (item.status !== 'ready') return;
    downloadItem(item);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFetchInfo();
  };

  const getDestinationDisplay = () => {
    if (destinationPreset === 'Custom...') return customPath || 'Custom path...';
    const preset = presets.find(p => p.name === destinationPreset);
    if (!preset) return destinationPreset;
    if (!preset.path) return 'Server Downloads folder';
    return preset.path;
  };

  const handlePaste = () => {
    setPasteHint('Press Ctrl+V to paste');
    urlInputRef.current?.focus();
    setTimeout(() => setPasteHint(''), 4000);
  };

  const handleInputPaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (text) { setUrl(text.trim()); setError(''); setPasteHint(''); }
  };

  const toggleFormats = (id) => {
    setExpandedFormats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const readyCount = fetchedItems.filter(f => f.status === 'ready').length;
  const doneCount = fetchedItems.filter(f => f.status === 'done').length;
  const failedCount = fetchedItems.filter(f => f.status === 'failed').length;
  const downloadingCount = fetchedItems.filter(f => f.status === 'downloading').length;
  const totalItems = fetchedItems.length;
  const totalProgress = totalItems > 0 ? ((doneCount + failedCount) / totalItems) * 100 : 0;
  const isDownloading = queueActive || downloadingCount > 0;

  return (
    <div className="downloader-view">
      {/* yt-dlp Status Bar */}
      <div className={`ytdlp-status ${ytdlpStatus.installed ? 'installed' : 'missing'} ${ytdlpStatus.updateAvailable ? 'has-update' : ''}`}>
        {ytdlpStatus.checking ? (
          <><Loader2 size={16} className="spin" /> Checking yt-dlp...</>
        ) : ytdlpStatus.installed ? (
          <>
            <CheckCircle size={16} />
            yt-dlp {ytdlpStatus.version}
            {ytdlpStatus.updateAvailable && (
              <span className="update-badge">
                <AlertTriangle size={14} /> Update available
                <button className="btn-update" onClick={handleUpdateYtdlp} disabled={updating}>
                  {updating ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
                  Update
                </button>
              </span>
            )}
          </>
        ) : (
          <>
            <AlertCircle size={16} /> yt-dlp not installed
            <a href="https://github.com/yt-dlp/yt-dlp/releases" target="_blank" rel="noopener" className="btn-install">Download yt-dlp</a>
          </>
        )}
        <button className="btn-refresh-status" onClick={checkYtdlp} title="Check status"><RefreshCw size={14} /></button>
      </div>

      {/* URL Input */}
      <div className="url-input-section">
        <div className="url-input-wrapper">
          <Link size={20} className="url-icon" />
          <input
            ref={urlInputRef}
            type="text"
            className="url-input"
            placeholder="Paste video URL from YouTube or any supported site..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handleInputPaste}
            disabled={fetching || isDownloading}
          />
          {url && (
            <button className="btn-clear-url" onClick={() => { setUrl(''); setError(''); }} disabled={fetching || isDownloading}>
              <X size={18} />
            </button>
          )}
          <button className="btn-paste" onClick={handlePaste} title="Paste from clipboard" disabled={fetching || isDownloading}>
            Paste
          </button>
        </div>
        <button
          className={`btn-fetch ${fetching ? 'loading' : ''}`}
          onClick={handleFetchInfo}
          disabled={!url.trim() || fetching || isDownloading}
        >
          {fetching ? <Loader2 size={18} className="spin" /> : null}
          {fetching ? 'Fetching...' : 'Fetch Info'}
        </button>
      </div>

      {pasteHint && (
        <div className="downloader-hint"><AlertTriangle size={14} /> {pasteHint}</div>
      )}

      {error && (
        <div className="downloader-error"><AlertCircle size={16} /> {error}</div>
      )}

      {/* Fetched Items List */}
      {fetchedItems.length > 0 && (
        <div className="video-info-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color)' }}>
              Fetched Videos ({fetchedItems.length})
              {doneCount > 0 && <span style={{ color: '#4ade80', marginLeft: '8px' }}>{doneCount} done</span>}
              {failedCount > 0 && <span style={{ color: '#f87171', marginLeft: '8px' }}>{failedCount} failed</span>}
            </span>
            {readyCount > 0 && (
              <button className="btn-download" style={{ padding: '8px 16px', fontSize: '13px', width: 'auto' }}
                onClick={handleDownloadAll} disabled={isDownloading}>
                {isDownloading ? <><Loader2 size={14} className="spin" /> Downloading...</> : <><Download size={14} /> Download All ({readyCount})</>}
              </button>
            )}
          </div>

          {fetchedItems.map((item) => (
            <div key={item.id} className="video-info-card" style={{ marginBottom: '8px', padding: '12px', position: 'relative' }}>
              {item.thumbnail && (
                <div className="video-thumbnail" style={{ width: '120px' }}>
                  <img src={item.thumbnail} alt={item.title} style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
                  {item.duration > 0 && <span className="duration-badge">{formatDuration(item.duration)}</span>}
                </div>
              )}
              <div className="video-details" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <span className="video-title" style={{ fontSize: '14px', margin: 0 }}>{item.title}</span>
                  <span className={`extractor-badge`} style={{
                    fontSize: '10px', padding: '2px 8px', whiteSpace: 'nowrap',
                    color: item.status === 'done' ? '#4ade80' : item.status === 'failed' ? '#f87171' : item.status === 'downloading' ? '#fbbf24' : item.status === 'fetching' ? '#60a5fa' : 'var(--text-secondary)',
                    background: item.status === 'done' ? 'rgba(74,222,128,0.1)' : item.status === 'failed' ? 'rgba(248,113,113,0.1)' : item.status === 'downloading' ? 'rgba(251,191,36,0.1)' : 'var(--hover-color)',
                  }}>
                    {item.status === 'ready' ? 'Ready' : item.status === 'done' ? 'Done' : item.status === 'failed' ? 'Failed' : item.status === 'downloading' ? `${item.progress.toFixed(1)}%` : 'Fetching...'}
                  </span>
                </div>
                <div className="video-meta" style={{ fontSize: '12px', marginBottom: 0 }}>
                  <span><User size={12} /> {item.uploader}</span>
                  {item.durationString && <span><Clock size={12} /> {item.durationString}</span>}
                </div>

                {/* Progress bar for downloading item */}
                {item.status === 'downloading' && (
                  <div className="download-progress-section" style={{ marginBottom: 0 }}>
                    <div className="progress-bar-container" style={{ height: '6px' }}>
                      <div className="progress-bar" style={{ width: `${item.progress}%` }} />
                    </div>
                    <div className="progress-info" style={{ fontSize: '11px' }}>
                      <span className="progress-percent">{item.progress.toFixed(1)}%</span>
                      {item.speed && <span className="progress-speed">{item.speed}</span>}
                      {item.eta && <span className="progress-eta">ETA: {item.eta}</span>}
                    </div>
                  </div>
                )}

                {/* Done/failed result */}
                {item.status === 'done' && (
                  <div style={{ fontSize: '11px', color: '#4ade80' }}>
                    {item.file} {item.size && `• ${item.size}`}
                    {item.indexed && <span className="indexed-badge" style={{ marginLeft: '6px' }}>✓ Indexed</span>}
                    {item.cleanedUrl && <div style={{ color: 'var(--border-color)', fontSize: '9px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>source: {item.cleanedUrl}</div>}
                  </div>
                )}
                {item.status === 'failed' && (
                  <div style={{ fontSize: '11px', color: '#f87171' }}>{item.error || 'Failed'}</div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {item.status === 'ready' && (
                    <>
                      <div className="quality-select-wrapper">
                        <select className="quality-select-sm" value={item.quality}
                          onChange={(e) => updateItem(item.id, { quality: e.target.value })}>
                          {getAvailableQualities(item.formats).map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => handleDownloadSingle(item)} disabled={isDownloading}>
                        <Download size={12} /> Download
                      </button>
                    </>
                  )}
                  {item.formats && item.formats.length > 0 && (
                    <button className="advanced-toggle" style={{ padding: '4px 10px', fontSize: '11px', marginTop: 0, width: 'auto' }}
                      onClick={() => toggleFormats(item.id)}>
                      {expandedFormats[item.id] ? 'Hide' : 'Show'} Formats ({item.formats.length})
                      <ChevronDown size={12} className={`chevron ${expandedFormats[item.id] ? 'open' : ''}`} />
                    </button>
                  )}
                  {(item.status === 'ready' || item.status === 'done' || item.status === 'failed') && (
                    <button className="btn-remove-history" style={{ padding: '4px', marginLeft: 'auto' }}
                      onClick={() => removeFetchedItem(item.id)} title="Remove">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Collapsible formats */}
                {expandedFormats[item.id] && item.formats && item.formats.length > 0 && (
                  <div className="formats-preview" style={{ marginTop: '8px' }}>
                    <div className="formats-header" style={{ fontSize: '11px' }}>
                      <span>Available Formats ({item.formats.length})</span>
                      <div className="format-legend">
                        <span className="legend-item"><Video size={10} /> Video</span>
                        <span className="legend-item"><Music size={10} /> Audio</span>
                        <span className="legend-item"><Film size={10} /> Video+Audio</span>
                      </div>
                    </div>
                    <div className="formats-list" style={{ maxHeight: '120px' }}>
                      {item.formats.slice(0, 20).map((f, i) => (
                        <div key={i} className={`format-item ${f.has_video && f.has_audio ? 'both' : f.has_video ? 'video' : 'audio'}`}>
                          <span className="fmt-ext">{f.ext}</span>
                          <span className="fmt-resolution">{f.height ? `${f.height}p` : '-'}{f.fps && f.fps > 30 ? `${f.fps}` : ''}</span>
                          <span className="fmt-codec">{f.vcodec !== 'none' ? f.vcodec?.split('.')[0] : ''} {f.acodec !== 'none' ? f.acodec?.split('.')[0] : ''}</span>
                          <span className="fmt-size">{formatBytes(f.filesize)}</span>
                          <span className="fmt-note">{f.format_note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download Options (always visible when items exist) */}
      {fetchedItems.length > 0 && (
        <div className="download-options">
          <div className="options-grid">
            <div className="option-group">
              <label>Quality</label>
              <select value={quality} onChange={(e) => setQuality(e.target.value)} disabled={isDownloading}>
                {QUALITY_PRESETS.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}
              </select>
            </div>
            <div className="option-group">
              <label>Codec</label>
              <select value={codec} onChange={(e) => setCodec(e.target.value)} disabled={isDownloading}>
                {CODEC_OPTIONS.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
            <div className="option-group">
              <label>Format</label>
              <select value={container} onChange={(e) => setContainer(e.target.value)} disabled={isDownloading}>
                {CONTAINER_OPTIONS.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
            <div className="option-group">
              <label>Audio</label>
              <select value={audioFormat} onChange={(e) => setAudioFormat(e.target.value)} disabled={isDownloading}>
                {AUDIO_FORMATS.map(a => (<option key={a.value} value={a.value}>{a.label}</option>))}
              </select>
            </div>
            <div className="option-group">
              <label>Subtitles</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={subsEnabled} onChange={(e) => setSubsEnabled(e.target.checked)} disabled={isDownloading} />
                  Download subtitles
                </label>
                {subsEnabled && (
                  <input type="text" className="input-small" value={subsLang} onChange={(e) => setSubsLang(e.target.value)} placeholder="Language (en, fr, all...)" disabled={isDownloading} />
                )}
              </div>
            </div>
            <div className="option-group" ref={pathSelectorRef}>
              <label>Save to</label>
              <div className="path-selector" onClick={() => { setPresets(getDirectoryPresets()); setShowPathSelector(!showPathSelector); }}>
                <Folder size={16} />
                <span className="path-display">{getDestinationDisplay()}</span>
                <ChevronDown size={14} />
                {showPathSelector && (
                  <div className="path-dropdown">
                    {presets.map(p => (
                      <div key={p.name} className={`path-option ${destinationPreset === p.name ? 'active' : ''}`}
                        onClick={() => { setDestinationPreset(p.name); setShowPathSelector(false); }}>
                        <span className="path-option-name">{p.name}</span>
                        {p.path && <span className="path-option-path">{p.path}</span>}
                      </div>
                    ))}
                    <div className="path-dropdown-divider" />
                    <div className={`path-option ${destinationPreset === 'Custom...' ? 'active' : ''}`}
                      onClick={() => { setDestinationPreset('Custom...'); setShowPathSelector(false); }}>
                      Custom path...
                    </div>
                  </div>
                )}
              </div>
              {destinationPreset === 'Custom...' && (
                <input type="text" className="input-small" value={customPath} onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="C:\Users\...\folder" disabled={isDownloading} />
              )}
            </div>
          </div>

          <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
            <Settings size={16} />
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            <ChevronDown size={14} className={`chevron ${showAdvanced ? 'open' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="advanced-options">
              <div className="option-group">
                <label>Filename Template</label>
                <input type="text" className="input-full" value={filenameTemplate} onChange={(e) => setFilenameTemplate(e.target.value)}
                  placeholder="%(title)s.%(ext)s" disabled={isDownloading} />
                <span className="hint">Use yt-dlp template variables: %(title)s, %(id)s, %(ext)s, %(playlist)s...</span>
              </div>
              <div className="options-grid two-col">
                <div className="option-group">
                  <label>Throttle Speed</label>
                  <input type="text" className="input-full" value={throttle} onChange={(e) => setThrottle(e.target.value)}
                    placeholder="e.g. 1M, 500K (leave empty for no limit)" disabled={isDownloading} />
                </div>
                <div className="option-group">
                  <label>Custom yt-dlp Args</label>
                  <input type="text" className="input-full" value={customArgs} onChange={(e) => setCustomArgs(e.target.value)}
                    placeholder="--no-mtime --embed-thumbnail ..." disabled={isDownloading} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overall queue progress */}
      {queueActive && (doneCount + failedCount + downloadingCount) > 0 && (
        <div className="download-progress-section" style={{ marginBottom: '16px' }}>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${totalProgress}%` }} />
          </div>
          <div className="progress-info">
            <span className="progress-percent">{totalProgress.toFixed(1)}%</span>
            <span className="progress-speed">{doneCount} done{failedCount > 0 ? `, ${failedCount} failed` : ''}</span>
            <span className="progress-eta">{readyCount + downloadingCount} remaining</span>
          </div>
          <div className="progress-status">
            {(() => { const d = fetchedItems.find(f => f.status === 'downloading'); return d ? `Downloading: ${d.title}` : downloadStatus; })()}
          </div>
        </div>
      )}

      {/* Empty state */}
      {fetchedItems.length === 0 && !fetching && !error && (
        <div className="downloader-empty">
          <Download size={64} className="empty-icon" />
          <h2>Video Downloader</h2>
          <p>Paste a URL from YouTube or any supported site above to get started.</p>
          <p className="empty-hint">Supports 1000+ sites via yt-dlp</p>
        </div>
      )}
    </div>
  );
}
