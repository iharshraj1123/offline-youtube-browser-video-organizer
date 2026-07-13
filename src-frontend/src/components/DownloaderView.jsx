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
  const [videoInfo, setVideoInfo] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // yt-dlp status
  const [ytdlpStatus, setYtdlpStatus] = useState({ checking: true, installed: false, version: null, updateAvailable: false });
  const [updating, setUpdating] = useState(false);

  // Download options
  const [quality, setQuality] = useState(QUALITY_PRESETS[0].value);
  const [codec, setCodec] = useState('');
  const [container, setContainer] = useState('');
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

  // Download state
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [downloadEta, setDownloadEta] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');
  const [history, setHistory] = useState([]);
  const eventSourceRef = useRef(null);

  // UI states
  const [showPathSelector, setShowPathSelector] = useState(false);
  const pathSelectorRef = useRef(null);
  const urlInputRef = useRef(null);
  const [pasteHint, setPasteHint] = useState('');

  useEffect(() => {
    checkYtdlp();
    const savedHistory = localStorage.getItem('yt_download_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch {}
    }

    const syncPresets = () => {
      const updated = getDirectoryPresets();
      setPresets(updated);
      setDestinationPreset(prev => {
        const stillExists = updated.some(p => p.name === prev);
        return !stillExists && updated.length > 0 ? updated[0].name : prev;
      });
    };

    window.addEventListener('storage', syncPresets);

    return () => {
      window.removeEventListener('storage', syncPresets);
    };
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

  useEffect(() => {
    localStorage.setItem('yt_download_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  const checkYtdlp = async () => {
    setYtdlpStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await fetch('./api/index.php?action=ytdlp_verify');
      const data = await res.json();
      setYtdlpStatus({
        checking: false,
        installed: data.installed,
        version: data.version,
        updateAvailable: data.update_available,
        updateMessage: data.update_message,
      });
    } catch (e) {
      setYtdlpStatus({ checking: false, installed: false, version: null, updateAvailable: false });
    }
  };

  const handleUpdateYtdlp = async () => {
    setUpdating(true);
    try {
      const res = await fetch('./api/index.php?action=ytdlp_update', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setYtdlpStatus(prev => ({ ...prev, version: data.version, updateAvailable: false }));
      }
    } catch {}
    setUpdating(false);
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setError('');
    setVideoInfo(null);
    setDownloadProgress(0);
    setDownloadStatus('');

    try {
      const formData = new URLSearchParams();
      formData.append('url', url.trim());
      const res = await fetch('./api/index.php?action=ytdlp_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setVideoInfo(data);
        // Auto-select best quality based on available formats
        if (data.formats && data.formats.length > 0) {
          autoSelectQuality(data.formats);
        }
      }
    } catch (e) {
      setError('Failed to fetch video information. Check the URL.');
    }
    setFetching(false);
  };

  const autoSelectQuality = (formats) => {
    const hasVideo = formats.some(f => f.has_video);
    const hasAudio = formats.some(f => f.has_audio);
    if (!hasVideo && hasAudio) {
      setQuality('bestaudio');
    }
  };

  const getBestFormatForQuality = (formats) => {
    if (!formats || formats.length === 0) return 'best';

    // Determine quality level
    let maxHeight = 0;
    if (quality.includes('2160')) maxHeight = 2160;
    else if (quality.includes('1440')) maxHeight = 1440;
    else if (quality.includes('1080')) maxHeight = 1080;
    else if (quality.includes('720')) maxHeight = 720;
    else if (quality.includes('480')) maxHeight = 480;
    else if (quality.includes('360')) maxHeight = 360;

    // Audio only
    if (quality === 'bestaudio') return 'bestaudio';

    // Find best matching format
    let bestFormat = null;
    for (const f of formats) {
      if (!f.has_video) continue;
      if (maxHeight > 0 && f.height && f.height > maxHeight) continue;
      if (codec && f.vcodec && !f.vcodec.includes(codec)) continue;
      if (container && f.ext && f.ext !== container && !(container === 'mp4' && f.ext === 'm4a')) continue;
      if (!bestFormat || (f.height || 0) > (bestFormat.height || 0)) {
        bestFormat = f;
      }
    }
    return bestFormat ? bestFormat.format_id : 'best';
  };

  const handleDownload = async () => {
    if (!url.trim() || !videoInfo) return;

    setDownloading(true);
    setDownloadProgress(0);
    setDownloadSpeed('');
    setDownloadEta('');
    setDownloadStatus('Starting download...');

    let destPath = '';
    if (destinationPreset === 'Custom...') {
      destPath = customPath;
    } else {
      const preset = presets.find(p => p.name === destinationPreset);
      if (preset) destPath = preset.path;
    }

    let formatArg = quality;
    if (!formatArg.startsWith('best') && !formatArg.startsWith('bestvideo')) {
      formatArg = getBestFormatForQuality(videoInfo.formats);
    }

    // Build custom args
    let extraArgs = '';
    if (codec) extraArgs += ` --video-multistreams --prefer-free-formats --format-sort ${codec === 'avc1' ? '+codec:avc1' : '+' + codec}`;
    if (container) extraArgs += ` --merge-output-format ${container}`;
    if (subsEnabled) extraArgs += ` --write-subs --sub-langs ${subsLang} --embed-subs`;
    if (throttle) extraArgs += ` --limit-rate ${throttle}`;
    if (customArgs) extraArgs += ' ' + customArgs;

    try {
      const formData = new URLSearchParams();
      formData.append('url', url.trim());
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
              } else if (msg.type === 'info') {
                setDownloadStatus(msg.message);
              } else if (msg.type === 'complete') {
                setDownloadProgress(100);
                setDownloadStatus('Processing...');
              } else if (msg.type === 'done') {
                setDownloadProgress(100);
                setDownloadStatus('Completed!');
                const entry = {
                  id: Date.now(),
                  url: url.trim(),
                  title: videoInfo.title,
                  file: msg.file,
                  size: msg.size_formatted,
                  quality: quality,
                  timestamp: new Date().toLocaleString(),
                  success: true,
                };
                setHistory(prev => [entry, ...prev]);
                setDownloading(false);
              } else if (msg.type === 'error') {
                setDownloadStatus('Error: ' + msg.message);
                setError(msg.message);
                setDownloading(false);
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      setDownloadStatus('Download failed');
      setError('Connection error');
      setHistory(prev => [{
        id: Date.now(),
        url: url.trim(),
        title: videoInfo?.title || 'Unknown',
        timestamp: new Date().toLocaleString(),
        success: false,
        error: 'Connection error',
      }, ...prev]);
    }
    setDownloading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFetchInfo();
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('yt_download_history');
  };

  const removeHistoryItem = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const getDestinationDisplay = () => {
    if (destinationPreset === 'Custom...') return customPath || 'Custom path...';
    const preset = presets.find(p => p.name === destinationPreset);
    if (!preset) return destinationPreset;
    if (!preset.path) return 'Server Downloads folder';
    return preset.path;
  };

  const isValidUrl = (str) => {
    if (!str) return false;
    return /^https?:\/\/|^www\.|^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(str);
  };

  const handleUrlInput = (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Clipboard is empty');
      return false;
    }
    if (!isValidUrl(trimmed)) {
      setError('Not a valid URL. Copy a link like "youtube.com/watch?v=..." and try again.');
      return false;
    }
    setUrl(trimmed);
    setError('');
    return true;
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleUrlInput(text);
    } catch {
      setPasteHint('Press Ctrl+V to paste');
      urlInputRef.current?.focus();
      setTimeout(() => setPasteHint(''), 4000);
    }
  };

  const handleInputPaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (text && handleUrlInput(text)) {
      setPasteHint('');
    }
  };

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
            <a href="https://github.com/yt-dlp/yt-dlp/releases" target="_blank" rel="noopener" className="btn-install">
              Download yt-dlp
            </a>
          </>
        )}
        <button className="btn-refresh-status" onClick={checkYtdlp} title="Check status">
          <RefreshCw size={14} />
        </button>
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
            disabled={fetching || downloading}
          />
          {url && (
            <button className="btn-clear-url" onClick={() => { setUrl(''); setVideoInfo(null); setError(''); }} disabled={fetching || downloading}>
              <X size={18} />
            </button>
          )}
          <button className="btn-paste" onClick={handlePaste} title="Paste from clipboard" disabled={fetching || downloading}>
            Paste
          </button>
        </div>
        <button
          className={`btn-fetch ${fetching ? 'loading' : ''}`}
          onClick={handleFetchInfo}
          disabled={!url.trim() || fetching || downloading}
        >
          {fetching ? <Loader2 size={18} className="spin" /> : null}
          {fetching ? 'Fetching...' : 'Fetch Info'}
        </button>
      </div>

      {pasteHint && (
        <div className="downloader-hint">
          <AlertTriangle size={14} /> {pasteHint}
        </div>
      )}

      {error && (
        <div className="downloader-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Video Info */}
      {videoInfo && (
        <div className="video-info-section">
          <div className="video-info-card">
            {videoInfo.thumbnail && (
              <div className="video-thumbnail">
                <img src={videoInfo.thumbnail} alt={videoInfo.title} />
                <span className="duration-badge">{formatDuration(videoInfo.duration)}</span>
              </div>
            )}
            <div className="video-details">
              <h2 className="video-title">{videoInfo.title}</h2>
              <div className="video-meta">
                <span><User size={14} /> {videoInfo.uploader}</span>
                <span><Eye size={14} /> {formatNumber(videoInfo.view_count)} views</span>
                {videoInfo.like_count > 0 && <span><ThumbsUp size={14} /> {formatNumber(videoInfo.like_count)}</span>}
                <span><Clock size={14} /> {videoInfo.duration_string}</span>
                <span className="extractor-badge">{videoInfo.extractor}</span>
              </div>
              {videoInfo.description && (
                <div className="video-description">{videoInfo.description.slice(0, 300)}{videoInfo.description.length > 300 ? '...' : ''}</div>
              )}
            </div>
          </div>

          {/* Download Options */}
          <div className="download-options">
            <div className="options-grid">
              <div className="option-group">
                <label>Quality</label>
                <select value={quality} onChange={(e) => setQuality(e.target.value)} disabled={downloading}>
                  {QUALITY_PRESETS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label>Codec</label>
                <select value={codec} onChange={(e) => setCodec(e.target.value)} disabled={downloading}>
                  {CODEC_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label>Format</label>
                <select value={container} onChange={(e) => setContainer(e.target.value)} disabled={downloading}>
                  {CONTAINER_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label>Audio</label>
                <select value={audioFormat} onChange={(e) => setAudioFormat(e.target.value)} disabled={downloading}>
                  {AUDIO_FORMATS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label>Subtitles</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={subsEnabled} onChange={(e) => setSubsEnabled(e.target.checked)} disabled={downloading} />
                    Download subtitles
                  </label>
                  {subsEnabled && (
                    <input
                      type="text"
                      className="input-small"
                      value={subsLang}
                      onChange={(e) => setSubsLang(e.target.value)}
                      placeholder="Language (en, fr, all...)"
                      disabled={downloading}
                    />
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
                        <div
                          key={p.name}
                          className={`path-option ${destinationPreset === p.name ? 'active' : ''}`}
                          onClick={() => { setDestinationPreset(p.name); setShowPathSelector(false); }}
                        >
                          <span className="path-option-name">{p.name}</span>
                          {p.path && <span className="path-option-path">{p.path}</span>}
                        </div>
                      ))}
                      <div className="path-dropdown-divider" />
                      <div
                        className={`path-option ${destinationPreset === 'Custom...' ? 'active' : ''}`}
                        onClick={() => { setDestinationPreset('Custom...'); setShowPathSelector(false); }}
                      >
                        Custom path...
                      </div>
                    </div>
                  )}
                </div>
                {destinationPreset === 'Custom...' && (
                  <input
                    type="text"
                    className="input-small"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="C:\Users\...\folder"
                    disabled={downloading}
                  />
                )}
              </div>
            </div>

            {/* Advanced Toggle */}
            <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Settings size={16} />
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              <ChevronDown size={14} className={`chevron ${showAdvanced ? 'open' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="advanced-options">
                <div className="option-group">
                  <label>Filename Template</label>
                  <input
                    type="text"
                    className="input-full"
                    value={filenameTemplate}
                    onChange={(e) => setFilenameTemplate(e.target.value)}
                    placeholder="%(title)s.%(ext)s"
                    disabled={downloading}
                  />
                  <span className="hint">Use yt-dlp template variables: %(title)s, %(id)s, %(ext)s, %(playlist)s...</span>
                </div>
                <div className="options-grid two-col">
                  <div className="option-group">
                    <label>Throttle Speed</label>
                    <input
                      type="text"
                      className="input-full"
                      value={throttle}
                      onChange={(e) => setThrottle(e.target.value)}
                      placeholder="e.g. 1M, 500K (leave empty for no limit)"
                      disabled={downloading}
                    />
                  </div>
                  <div className="option-group">
                    <label>Custom yt-dlp Args</label>
                    <input
                      type="text"
                      className="input-full"
                      value={customArgs}
                      onChange={(e) => setCustomArgs(e.target.value)}
                      placeholder="--no-mtime --embed-thumbnail ..."
                      disabled={downloading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Available Formats */}
            {videoInfo.formats && videoInfo.formats.length > 0 && (
              <div className="formats-preview">
                <div className="formats-header">
                  <span>Available Formats ({videoInfo.formats.length})</span>
                  <div className="format-legend">
                    <span className="legend-item"><Video size={12} /> Video</span>
                    <span className="legend-item"><Music size={12} /> Audio</span>
                    <span className="legend-item"><Film size={12} /> Video+Audio</span>
                  </div>
                </div>
                <div className="formats-list">
                  {videoInfo.formats.slice(0, 20).map((f, i) => (
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

          {/* Download Progress */}
          {downloading && (
            <div className="download-progress-section">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${downloadProgress}%` }} />
              </div>
              <div className="progress-info">
                <span className="progress-percent">{downloadProgress.toFixed(1)}%</span>
                {downloadSpeed && <span className="progress-speed">{downloadSpeed}</span>}
                {downloadEta && <span className="progress-eta">ETA: {downloadEta}</span>}
              </div>
              <div className="progress-status">{downloadStatus}</div>
            </div>
          )}

          {/* Download Button */}
          <div className="download-action">
            <button
              className={`btn-download ${downloading ? 'downloading' : ''}`}
              onClick={handleDownload}
              disabled={!videoInfo || downloading}
            >
              {downloading ? (
                <><Loader2 size={20} className="spin" /> Downloading...</>
              ) : (
                <><Download size={20} /> Download</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Download History */}
      {history.length > 0 && (
        <div className="download-history">
          <div className="history-header">
            <h3>Download History</h3>
            <button className="btn-clear-history" onClick={clearHistory}>
              <Trash2 size={14} /> Clear All
            </button>
          </div>
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className={`history-item ${item.success ? 'success' : 'failed'}`}>
                <div className="history-icon">
                  {item.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                </div>
                <div className="history-details">
                  <span className="history-title">{item.title || item.url}</span>
                  <span className="history-meta">
                    {item.success ? `${item.file} • ${item.size}` : `Failed: ${item.error || 'Unknown error'}`}
                  </span>
                  <span className="history-time">{item.timestamp}</span>
                </div>
                <button className="btn-remove-history" onClick={() => removeHistoryItem(item.id)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no video info */}
      {!videoInfo && !fetching && !error && (
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
