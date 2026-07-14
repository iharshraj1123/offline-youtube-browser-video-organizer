import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2, FileVideo, Upload, X, Loader2, CheckCircle, AlertCircle,
  RefreshCw, Download, Folder, Clock, Video, Music, Film,
  Settings, HelpCircle, Play, Image, Disc, Radio, Timer, Subtitles,
  Scissors
} from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes > 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
  if (bytes > 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
  if (bytes > 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' B';
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatBitrate(bps) {
  if (!bps) return '';
  if (bps > 1000000) return (bps / 1000000).toFixed(1) + ' Mb/s';
  if (bps > 1000) return (bps / 1000).toFixed(0) + ' kb/s';
  return bps + ' b/s';
}

const VIDEO_CODECS = [
  { value: 'copy', label: 'Copy (no re-encode)', description: 'Copy video stream as-is without re-encoding. Fastest but no quality/size changes.' },
  { value: 'h264', label: 'H.264 (AVC)', description: 'Most compatible codec. Plays on virtually all devices. Good compression.' },
  { value: 'h265', label: 'H.265 (HEVC)', description: 'Better compression than H.264 (~50% smaller). Needs newer devices.' },
  { value: 'vp9', label: 'VP9', description: 'Open, royalty-free codec used by YouTube. Great for web streaming.' },
  { value: 'av1', label: 'AV1', description: 'Next-gen open codec. Best compression but slow to encode.' },
  { value: 'mpeg4', label: 'MPEG-4 (Xvid)', description: 'Legacy codec. Useful for older devices.' },
  { value: 'vp8', label: 'VP8', description: 'Older open codec. WebM compatible.' },
];

const AUDIO_CODECS = [
  { value: 'copy', label: 'Copy (no re-encode)', description: 'Copy audio stream as-is without re-encoding.' },
  { value: 'aac', label: 'AAC', description: 'Standard audio codec for MP4. Good quality at moderate bitrates.' },
  { value: 'mp3', label: 'MP3', description: 'Most compatible audio format. Plays everywhere.' },
  { value: 'opus', label: 'Opus', description: 'Best-in-class open codec. Superior quality at low bitrates.' },
  { value: 'flac', label: 'FLAC', description: 'Lossless audio. Perfect quality, larger files.' },
  { value: 'wav', label: 'WAV', description: 'Uncompressed audio. Huge files, studio quality.' },
  { value: 'ac3', label: 'AC3 (Dolby)', description: 'Used for surround sound in MP4/MKV containers.' },
  { value: 'eac3', label: 'E-AC3 (Dolby+)', description: 'Enhanced AC3. Better quality, used in streaming.' },
];

const CONTAINERS = [
  { value: 'mp4', label: 'MP4', description: 'Most compatible container. Best for H.264/H.265 + AAC.' },
  { value: 'mkv', label: 'MKV (Matroska)', description: 'Flexible container. Supports all codecs, subtitles, chapters.' },
  { value: 'webm', label: 'WebM', description: 'Web-optimized container for VP8/VP9/AV1 + Opus.' },
  { value: 'avi', label: 'AVI', description: 'Legacy container. Large files, limited features.' },
  { value: 'mov', label: 'MOV', description: 'Apple QuickTime format. Good for editing.' },
  { value: 'm4a', label: 'M4A (AAC)', description: 'Audio-only MP4 container for AAC audio.' },
  { value: 'mp3', label: 'MP3', description: 'Audio-only MP3 file.' },
  { value: 'flac', label: 'FLAC', description: 'Audio-only lossless FLAC file.' },
  { value: 'wav', label: 'WAV', description: 'Audio-only uncompressed WAV file.' },
  { value: 'ogg', label: 'OGG', description: 'Open container for Vorbis/Opus audio.' },
  { value: 'gif', label: 'GIF', description: 'Animated GIF. Low quality, small palette.' },
];

const PRESETS = [
  { value: 'ultrafast', label: 'Ultra Fast', description: 'Quick encoding, largest file size.' },
  { value: 'superfast', label: 'Super Fast', description: 'Very fast, large file.' },
  { value: 'veryfast', label: 'Very Fast', description: 'Good speed, moderate file size.' },
  { value: 'faster', label: 'Faster', description: 'Balanced speed/size.' },
  { value: 'fast', label: 'Fast', description: 'Good balance for most uses.' },
  { value: 'medium', label: 'Medium', description: 'Default. Decent compression.' },
  { value: 'slow', label: 'Slow', description: 'Better compression, slower.' },
  { value: 'slower', label: 'Slower', description: 'Good compression for archiving.' },
  { value: 'veryslow', label: 'Very Slow', description: 'Best compression, very slow.' },
];

const TUNE_OPTIONS = [
  { value: '', label: 'None', description: 'Default tuning.' },
  { value: 'film', label: 'Film', description: 'Optimized for live-action movies.' },
  { value: 'animation', label: 'Animation', description: 'Optimized for cartoons/anime.' },
  { value: 'grain', label: 'Grain', description: 'Preserves film grain texture.' },
  { value: 'stillimage', label: 'Still Image', description: 'For slideshow-like content.' },
  { value: 'fastdecode', label: 'Fast Decode', description: 'Optimized for fast playback on weak devices.' },
  { value: 'zerolatency', label: 'Zero Latency', description: 'Minimizes delay for streaming/real-time.' },
];

const PROFILES = [
  { value: '', label: 'Auto', description: 'Let ffmpeg choose the best profile.' },
  { value: 'baseline', label: 'Baseline', description: 'Max compatibility with old devices.' },
  { value: 'main', label: 'Main', description: 'Standard profile. Good compatibility.' },
  { value: 'high', label: 'High', description: 'Best quality. Most modern devices.' },
  { value: 'high10', label: 'High 10', description: '10-bit support. Better for HDR.' },
  { value: 'high422', label: 'High 4:2:2', description: 'Chroma subsampling 4:2:2. For professional use.' },
  { value: 'high444', label: 'High 4:4:4', description: 'Full chroma. Lossless/lossless-like quality.' },
];

const PIX_FMTS = [
  { value: '', label: 'Auto', description: 'Let ffmpeg choose pixel format.' },
  { value: 'yuv420p', label: 'YUV 4:2:0 (8-bit)', description: 'Most compatible. Standard for delivery.' },
  { value: 'yuv422p', label: 'YUV 4:2:2 (8-bit)', description: 'Better color quality. For editing.' },
  { value: 'yuv444p', label: 'YUV 4:4:4 (8-bit)', description: 'Full color information.' },
  { value: 'yuv420p10le', label: 'YUV 4:2:0 (10-bit)', description: '10-bit for HDR content.' },
  { value: 'yuv422p10le', label: 'YUV 4:2:2 (10-bit)', description: '10-bit 4:2:2. Professional.' },
  { value: 'yuv444p10le', label: 'YUV 4:4:4 (10-bit)', description: '10-bit 4:4:4. Maximum quality.' },
];

const AUDIO_BITRATES = [
  { value: 'auto', label: 'Auto', description: 'Let ffmpeg choose based on codec.' },
  { value: '32k', label: '32 kb/s', description: 'Low quality. Speech/mono only.' },
  { value: '64k', label: '64 kb/s', description: 'Acceptable for speech.' },
  { value: '96k', label: '96 kb/s', description: 'Good for mixed content.' },
  { value: '128k', label: '128 kb/s', description: 'Standard quality. Good for most.' },
  { value: '160k', label: '160 kb/s', description: 'Better than standard.' },
  { value: '192k', label: '192 kb/s', description: 'High quality.' },
  { value: '256k', label: '256 kb/s', description: 'Very high quality.' },
  { value: '320k', label: '320 kb/s', description: 'Maximum MP3/AAC quality.' },
  { value: '512k', label: '512 kb/s', description: 'High bitrate lossy.' },
];

const SAMPLE_RATES = [
  { value: 'original', label: 'Original', description: 'Keep original sample rate.' },
  { value: '8000', label: '8 kHz', description: 'Telephone quality.' },
  { value: '11025', label: '11.025 kHz', description: 'Low quality speech.' },
  { value: '16000', label: '16 kHz', description: 'Wideband speech.' },
  { value: '22050', label: '22.05 kHz', description: 'FM radio quality.' },
  { value: '44100', label: '44.1 kHz', description: 'CD quality.' },
  { value: '48000', label: '48 kHz', description: 'DVD/studio quality.' },
  { value: '96000', label: '96 kHz', description: 'High-resolution audio.' },
  { value: '192000', label: '192 kHz', description: 'Ultra high-resolution.' },
];

const CHANNEL_OPTIONS = [
  { value: 'original', label: 'Original', description: 'Keep original channel count.' },
  { value: 'mono', label: 'Mono', description: 'Single channel. Smallest.' },
  { value: 'stereo', label: 'Stereo', description: 'Two channels. Standard.' },
  { value: '5.1', label: '5.1 Surround', description: '6 channels. Home theater.' },
  { value: '7.1', label: '7.1 Surround', description: '8 channels. Cinema quality.' },
];

const RESOLUTIONS = [
  { value: 'original', label: 'Original', description: 'Keep original resolution.' },
  { value: '4320', label: '8K (4320p)', description: 'Ultra high definition.' },
  { value: '2160', label: '4K (2160p)', description: 'Ultra HD.' },
  { value: '1440', label: '1440p (2K)', description: 'Quad HD.' },
  { value: '1080', label: '1080p (Full HD)', description: 'Full high definition.' },
  { value: '720', label: '720p (HD)', description: 'High definition.' },
  { value: '540', label: '540p', description: 'Standard definition plus.' },
  { value: '480', label: '480p (SD)', description: 'Standard definition DVD quality.' },
  { value: '360', label: '360p', description: 'Low resolution.' },
];

const FPS_OPTIONS = [
  { value: 'original', label: 'Original', description: 'Keep original frame rate.' },
  { value: '60', label: '60 fps', description: 'Smooth motion. For gaming/sports.' },
  { value: '50', label: '50 fps', description: 'PAL standard smooth.' },
  { value: '30', label: '30 fps', description: 'Standard smooth motion.' },
  { value: '29.97', label: '29.97 fps', description: 'NTSC standard.' },
  { value: '25', label: '25 fps', description: 'PAL/European standard.' },
  { value: '24', label: '24 fps', description: 'Cinematic film look.' },
  { value: '23.976', label: '23.976 fps', description: 'Film standard.' },
];

const HW_ACCELS = [
  { value: 'none', label: 'None (Software)', description: 'CPU-based encoding. Highest quality.' },
  { value: 'cuda', label: 'NVIDIA CUDA/NVENC', description: 'GPU-accelerated (NVIDIA). Fast encoding.' },
  { value: 'qsv', label: 'Intel QSV', description: 'GPU-accelerated (Intel). Good speed.' },
  { value: 'amf', label: 'AMD AMF', description: 'GPU-accelerated (AMD).' },
  { value: 'videotoolbox', label: 'Apple VideoToolbox', description: 'GPU-accelerated (macOS).' },
  { value: 'dxva2', label: 'DXVA2', description: 'DirectX acceleration (Windows).' },
];

function OptionTooltip({ text }) {
  return (
    <span className="option-tooltip" title={text}>
      <HelpCircle size={14} />
    </span>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <div className="conv-section">
      <div className="conv-section-header">
        {Icon && <Icon size={18} />}
        <span className="conv-section-title">{title}</span>
      </div>
      {description && <p className="conv-section-desc">{description}</p>}
      <div className="conv-section-body">{children}</div>
    </div>
  );
}

function ToggleSection({ icon: Icon, title, description, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`toggle-section ${open ? 'open' : ''}`}>
      <button className="toggle-section-header" onClick={() => setOpen(!open)} type="button">
        <span className="toggle-section-header-left">
          {Icon && <Icon size={18} />}
          <span className="toggle-section-title">{title}</span>
        </span>
        <span className="toggle-section-chevron">
          {open ? '−' : '+'}
        </span>
      </button>
      {description && <p className="toggle-section-desc">{description}</p>}
      {open && <div className="toggle-section-body">{children}</div>}
    </div>
  );
}

function OptionRow({ label, description, tooltip, children, fullWidth = false }) {
  return (
    <div className={`option-row ${fullWidth ? 'full-width' : ''}`}>
      <div className="option-label">
        <span className="option-label-text">{label}</span>
        {tooltip && <OptionTooltip text={tooltip} />}
        {description && <span className="option-description">{description}</span>}
      </div>
      <div className="option-control">{children}</div>
    </div>
  );
}

function StreamCard({ stream }) {
  const isVideo = stream.type === 'video';
  const isAudio = stream.type === 'audio';
  const isSub = stream.type === 'subtitle';
  return (
    <div className={`stream-card stream-${stream.type}`}>
      <div className="stream-icon">
        {isVideo ? <Video size={16} /> : isAudio ? <Music size={16} /> : isSub ? <Subtitles size={16} /> : <Film size={16} />}
      </div>
      <div className="stream-info">
        <div className="stream-header">
          <span className="stream-index">#{stream.index}</span>
          <span className="stream-codec">{stream.codec}</span>
          {stream.profile && <span className="stream-profile">{stream.profile}</span>}
        </div>
        <div className="stream-details">
          {isVideo && (
            <>
              <span>{stream.width}x{stream.height}</span>
              {stream.fps && <span>{stream.fps} fps</span>}
              {stream.pix_fmt && <span>{stream.pix_fmt}</span>}
              {stream.bitrate > 0 && <span>{formatBitrate(stream.bitrate)}</span>}
              {stream.aspect_ratio && <span>{stream.aspect_ratio}</span>}
              {stream.bits_per_raw_sample > 8 && <span>{stream.bits_per_raw_sample}-bit</span>}
            </>
          )}
          {isAudio && (
            <>
              <span>{stream.channel_layout || (stream.channels + ' ch')}</span>
              {stream.sample_rate > 0 && <span>{(stream.sample_rate / 1000).toFixed(0)} kHz</span>}
              {stream.bitrate > 0 && <span>{formatBitrate(stream.bitrate)}</span>}
              {stream.language && <span>{stream.language.toUpperCase()}</span>}
            </>
          )}
          {isSub && (
            <>
              {stream.language && <span>{stream.language.toUpperCase()}</span>}
              {stream.title && <span>{stream.title}</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConverterView() {
  const [ffmpegStatus, setFfmpegStatus] = useState({ checking: true, installed: false, ffmpeg_version: null, video_encoders: [], audio_encoders: [] });

  // File selection
  const [filePath, setFilePath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Conversion options
  const [container, setContainer] = useState('mp4');
  const [videoCodec, setVideoCodec] = useState('copy');
  const [audioCodec, setAudioCodec] = useState('copy');
  const [crf, setCrf] = useState(23);
  const [videoBitrate, setVideoBitrate] = useState('auto');
  const [resolution, setResolution] = useState('original');
  const [framerate, setFramerate] = useState('original');
  const [preset, setPreset] = useState('medium');
  const [tune, setTune] = useState('');
  const [profile, setProfile] = useState('');
  const [pixFmt, setPixFmt] = useState('');
  const [audioBitrate, setAudioBitrate] = useState('auto');
  const [sampleRate, setSampleRate] = useState('original');
  const [channels, setChannels] = useState('original');
  const [volume, setVolume] = useState('0');

  // Trim
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');

  // Subtitles
  const [subtitleMode, setSubtitleMode] = useState('none');

  // Advanced
  const [deinterlace, setDeinterlace] = useState(false);
  const [hwaccel, setHwaccel] = useState('none');
  const [twoPass, setTwoPass] = useState(false);
  const [threads, setThreads] = useState('0');
  const [metadataPreserve, setMetadataPreserve] = useState(true);
  const [customArgs, setCustomArgs] = useState('');

  // Conversion state
  const [converting, setConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertTime, setConvertTime] = useState('');
  const [convertFps, setConvertFps] = useState('');
  const [convertSpeed, setConvertSpeed] = useState('');
  const [convertBitrate, setConvertBitrate] = useState('');
  const [convertEta, setConvertEta] = useState('');
  const [convertStatus, setConvertStatus] = useState('');
  const [convertLog, setConvertLog] = useState([]);
  const [convertDone, setConvertDone] = useState(null);

  useEffect(() => {
    checkFfmpeg();
  }, []);

  const checkFfmpeg = async () => {
    setFfmpegStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await fetch('./api/index.php?action=ffmpeg_verify');
      const data = await res.json();
      setFfmpegStatus({
        checking: false,
        installed: data.installed,
        ffmpeg_version: data.ffmpeg_version,
        ffprobe_version: data.ffprobe_version,
        video_encoders: data.video_encoders || [],
        audio_encoders: data.audio_encoders || [],
        hwaccels: data.hwaccels || [],
      });
    } catch {
      setFfmpegStatus({ checking: false, installed: false, ffmpeg_version: null, video_encoders: [], audio_encoders: [] });
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFilePath('');
    setMediaInfo(null);
    setConvertDone(null);
    setFileError('');
    await loadFileInfo(null, file);
  };

  const handlePathSubmit = async () => {
    if (!filePath.trim()) return;
    setSelectedFile(null);
    setMediaInfo(null);
    setConvertDone(null);
    setFileError('');
    await loadFileInfo(filePath.trim(), null);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePath('');
      setMediaInfo(null);
      setConvertDone(null);
      setFileError('');
      await loadFileInfo(null, file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const loadFileInfo = async (path, file) => {
    setLoadingInfo(true);
    setFileError('');
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (path) {
        formData.append('path', path);
      }
      const res = await fetch('./api/index.php?action=ffmpeg_info', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setFileError(data.error);
        setMediaInfo(null);
      } else {
        setMediaInfo(data);
      }
    } catch (e) {
      setFileError('Failed to load file information: ' + e.message);
      setMediaInfo(null);
    }
    setLoadingInfo(false);
  };

  const videoStreams = mediaInfo?.streams?.filter(s => s.type === 'video') || [];
  const audioStreams = mediaInfo?.streams?.filter(s => s.type === 'audio') || [];
  const subtitleStreams = mediaInfo?.streams?.filter(s => s.type === 'subtitle') || [];

  // Auto-detect container from media info
  useEffect(() => {
    if (mediaInfo) {
      const fmt = mediaInfo.format_name;
      if (fmt && CONTAINERS.some(c => c.value === fmt)) {
        setContainer(fmt);
      }
    }
  }, [mediaInfo]);

  // CRF-based quality descriptions
  const getCrfDescription = (val) => {
    const v = parseInt(val);
    if (v <= 17) return 'Visually lossless. Very high quality, large file.';
    if (v <= 22) return 'High quality. Great for archiving.';
    if (v <= 27) return 'Good quality. Standard for most uses.';
    if (v <= 32) return 'Acceptable quality. Smaller file size.';
    if (v <= 40) return 'Low quality. Very small file.';
    return 'Very low quality. Minimal file size.';
  };

  const handleConvert = async () => {
    setConverting(true);
    setConvertProgress(0);
    setConvertTime('');
    setConvertFps('');
    setConvertSpeed('');
    setConvertBitrate('');
    setConvertEta('');
    setConvertStatus('Starting conversion...');
    setConvertLog([]);
    setConvertDone(null);

    const options = {
      container,
      video_codec: videoCodec,
      audio_codec: audioCodec,
      crf: videoCodec !== 'copy' ? crf : '',
      video_bitrate: (videoCodec !== 'copy' && videoBitrate !== 'auto') ? videoBitrate : '',
      resolution: resolution,
      framerate: framerate,
      preset: videoCodec !== 'copy' ? preset : '',
      tune: tune,
      profile: profile,
      pix_fmt: pixFmt,
      audio_bitrate: (audioCodec !== 'copy' && audioBitrate !== 'auto') ? audioBitrate : '',
      sample_rate: sampleRate,
      channels: channels,
      volume: volume,
      start_time: startTime,
      duration: duration,
      subtitle_mode: subtitleMode,
      deinterlace: deinterlace,
      hwaccel: hwaccel,
      two_pass: twoPass,
      threads: threads,
      metadata_preserve: metadataPreserve,
      custom_args: customArgs,
    };

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('input', selectedFile.name);
        formData.append('file', selectedFile);
      } else {
        formData.append('input', filePath);
      }
      formData.append('path', selectedFile ? selectedFile.name : filePath);
      formData.append('options', JSON.stringify(options));

      const res = await fetch('./api/index.php?action=ffmpeg_convert', {
        method: 'POST',
        body: formData,
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
                setConvertProgress(msg.percent);
                setConvertTime(msg.time || '');
                setConvertFps(msg.fps || '');
                setConvertSpeed(msg.speed || '');
                setConvertBitrate(msg.bitrate || '');
                setConvertEta(msg.eta ? `${msg.eta}s` : '');
                setConvertStatus(`Converting... ${msg.percent}%`);
              } else if (msg.type === 'info') {
                setConvertStatus(msg.message);
                setConvertLog(prev => [...prev, msg.message]);
              } else if (msg.type === 'complete') {
                setConvertProgress(100);
                setConvertStatus('Finalizing...');
              } else if (msg.type === 'done') {
                setConvertProgress(100);
                setConvertStatus('Conversion complete!');
                setConvertDone(msg);
              } else if (msg.type === 'error') {
                setConvertStatus('Error: ' + msg.message);
                setConvertLog(prev => [...prev, 'ERROR: ' + msg.message]);
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      setConvertStatus('Connection error');
      setConvertLog(prev => [...prev, 'Connection error: ' + e.message]);
    }

    setConverting(false);
  };

  const handleDownload = async (token, filename) => {
    const a = document.createElement('a');
    a.href = `./api/index.php?action=ffmpeg_download&token=${token}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setConvertDone(null);
    setSelectedFile(null);
    setMediaInfo(null);
    setFilePath('');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setMediaInfo(null);
    setFilePath('');
    setFileError('');
    setConvertDone(null);
    setConvertProgress(0);
    setConvertStatus('');
  };

  const clearFile = () => {
    handleReset();
  };

  const hasEncoder = (name) => {
    return ffmpegStatus.video_encoders?.some(e => e.includes(name)) ||
           ffmpegStatus.audio_encoders?.some(e => e.includes(name));
  };

  const getAvailableVideoCodecs = () => {
    return VIDEO_CODECS.filter(c => {
      if (c.value === 'copy') return true;
      const encoderMap = {
        'h264': 'libx264', 'h265': 'libx265', 'vp9': 'libvpx-vp9',
        'av1': 'libaom-av1', 'mpeg4': 'mpeg4', 'vp8': 'libvpx'
      };
      const enc = encoderMap[c.value];
      return !enc || hasEncoder(enc);
    });
  };

  const getAvailableAudioCodecs = () => {
    return AUDIO_CODECS.filter(c => {
      if (c.value === 'copy') return true;
      const encoderMap = {
        'aac': 'aac', 'mp3': 'libmp3lame', 'opus': 'libopus',
        'flac': 'flac', 'wav': 'pcm_s16le', 'ac3': 'ac3', 'eac3': 'eac3'
      };
      const enc = encoderMap[c.value];
      return !enc || hasEncoder(enc);
    });
  };

  const isAudioOnly = ['m4a', 'mp3', 'flac', 'wav', 'ogg'].includes(container);
  const isAudioContainer = isAudioOnly;
  const isGif = container === 'gif';
  const showVideoOptions = !isAudioContainer && !isGif;
  const showGifOptions = isGif;

  return (
    <div className="converter-view">
      {/* FFmpeg Status Bar */}
      <div className={`ffmpeg-status ${ffmpegStatus.installed ? 'installed' : 'missing'}`}>
        {ffmpegStatus.checking ? (
          <><Loader2 size={16} className="spin" /> Checking FFmpeg...</>
        ) : ffmpegStatus.installed ? (
          <>
            <CheckCircle size={16} />
            <span className="ffmpeg-version">FFmpeg {ffmpegStatus.ffmpeg_version || ''}</span>
            <span className="ffmpeg-stat">{ffmpegStatus.video_encoders?.length || 0} encoders</span>
            {ffmpegStatus.hwaccels?.filter(h => h.length < 30 && !h.includes(' ')).length > 0 && (
              <span className="ffmpeg-stat hw">HW: {ffmpegStatus.hwaccels.filter(h => h.length < 30 && !h.includes(' ')).join(', ')}</span>
            )}
            <button className="btn-refresh-status" onClick={checkFfmpeg} title="Check status">
              <RefreshCw size={14} />
            </button>
          </>
        ) : (
          <>
            <AlertCircle size={16} /> FFmpeg not found
            <span className="ffmpeg-install-hint">Install FFmpeg from <a href="https://ffmpeg.org" target="_blank" rel="noopener">ffmpeg.org</a></span>
          </>
        )}
      </div>

      {/* File Selection */}
      {!mediaInfo && !loadingInfo && !fileError && (
        <div className="file-selection-section">
          {/* Drag & Drop Zone */}
          <div
            ref={dropZoneRef}
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={40} className="drop-zone-icon" />
            <h3>Drop a media file here</h3>
            <p>or click to browse your files</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileSelected}
            />
          </div>

          <div className="path-input-divider"><span>OR enter a server path</span></div>

          <div className="path-input-section">
            <div className="path-input-wrapper">
              <Folder size={18} className="path-icon" />
              <input
                type="text"
                className="path-input"
                placeholder="C:\Users\...\video.mp4"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePathSubmit(); }}
              />
            </div>
            <button className="btn-fetch" onClick={handlePathSubmit} disabled={!filePath.trim()}>
              <FileVideo size={16} /> Load File
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loadingInfo && (
        <div className="info-loading">
          <Loader2 size={32} className="spin" />
          <p>Analyzing file...</p>
        </div>
      )}

      {/* Error */}
      {fileError && !mediaInfo && !loadingInfo && (
        <div className="converter-error">
          <AlertCircle size={16} />
          <span>{fileError}</span>
          <button className="btn-try-again" onClick={clearFile}>Try Again</button>
        </div>
      )}

      {/* Media Info Panel */}
      {mediaInfo && !loadingInfo && (
        <div className="media-info-panel">
          <div className="media-info-header">
            <div className="media-filename">
              <FileVideo size={18} />
              <span title={mediaInfo.filename}>{mediaInfo.filename}</span>
              <span className="media-format-badge">{mediaInfo.format_name}</span>
            </div>
            <div className="media-actions">
              <button className="btn-icon" onClick={clearFile} title="Clear file"><X size={16} /></button>
            </div>
          </div>

          <div className="media-stats">
            <div className="media-stat">
              <Clock size={14} />
              <span className="stat-label">Duration</span>
              <span className="stat-value">{formatDuration(mediaInfo.duration)}</span>
            </div>
            <div className="media-stat">
              <Disc size={14} />
              <span className="stat-label">Size</span>
              <span className="stat-value">{formatBytes(mediaInfo.size)}</span>
            </div>
            <div className="media-stat">
              <Radio size={14} />
              <span className="stat-label">Bitrate</span>
              <span className="stat-value">{formatBitrate(mediaInfo.bit_rate)}</span>
            </div>
            <div className="media-stat">
              <Film size={14} />
              <span className="stat-label">Streams</span>
              <span className="stat-value">{mediaInfo.streams?.length || 0}</span>
            </div>
          </div>

          {/* Streams */}
          {videoStreams.length > 0 && (
            <div className="streams-section">
              <h4 className="streams-heading"><Video size={16} /> Video Streams ({videoStreams.length})</h4>
              <div className="streams-list">
                {videoStreams.map(s => <StreamCard key={s.index} stream={s} />)}
              </div>
            </div>
          )}
          {audioStreams.length > 0 && (
            <div className="streams-section">
              <h4 className="streams-heading"><Music size={16} /> Audio Streams ({audioStreams.length})</h4>
              <div className="streams-list">
                {audioStreams.map(s => <StreamCard key={s.index} stream={s} />)}
              </div>
            </div>
          )}
          {subtitleStreams.length > 0 && (
            <div className="streams-section">
              <h4 className="streams-heading"><Subtitles size={16} /> Subtitle Streams ({subtitleStreams.length})</h4>
              <div className="streams-list">
                {subtitleStreams.map(s => <StreamCard key={s.index} stream={s} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conversion Options */}
      {mediaInfo && !loadingInfo && !convertDone && (
        <div className="conversion-options">
          <h3 className="options-title">
            <Wand2 size={20} />
            Conversion Options
          </h3>

          {/* Output Container */}
          <Section icon={Film} title="Output Format" description="Choose the container format for your converted file. The container determines what codecs and features are supported." defaultOpen={true}>
            <div className="container-grid">
              {CONTAINERS.map(c => (
                <button
                  key={c.value}
                  className={`container-btn ${container === c.value ? 'active' : ''}`}
                  onClick={() => setContainer(c.value)}
                  title={c.description}
                  type="button"
                >
                  <span className="container-btn-label">{c.label}</span>
                  <span className="container-btn-desc">{c.description}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Video Options */}
          {showVideoOptions && (
            <Section icon={Video} title="Video Settings" description="Configure video encoding parameters. Start with CRF quality and adjust codec for compatibility." defaultOpen={false}>
              {/* Video Codec */}
              <OptionRow label="Video Codec" tooltip="Choose how to encode the video stream. 'Copy' skips re-encoding (fastest)." description="Select video encoder">
                <select value={videoCodec} onChange={(e) => setVideoCodec(e.target.value)}>
                  {getAvailableVideoCodecs().map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </OptionRow>

              {videoCodec !== 'copy' && (
                <>
                  {/* CRF Quality */}
                  <OptionRow label="CRF Quality" tooltip="Constant Rate Factor. Lower = better quality, larger file. Range 0-51. Typical: 18-28." description={getCrfDescription(crf)}>
                    <div className="crf-slider-group">
                      <input
                        type="range"
                        min="0" max="51" step="1"
                        value={crf}
                        onChange={(e) => setCrf(e.target.value)}
                        className="crf-slider"
                      />
                      <span className="crf-value">{crf}</span>
                    </div>
                  </OptionRow>

                  {/* Video Bitrate */}
                  <OptionRow label="Video Bitrate" tooltip="Target bitrate for encoding. Leave 'Auto' to use CRF. Format: 1000k, 5M." description="Set a specific bitrate target (overrides CRF)">
                    <div className="bitrate-input-group">
                      <select value={videoBitrate === 'auto' ? 'auto' : 'custom'} onChange={(e) => { setVideoBitrate(e.target.value === 'auto' ? 'auto' : '1000k'); }}>
                        <option value="auto">Auto (use CRF)</option>
                        <option value="custom">Custom</option>
                      </select>
                      {videoBitrate !== 'auto' && (
                        <input type="text" className="input-inline" value={videoBitrate} onChange={(e) => setVideoBitrate(e.target.value)} placeholder="1000k, 5M..." />
                      )}
                    </div>
                  </OptionRow>

                  {/* Resolution */}
                  <OptionRow label="Resolution" tooltip="Output resolution. Uses height (e.g., 1080 = 1920x1080). Maintains aspect ratio." description="Lower resolution = smaller file">
                    <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                      {RESOLUTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </OptionRow>

                  {/* Framerate */}
                  <OptionRow label="Frame Rate" tooltip="Output frames per second. Lower FPS = smaller file, less smooth motion." description="Common video standards">
                    <select value={framerate} onChange={(e) => setFramerate(e.target.value)}>
                      {FPS_OPTIONS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </OptionRow>

                  {/* Preset */}
                  <OptionRow label="Encoding Preset" tooltip="Speed vs compression tradeoff. Slower = better compression (smaller file) but takes longer." description="Affects encoding speed and file size">
                    <select value={preset} onChange={(e) => setPreset(e.target.value)}>
                      {PRESETS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </OptionRow>

                  {/* Tune */}
                  <OptionRow label="Tune" tooltip="Optimize encoding for specific content types." description="Tune for your content type">
                    <select value={tune} onChange={(e) => setTune(e.target.value)}>
                      {TUNE_OPTIONS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </OptionRow>

                  {/* Profile */}
                  <OptionRow label="H.264/H.265 Profile" tooltip="Constraint on encoding features for device compatibility. 'High' is best for modern devices." description="Compatibility level">
                    <select value={profile} onChange={(e) => setProfile(e.target.value)}>
                      {PROFILES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </OptionRow>

                  {/* Pixel Format */}
                  <OptionRow label="Pixel Format" tooltip="Color subsampling. yuv420p is most compatible. Higher = better color, larger file." description="Color sampling format">
                    <select value={pixFmt} onChange={(e) => setPixFmt(e.target.value)}>
                      {PIX_FMTS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </OptionRow>
                </>
              )}
            </Section>
          )}

          {/* GIF Options */}
          {showGifOptions && (
            <Section icon={Image} title="GIF Settings" description="Options specific to animated GIF output." defaultOpen={false}>
              <OptionRow label="Frame Rate" tooltip="Lower FPS = smaller GIF, less smooth." description="GIF frame rate">
                <select value={framerate} onChange={(e) => setFramerate(e.target.value)}>
                  {FPS_OPTIONS.filter(f => ['original','10','15','20','24','30'].includes(f.value)).map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </OptionRow>
              <OptionRow label="Resolution" tooltip="GIFs are large. Lower resolution helps." description="Output size">
                <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                  {RESOLUTIONS.filter(r => ['original','720','540','480','360'].includes(r.value)).map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </OptionRow>
            </Section>
          )}

          {/* Audio Options */}
          {!isGif && (
            <Section icon={Music} title="Audio Settings" description="Configure audio encoding. Choose codec and quality based on your needs." defaultOpen={false}>
              <OptionRow label="Audio Codec" tooltip="How to encode the audio stream. 'Copy' preserves original quality." description="Choose audio encoder">
                <select value={audioCodec} onChange={(e) => setAudioCodec(e.target.value)}>
                  {getAvailableAudioCodecs().map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </OptionRow>

              {audioCodec !== 'copy' && (
                <>
                  <OptionRow label="Audio Bitrate" tooltip="Higher bitrate = better quality, larger file. 128k is standard for AAC/MP3." description="Audio quality">
                    <select value={audioBitrate} onChange={(e) => setAudioBitrate(e.target.value)}>
                      {AUDIO_BITRATES.map(b => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </OptionRow>

                  <OptionRow label="Sample Rate" tooltip="Audio sample frequency. 44.1 kHz (CD) or 48 kHz (DVD) are standard." description="Audio frequency">
                    <select value={sampleRate} onChange={(e) => setSampleRate(e.target.value)}>
                      {SAMPLE_RATES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </OptionRow>

                  <OptionRow label="Channels" tooltip="Number of audio channels. Stereo is standard for most content." description="Audio channels">
                    <select value={channels} onChange={(e) => setChannels(e.target.value)}>
                      {CHANNEL_OPTIONS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </OptionRow>

                  <OptionRow label="Volume Adjustment" tooltip="Adjust audio volume in dB. Positive = louder, negative = quieter. Leave at 0 for no change." description="Volume level">
                    <div className="volume-group">
                      <input
                        type="range"
                        min="-30" max="30" step="1"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="crf-slider"
                      />
                      <span className="crf-value">{volume > 0 ? '+' : ''}{volume} dB</span>
                    </div>
                  </OptionRow>
                </>
              )}
            </Section>
          )}

          {/* Trim & Crop */}
          <ToggleSection icon={Scissors} title="Trim & Crop" description="Cut a segment and/or crop the video frame. Leave blank to keep full video.">
            <OptionRow label="Start Time" tooltip="Start trimming from this time. Format: HH:MM:SS or seconds." description="Where to begin">
              <input
                type="text"
                className="input-full"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="00:00:00 or 90 (seconds)"
              />
            </OptionRow>
            <OptionRow label="Duration" tooltip="Length of output. Format: HH:MM:SS or seconds. Leave empty to trim to end." description="How long to keep">
              <input
                type="text"
                className="input-full"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="00:05:00 or 300 (seconds)"
              />
            </OptionRow>
            <OptionRow label="Deinterlace" tooltip="Convert interlaced video to progressive (removes combing artifacts). Useful for TV captures." description="Fix interlacing">
              <label className="toggle-label">
                <input type="checkbox" checked={deinterlace} onChange={(e) => setDeinterlace(e.target.checked)} />
                <span className="toggle-switch"></span>
                {deinterlace ? 'Enabled' : 'Disabled'}
              </label>
            </OptionRow>
          </ToggleSection>

          {/* Subtitles */}
          {subtitleStreams.length > 0 && (
            <Section icon={Subtitles} title="Subtitles" description="Handle subtitle streams in your media file." defaultOpen={false}>
              <OptionRow label="Subtitle Mode" tooltip="How to handle subtitles. 'None' discards them." description="Subtitle handling">
                <select value={subtitleMode} onChange={(e) => setSubtitleMode(e.target.value)}>
                  <option value="none">None (discard subtitles)</option>
                  <option value="copy">Copy subtitles to output</option>
                  <option value="burn">Burn subtitles into video (hardcode)</option>
                </select>
              </OptionRow>
              {subtitleMode !== 'none' && (
                <OptionRow label="Subtitle Stream" tooltip="Which subtitle track to use." description="Select track">
                  <select value={0} onChange={() => {}}>
                    {subtitleStreams.map((s, i) => (
                      <option key={s.index} value={i}>
                        #{s.index} {s.language?.toUpperCase() || 'Unknown'} {s.title ? `- ${s.title}` : ''}
                      </option>
                    ))}
                  </select>
                </OptionRow>
              )}
            </Section>
          )}

          {/* Advanced */}
          <ToggleSection icon={Settings} title="Advanced Settings" description="Fine-tune encoding with advanced parameters. Only change these if you know what you're doing.">
            <OptionRow label="Hardware Acceleration" tooltip="Use GPU to speed up encoding. Can reduce quality slightly. Requires compatible hardware." description="GPU encoding">
              <select value={hwaccel} onChange={(e) => setHwaccel(e.target.value)}>
                {HW_ACCELS.map(h => (
                  <option key={h.value} value={h.value} disabled={h.value !== 'none' && !ffmpegStatus.hwaccels?.includes(h.value)}>{h.label}</option>
                ))}
              </select>
            </OptionRow>

            <OptionRow label="2-Pass Encoding" tooltip="Analyze video twice for optimal bitrate distribution. Better quality but 2x slower. Only useful with target bitrate." description="Analyze twice for better quality">
              <label className="toggle-label">
                <input type="checkbox" checked={twoPass} onChange={(e) => setTwoPass(e.target.checked)} disabled={videoCodec === 'copy'} />
                <span className="toggle-switch"></span>
                {twoPass ? 'Enabled' : 'Disabled'}
              </label>
            </OptionRow>

            <OptionRow label="Threads" tooltip="Number of CPU threads for encoding. 0 = auto (uses all cores)." description="CPU threads">
              <input
                type="number"
                className="input-inline"
                value={threads}
                onChange={(e) => setThreads(e.target.value)}
                min="0" max="64"
                style={{ width: '80px' }}
              />
              <span className="input-suffix">(0 = auto)</span>
            </OptionRow>

            <OptionRow label="Preserve Metadata" tooltip="Keep original file metadata (title, artist, date, etc.) in the output file." description="Keep metadata">
              <label className="toggle-label">
                <input type="checkbox" checked={metadataPreserve} onChange={(e) => setMetadataPreserve(e.target.checked)} />
                <span className="toggle-switch"></span>
                {metadataPreserve ? 'Enabled' : 'Disabled'}
              </label>
            </OptionRow>

            <OptionRow label="Custom FFmpeg Arguments" tooltip="Add any additional FFmpeg arguments directly. Use with caution! Incorrect arguments may cause errors." description="Raw ffmpeg flags">
              <input
                type="text"
                className="input-full"
                value={customArgs}
                onChange={(e) => setCustomArgs(e.target.value)}
                placeholder="-vf 'eq=brightness=0.1' -metadata title='My Video' ..."
              />
            </OptionRow>
          </ToggleSection>

          {/* Convert Button */}
          <div className="convert-action">
            <button
              className={`btn-convert ${converting ? 'converting' : ''}`}
              onClick={handleConvert}
              disabled={converting}
            >
              {converting ? (
                <><Loader2 size={20} className="spin" /> Converting... {convertProgress > 0 ? `${convertProgress}%` : ''}</>
              ) : (
                <><Wand2 size={20} /> Start Conversion</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Conversion Progress */}
      {converting && (
        <div className="conversion-progress">
          <div className="progress-header">
            <span className="progress-title">{convertStatus}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${convertProgress}%` }} />
          </div>
          <div className="progress-stats">
            {convertTime && <span className="pstat"><Clock size={12} /> {convertTime}</span>}
            {convertFps && <span className="pstat"><Play size={12} /> {convertFps} fps</span>}
            {convertSpeed && <span className="pstat"><Loader2 size={12} className={converting ? 'spin' : ''} /> {convertSpeed}</span>}
            {convertBitrate && <span className="pstat"><Radio size={12} /> {convertBitrate}</span>}
            {convertEta && <span className="pstat"><Timer size={12} /> ETA: {convertEta}</span>}
          </div>
          {convertLog.length > 0 && (
            <div className="convert-log">
              {convertLog.slice(-5).map((msg, i) => (
                <div key={i} className="log-line">{msg}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Done State */}
      {convertDone && (
        <div className="convert-done">
          <div className="done-icon"><CheckCircle size={48} /></div>
          <h3>Conversion Complete!</h3>
          <p className="done-filename">{convertDone.filename}</p>
          <p className="done-size">{convertDone.size_formatted}</p>
          <div className="done-actions">
            <button className="btn-download-file" onClick={() => handleDownload(convertDone.download_token, convertDone.filename)}>
              <Download size={18} /> Download File
            </button>
            <button className="btn-convert-new" onClick={handleReset}>
              <FileVideo size={16} /> Convert Another
            </button>
          </div>
        </div>
      )}

      {/* Empty state (no file selected, nothing converting) */}
      {!mediaInfo && !loadingInfo && !fileError && !convertDone && (
        <div className="converter-empty">
          <Wand2 size={64} className="empty-icon" />
          <h2>Media Converter</h2>
          <p>Convert video and audio files with FFmpeg</p>
          <p className="empty-hint">
            Supports MP4, MKV, WebM, AVI, MOV, MP3, FLAC, WAV and more
          </p>
        </div>
      )}
    </div>
  );
}
