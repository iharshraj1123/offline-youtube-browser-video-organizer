import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import {
  Wand2, FileVideo, Upload, X, Loader2, CheckCircle, AlertCircle,
  RefreshCw, Download, Folder, Clock, Video, Music, Film,
  Settings, HelpCircle, Play, Image, Disc, Radio, Timer, Subtitles,
  Scissors, Copy, Check, Save, Trash2, List,
  Palette, Gauge, RotateCw, FlipHorizontal, FlipVertical, Type, Sun,
  BarChart3, Merge, Split, GripVertical, ExternalLink
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

function parseTimeToSeconds(str) {
  if (!str || typeof str !== 'string') return 0;
  str = str.trim();
  if (/^\d+(\.\d+)?$/.test(str)) return parseFloat(str);
  const parts = str.split(':');
  if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2] || '0');
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseFloat(parts[1] || '0');
  return 0;
}

function secondsToTimeStr(sec) {
  if (!sec || sec <= 0 || isNaN(sec)) return '';
  const neg = sec < 0;
  if (neg) sec = -sec;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60);
  const ms = Math.round(s * 1000);
  const rem = neg ? '-' : '';
  if (h > 0) return rem + `${h}:${String(m).padStart(2, '0')}:${String(Math.floor(s)).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
  return rem + `${m}:${String(Math.floor(s)).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
}

// ---- Constants ----

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

const QUICK_PRESETS = {
  'default': {
    label: 'Default Settings',
    settings: { container: 'mp4', videoCodec: 'copy', audioCodec: 'copy', crf: 23, videoBitrate: 'auto', resolution: 'original', framerate: 'original', preset: 'medium', tune: '', profile: '', pixFmt: '', audioBitrate: 'auto', sampleRate: 'original', channels: 'original', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' }
  },
  'web_h264': {
    label: 'Web (H.264)',
    settings: { container: 'mp4', videoCodec: 'h264', audioCodec: 'aac', crf: 23, videoBitrate: 'auto', resolution: '1080', framerate: 'original', preset: 'medium', tune: '', profile: 'high', pixFmt: 'yuv420p', audioBitrate: '128k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' }
  },
  'web_h265': {
    label: 'Web (H.265/HEVC)',
    settings: { container: 'mp4', videoCodec: 'h265', audioCodec: 'aac', crf: 28, videoBitrate: 'auto', resolution: '1080', framerate: 'original', preset: 'medium', tune: '', profile: 'main', pixFmt: 'yuv420p', audioBitrate: '128k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' }
  },
  'compatible': {
    label: 'Max Compatibility',
    settings: { container: 'mp4', videoCodec: 'h264', audioCodec: 'aac', crf: 23, videoBitrate: 'auto', resolution: '720', framerate: '30', preset: 'medium', tune: '', profile: 'baseline', pixFmt: 'yuv420p', audioBitrate: '128k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' }
  },
  'youtube': {
    label: 'YouTube Ready',
    settings: { container: 'mp4', videoCodec: 'h264', audioCodec: 'aac', crf: 23, videoBitrate: 'auto', resolution: '1080', framerate: 'original', preset: 'slow', tune: 'film', profile: 'high', pixFmt: 'yuv420p', audioBitrate: '192k', sampleRate: '48000', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' }
  },
  'discord': {
    label: 'Discord/Twitter',
    settings: { container: 'mp4', videoCodec: 'h264', audioCodec: 'aac', crf: 28, videoBitrate: 'auto', resolution: '720', framerate: '30', preset: 'fast', tune: '', profile: 'main', pixFmt: 'yuv420p', audioBitrate: '128k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' }
  },
  'small': {
    label: 'Smallest Size',
    settings: { container: 'mp4', videoCodec: 'h265', audioCodec: 'aac', crf: 35, videoBitrate: 'auto', resolution: '480', framerate: '24', preset: 'veryslow', tune: '', profile: 'main', pixFmt: 'yuv420p', audioBitrate: '64k', sampleRate: '22050', channels: 'mono', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' }
  },
  'audio': {
    label: 'Audio Only (MP3)',
    settings: { container: 'mp3', videoCodec: 'copy', audioCodec: 'mp3', crf: 23, videoBitrate: 'auto', resolution: 'original', framerate: 'original', preset: 'medium', tune: '', profile: '', pixFmt: '', audioBitrate: '192k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' }
  },
};

const STORAGE_PRESETS_KEY = 'converter_saved_presets';

// ---- Helper components ----

function OptionTooltip({ text }) {
  return <span className="option-tooltip" title={text}><HelpCircle size={14} /></span>;
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
  const [open, setOpen] = React.useState(false);
  return (
    <div className={`toggle-section ${open ? 'open' : ''}`}>
      <button className="toggle-section-header" onClick={() => setOpen(!open)} type="button">
        <span className="toggle-section-header-left">
          {Icon && <Icon size={18} />}
          <span className="toggle-section-title">{title}</span>
        </span>
        <span className="toggle-section-chevron">{open ? '−' : '+'}</span>
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

// ---- Reducer ----

const initialState = {
  ffmpegStatus: { checking: true, installed: false, ffmpeg_version: null, video_encoders: [], audio_encoders: [], hwaccels: [] },
  filePath: '',
  selectedFile: null,
  mediaInfo: null,
  loadingInfo: false,
  fileError: '',
  settings: {
    container: 'mp4', videoCodec: 'copy', audioCodec: 'copy', crf: 23,
    videoBitrate: 'auto', resolution: 'original', framerate: 'original',
    preset: 'medium', tune: '', profile: '', pixFmt: '',
    audioBitrate: 'auto', sampleRate: 'original', channels: 'original', volume: '0',
    startTime: '', duration: '',
    cropW: '', cropH: '', cropX: '', cropY: '',
    subtitleMode: 'none', subtitleStream: 0,
    deinterlace: false, hwaccel: 'none', twoPass: false,
    threads: '0', metadataPreserve: true, customArgs: '',
    colorBrightness: 0, colorContrast: 1, colorSaturation: 1, colorGamma: 1,
    speed: 1, speedMaintainPitch: true,
    rotate: '', hflip: false, vflip: false,
    watermarkType: 'none', watermarkPosition: 'center', watermarkOpacity: 1, watermarkFont: '',
    watermarkText: '', watermarkFontSize: 24, watermarkColor: '#ffffff',
    watermarkImage: null,
  },
  converting: false,
  convertProgress: 0, convertTime: '', convertFps: '', convertSpeed: '',
  convertBitrate: '', convertEta: '', convertStatus: '', convertLog: [], convertDone: null,
  queue: [],
  commandCopied: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FFMPEG_STATUS':
      return { ...state, ffmpegStatus: action.payload };
    case 'SET_FILE':
      return { ...state, selectedFile: action.payload };
    case 'SET_FILE_PATH':
      return { ...state, filePath: action.payload };
    case 'SET_MEDIA_INFO':
      return { ...state, mediaInfo: action.payload };
    case 'SET_LOADING':
      return { ...state, loadingInfo: action.payload };
    case 'SET_FILE_ERROR':
      return { ...state, fileError: action.payload };
    case 'CLEAR_FILE':
      return { ...state, selectedFile: null, mediaInfo: null, filePath: '', fileError: '', convertDone: null, convertProgress: 0, convertStatus: '' };
    case 'UPDATE_SETTING':
      return { ...state, settings: { ...state.settings, [action.payload.key]: action.payload.value } };
    case 'APPLY_PRESET':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_CONVERTING':
      return { ...state, converting: action.payload };
    case 'UPDATE_PROGRESS':
      return { ...state, ...action.payload };
    case 'SET_CONVERT_DONE':
      return { ...state, convertDone: action.payload };
    case 'ADD_LOG':
      return { ...state, convertLog: [...state.convertLog, action.payload] };
    case 'CLEAR_LOG':
      return { ...state, convertLog: [] };
    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, action.payload] };
    case 'REMOVE_FROM_QUEUE':
      return { ...state, queue: state.queue.filter((_, i) => i !== action.payload) };
    case 'CLEAR_QUEUE':
      return { ...state, queue: [] };
    case 'REORDER_QUEUE':
      return { ...state, queue: action.payload };
    case 'UPDATE_QUEUE_ITEM':
      return { ...state, queue: state.queue.map((item, i) => i === action.payload.index ? { ...item, ...action.payload.data } : item) };
    case 'SET_COMMAND_COPIED':
      return { ...state, commandCopied: action.payload };
    default:
      return state;
  }
}

// Helper to safely map standard codecs to GPU encoders based on selected hardware
const getSafeEncoder = (codecKey, hwaccel) => {
  const map = { 'h264': 'libx264', 'h265': 'libx265', 'vp9': 'libvpx-vp9', 'av1': 'libaom-av1', 'mpeg4': 'mpeg4', 'vp8': 'libvpx' };

  if (hwaccel === 'cuda') { map.h264 = 'h264_nvenc'; map.h265 = 'hevc_nvenc'; }
  if (hwaccel === 'qsv') { map.h264 = 'h264_qsv'; map.h265 = 'hevc_qsv'; }
  if (hwaccel === 'amf') { map.h264 = 'h264_amf'; map.h265 = 'hevc_amf'; }
  if (hwaccel === 'videotoolbox') { map.h264 = 'h264_videotoolbox'; map.h265 = 'hevc_videotoolbox'; }

  return map[codecKey] || codecKey;
};

// ---- Main Component ----

export function ConverterView() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const abortRef = useRef(null);
  const [presetName, setPresetName] = React.useState('');
  const [showSavePreset, setShowSavePreset] = React.useState(false);
  const [watermarkImageFile, setWatermarkImageFile] = React.useState(null);
  const watermarkInputRef = useRef(null);
  const [targetSize, setTargetSize] = React.useState('');
  const [targetSizeResult, setTargetSizeResult] = React.useState(null);
  const [scenes, setScenes] = React.useState(null);
  const [analyzingScenes, setAnalyzingScenes] = React.useState(false);
  const concatInputRef = useRef(null);
  const [concatFiles, setConcatFiles] = React.useState([]);
  const [concatReEncode, setConcatReEncode] = React.useState(false);
  const [concatConverting, setConcatConverting] = React.useState(false);
  const [concatDone, setConcatDone] = React.useState(null);
  const [splitSegments, setSplitSegments] = React.useState([{ start: '', end: '', label: 'segment_1' }]);
  const [splitConverting, setSplitConverting] = React.useState(false);
  const [splitResults, setSplitResults] = React.useState([]);
  const [trimDrag, setTrimDrag] = React.useState(null);
  const [cropDrag, setCropDrag] = React.useState(null);
  const [cropLockAspect, setCropLockAspect] = React.useState(false);
  const [playerTime, setPlayerTime] = React.useState(0);
  const [playerPlaying, setPlayerPlaying] = React.useState(false);
  const playerSeeking = useRef(false);
  const [availableFonts, setAvailableFonts] = React.useState([]);

  const { ffmpegStatus, filePath, selectedFile, mediaInfo, loadingInfo, fileError, settings, converting, convertProgress, convertTime, convertFps, convertSpeed, convertBitrate, convertEta, convertStatus, convertLog, convertDone, queue } = state;

  // ---- Load saved presets from localStorage ----
  const [savedPresets, setSavedPresets] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PRESETS_KEY) || '{}');
    } catch { return {}; }
  });

  const savePresetToStorage = (name, presetSettings) => {
    const updated = { ...savedPresets, [name]: presetSettings };
    setSavedPresets(updated);
    localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(updated));
    setShowSavePreset(false);
    setPresetName('');
  };

  const deletePresetFromStorage = (name) => {
    const updated = { ...savedPresets };
    delete updated[name];
    setSavedPresets(updated);
    localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(updated));
  };

  // ---- Keyboard shortcuts ----
  const handleConvertRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (mediaInfo && !converting && !convertDone) {
          handleConvertRef.current?.();
        }
      }
      if (e.key === 'Escape' && converting) {
        abortRef.current?.abort();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mediaInfo, converting, convertDone]);

  // ---- Queue drag-to-reorder ----
  const [dragIndex, setDragIndex] = React.useState(null);

  const handleQueueDragStart = (idx) => (e) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleQueueDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleQueueDrop = (targetIdx) => (e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIdx) return;
    const items = [...queue];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(targetIdx, 0, moved);
    dispatch({ type: 'REORDER_QUEUE', payload: items });
    setDragIndex(null);
  };

  // ---- Preset export/import ----
  const presetInputRef = useRef(null);

  const handlePresetExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converter-preset.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePresetImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        dispatch({ type: 'APPLY_PRESET', payload: parsed });
      } catch { }
    };
    reader.readAsText(file);
    if (presetInputRef.current) presetInputRef.current.value = '';
  };

  // ---- Convert history ----
  const HISTORY_KEY = 'converter_history';
  const [history, setHistory] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch { return []; }
  });
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => {
    if (convertDone && mediaInfo) {
      const entry = {
        filename: convertDone.filename,
        size: convertDone.size_formatted,
        container: settings.container,
        videoCodec: settings.videoCodec,
        audioCodec: settings.audioCodec,
        timestamp: new Date().toLocaleString(),
        duration: mediaInfo.duration,
        originalName: mediaInfo.filename,
        downloadToken: convertDone.download_token,
        outputPath: convertDone.output_path || '',
      };
      const updated = [entry, ...historyRef.current.filter(h => h.filename !== entry.filename)].slice(0, 20);
      setHistory(updated);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    }
  }, [convertDone]);

  // ---- Video preview ----
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = React.useState(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setVideoSrc(url);
      return () => URL.revokeObjectURL(url);
    }
    setVideoSrc(null);
  }, [selectedFile]);

  const getPreviewStyle = () => {
    const s = settings;
    const fl = [];
    if (s.colorBrightness !== 0) fl.push(`brightness(${1 + s.colorBrightness})`);
    if (Math.abs(s.colorContrast - 1) > 0.01) fl.push(`contrast(${s.colorContrast})`);
    if (Math.abs(s.colorSaturation - 1) > 0.01) fl.push(`saturate(${s.colorSaturation})`);
    const tr = [];
    if (s.rotate === '90cw') tr.push('rotate(90deg)');
    else if (s.rotate === '90ccw') tr.push('rotate(-90deg)');
    else if (s.rotate === '180') tr.push('rotate(180deg)');
    if (s.hflip) tr.push('scaleX(-1)');
    if (s.vflip) tr.push('scaleY(-1)');
    return {
      filter: fl.length ? fl.join(' ') : 'none',
      transform: tr.length ? tr.join(' ') : 'none',
    };
  };

  const watermarkPosMap = {
    'top-left': { top: '12px', left: '12px' },
    'top-middle': { top: '12px', left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: '12px', right: '12px' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'bottom-left': { bottom: '12px', left: '12px' },
    'bottom-middle': { bottom: '12px', left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: '12px', right: '12px' },
  };

  // ---- Tab navigation ----
  const [activeTab, setActiveTab] = React.useState('format');
  const [showAdvanced, setShowAdvanced] = React.useState(true);

  // Update your initial useEffect to also fetch the fonts
  useEffect(() => {
    checkFfmpeg();
    fetchFonts();
  }, []);

  // Add the fetch function
  const fetchFonts = async () => {
    try {
      const res = await fetch('./api/index.php?action=ffmpeg_get_fonts');
      const data = await res.json();
      if (data.fonts && data.fonts.length > 0) {
        setAvailableFonts(data.fonts);
        // Set the first font as the default if one isn't selected
        if (!settings.watermarkFont) {
          dispatch({ type: 'UPDATE_SETTING', payload: { key: 'watermarkFont', value: data.fonts[0] } });
        }
      }
    } catch (e) {
      console.error("Failed to load fonts", e);
    }
  };

  const checkFfmpeg = async () => {
    dispatch({ type: 'SET_FFMPEG_STATUS', payload: { ...ffmpegStatus, checking: true } });
    try {
      const res = await fetch('./api/index.php?action=ffmpeg_verify');
      const data = await res.json();
      dispatch({
        type: 'SET_FFMPEG_STATUS',
        payload: {
          checking: false, installed: data.installed,
          ffmpeg_version: data.ffmpeg_version, ffprobe_version: data.ffprobe_version,
          video_encoders: data.video_encoders || [], audio_encoders: data.audio_encoders || [],
          hwaccels: data.hwaccels || [],
        },
      });
    } catch {
      dispatch({ type: 'SET_FFMPEG_STATUS', payload: { checking: false, installed: false, ffmpeg_version: null, video_encoders: [], audio_encoders: [] } });
    }
  };

  const cleanupTemp = async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch('./api/index.php?action=ffmpeg_cleanup');
        if (res.ok) return;
      } catch { }
    }
  };

  const loadFileInfo = async (path, file) => {
    await cleanupTemp();
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_FILE_ERROR', payload: '' });
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (path) {
        formData.append('path', path);
      }
      const res = await fetch('./api/index.php?action=ffmpeg_info', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) {
        dispatch({ type: 'SET_FILE_ERROR', payload: data.error });
        dispatch({ type: 'SET_MEDIA_INFO', payload: null });
      } else {
        dispatch({ type: 'SET_MEDIA_INFO', payload: data });
      }
    } catch (e) {
      dispatch({ type: 'SET_FILE_ERROR', payload: 'Failed to load file information: ' + e.message });
      dispatch({ type: 'SET_MEDIA_INFO', payload: null });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: 'SET_FILE', payload: file });
    dispatch({ type: 'SET_FILE_PATH', payload: '' });
    dispatch({ type: 'SET_MEDIA_INFO', payload: null });
    dispatch({ type: 'SET_CONVERT_DONE', payload: null });
    dispatch({ type: 'SET_FILE_ERROR', payload: '' });
    await loadFileInfo(null, file);
  };

  const handlePathSubmit = async () => {
    if (!filePath.trim()) return;
    dispatch({ type: 'SET_FILE', payload: null });
    dispatch({ type: 'SET_MEDIA_INFO', payload: null });
    dispatch({ type: 'SET_CONVERT_DONE', payload: null });
    dispatch({ type: 'SET_FILE_ERROR', payload: '' });
    await loadFileInfo(filePath.trim(), null);
  };

  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;
    if (files.length === 1) {
      const file = files[0];
      dispatch({ type: 'SET_FILE', payload: file });
      dispatch({ type: 'SET_FILE_PATH', payload: '' });
      dispatch({ type: 'SET_MEDIA_INFO', payload: null });
      dispatch({ type: 'SET_CONVERT_DONE', payload: null });
      dispatch({ type: 'SET_FILE_ERROR', payload: '' });
      await loadFileInfo(null, file);
    } else {
      for (const file of files) {
        const reader = new FileReader();
        const fileData = { file, name: file.name, size: file.size, status: 'pending', progress: 0, error: '' };
        dispatch({ type: 'ADD_TO_QUEUE', payload: fileData });
      }
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

  const videoStreams = mediaInfo?.streams?.filter(s => s.type === 'video') || [];
  const audioStreams = mediaInfo?.streams?.filter(s => s.type === 'audio') || [];
  const subtitleStreams = mediaInfo?.streams?.filter(s => s.type === 'subtitle') || [];

  // Auto-detect container
  useEffect(() => {
    if (mediaInfo) {
      const fmt = mediaInfo.format_name;
      if (fmt && CONTAINERS.some(c => c.value === fmt)) {
        dispatch({ type: 'UPDATE_SETTING', payload: { key: 'container', value: fmt } });
      }
    }
  }, [mediaInfo]);

  const getCrfDescription = (val) => {
    const v = parseInt(val);
    if (v <= 17) return 'Visually lossless. Very high quality, large file.';
    if (v <= 22) return 'High quality. Great for archiving.';
    if (v <= 27) return 'Good quality. Standard for most uses.';
    if (v <= 32) return 'Acceptable quality. Smaller file size.';
    if (v <= 40) return 'Low quality. Very small file.';
    return 'Very low quality. Minimal file size.';
  };

  const handleQuickPreset = (key) => {
    const preset = QUICK_PRESETS[key];
    if (preset) {
      dispatch({ type: 'APPLY_PRESET', payload: preset.settings });
    }
  };

  const handleApplySavedPreset = (name) => {
    const preset = savedPresets[name];
    if (preset) {
      dispatch({ type: 'APPLY_PRESET', payload: preset });
    }
  };

  // --- DYNAMIC PREVIEW WATERMARK FONT INJECTION ---
  const currentFontFile = settings.watermarkFont || (availableFonts.length > 0 ? availableFonts[0] : '');
  const dynamicFontFamilyName = currentFontFile ? currentFontFile.replace(/\.[^/.]+$/, "") : 'sans-serif';

  // 🟢 FIX: Construct a bulletproof absolute URL using the browser's current origin path
  const parsedPath = window.location.pathname.replace(/\/[^/]*$/, '/'); // Cleans trailing index files to get the folder path
  const absoluteFontUrl = `${window.location.origin}${parsedPath}uploads/fonts/${currentFontFile}`;

  const fontStylesMarkup = currentFontFile ? (
    <style>{`
      @font-face {
        font-family: '${dynamicFontFamilyName}';
        src: url('${absoluteFontUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    `}</style>
  ) : null;

  // Add this calculation inside your component render block right above the preview output
  const nativeHeight = mediaInfo?.streams?.find(s => s.type === 'video')?.height || 1080;
  const previewVideoElement = document.querySelector('.video-preview-player'); // or use a React ref if you have one bound to the preview block
  const visualDisplayHeight = previewVideoElement ? previewVideoElement.clientHeight : 400;

  // Calculate how much the preview player shrinks the video frame
  const scalingFactor = visualDisplayHeight / nativeHeight;
  const visualFontSize = Math.round(settings.watermarkFontSize * scalingFactor);

  const handleConvert = async () => {
    dispatch({ type: 'SET_CONVERTING', payload: true });
    dispatch({ type: 'UPDATE_PROGRESS', payload: { convertProgress: 0, convertTime: '', convertFps: '', convertSpeed: '', convertBitrate: '', convertEta: '', convertStatus: 'Starting conversion...' } });
    dispatch({ type: 'CLEAR_LOG' });
    dispatch({ type: 'SET_CONVERT_DONE', payload: null });

    await cleanupTemp();

    // Check if any visual filters are active
    const needsVideoEncode =
      settings.deinterlace ||
      settings.resolution !== 'original' ||
      (parseInt(settings.cropW) > 0 && parseInt(settings.cropH) > 0) ||
      settings.colorBrightness !== 0 ||
      Math.abs(settings.colorContrast - 1) > 0.01 ||
      Math.abs(settings.colorSaturation - 1) > 0.01 ||
      Math.abs(settings.colorGamma - 1) > 0.01 ||
      settings.rotate !== '' ||
      settings.hflip || settings.vflip ||
      settings.speed !== 1 ||
      (settings.watermarkType === 'text' && settings.watermarkText) ||
      settings.watermarkType === 'image';

    // Grab the original video codec from the probed streams
    const originalCodec = mediaInfo?.streams?.find(s => s.type === 'video')?.codec;

    // Force fallback to the original codec, or h264 if we can't figure it out
    let fallbackCodec = 'h264';
    if (originalCodec && originalCodec !== 'av1' && originalCodec !== 'vp9') {
      fallbackCodec = originalCodec;
    }
    const finalVideoCodec = (settings.videoCodec === 'copy' && needsVideoEncode) ? fallbackCodec : settings.videoCodec;

    // --- HW ACCEL FIX START ---
    // Map to hardware encoder (e.g., h264_nvenc) if applicable
    const finalEncoder = finalVideoCodec === 'copy' ? 'copy' : getSafeEncoder(finalVideoCodec, settings.hwaccel);

    // Disable GPU decoding if using filters on problematic codecs (AV1/VP9) to prevent Code 69
    const isProblematicCodec = originalCodec === 'av1' || originalCodec === 'vp9';
    const safeHwAccel = (needsVideoEncode && isProblematicCodec) ? 'none' : settings.hwaccel;
    // --- HW ACCEL FIX END ---

    const options = {
      container: settings.container,
      video_codec: finalEncoder, // <-- Updated to use hardware encoder
      audio_codec: settings.audioCodec,
      crf: finalEncoder !== 'copy' ? settings.crf : '',
      video_bitrate: (finalEncoder !== 'copy' && settings.videoBitrate !== 'auto') ? settings.videoBitrate : '',
      resolution: settings.resolution,
      framerate: settings.framerate,
      preset: finalEncoder !== 'copy' ? settings.preset : '',
      tune: settings.tune,
      profile: settings.profile,
      pix_fmt: settings.pixFmt,
      audio_bitrate: (settings.audioCodec !== 'copy' && settings.audioBitrate !== 'auto') ? settings.audioBitrate : '',
      sample_rate: settings.sampleRate,
      channels: settings.channels,
      volume: settings.volume,
      start_time: settings.startTime,
      duration: settings.duration,
      crop_w: settings.cropW, crop_h: settings.cropH, crop_x: settings.cropX, crop_y: settings.cropY,
      subtitle_mode: settings.subtitleMode, subtitle_stream: settings.subtitleStream,
      deinterlace: settings.deinterlace,
      hwaccel: safeHwAccel, // <-- Now safe for AV1/VP9
      two_pass: settings.twoPass, threads: settings.threads,
      metadata_preserve: settings.metadataPreserve, custom_args: settings.customArgs,
      color_brightness: settings.colorBrightness, color_contrast: settings.colorContrast,
      color_saturation: settings.colorSaturation, color_gamma: settings.colorGamma,
      speed: settings.speed, speed_maintain_pitch: settings.speedMaintainPitch,
      rotate: settings.rotate, hflip: settings.hflip, vflip: settings.vflip,
      watermark_type: settings.watermarkType, watermark_position: settings.watermarkPosition,
      watermark_opacity: settings.watermarkOpacity, watermark_text: settings.watermarkText,
      watermark_font_size: settings.watermarkFontSize, watermark_color: settings.watermarkColor,
      watermark_font: settings.watermarkFont,
    };

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('input', selectedFile.name);
        formData.append('file', selectedFile);
      } else {
        formData.append('input', filePath);
      }
      if (watermarkImageFile) {
        formData.append('watermark_image', watermarkImageFile);
      }
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
                dispatch({ type: 'UPDATE_PROGRESS', payload: { convertProgress: msg.percent, convertTime: msg.time || '', convertFps: msg.fps || '', convertSpeed: msg.speed || '', convertBitrate: msg.bitrate || '', convertEta: msg.eta ? `${msg.eta}s` : '', convertStatus: `Converting... ${msg.percent}%` } });
              } else if (msg.type === 'info') {
                dispatch({ type: 'UPDATE_PROGRESS', payload: { convertStatus: msg.message } });
                dispatch({ type: 'ADD_LOG', payload: msg.message });
              } else if (msg.type === 'complete') {
                dispatch({ type: 'UPDATE_PROGRESS', payload: { convertProgress: 100, convertStatus: 'Finalizing...' } });
              } else if (msg.type === 'done') {
                dispatch({ type: 'UPDATE_PROGRESS', payload: { convertProgress: 100, convertStatus: 'Conversion complete!' } });
                dispatch({ type: 'SET_CONVERT_DONE', payload: msg });
              } else if (msg.type === 'error') {
                dispatch({ type: 'UPDATE_PROGRESS', payload: { convertStatus: 'Error: ' + msg.message } });
                dispatch({ type: 'ADD_LOG', payload: 'ERROR: ' + msg.message });
              }
            } catch { }
          }
        }
      }
    } catch (e) {
      dispatch({ type: 'UPDATE_PROGRESS', payload: { convertStatus: 'Connection error' } });
      dispatch({ type: 'ADD_LOG', payload: 'Connection error: ' + e.message });
    }

    dispatch({ type: 'SET_CONVERTING', payload: false });
  };
  handleConvertRef.current = handleConvert;

  const handleDownload = (token, filename) => {
    const a = document.createElement('a');
    a.href = `./api/index.php?action=ffmpeg_download&token=${token}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    dispatch({ type: 'SET_CONVERT_DONE', payload: null });
    dispatch({ type: 'SET_FILE', payload: null });
    dispatch({ type: 'SET_MEDIA_INFO', payload: null });
    dispatch({ type: 'SET_FILE_PATH', payload: '' });
  };

  const handleDownloadFromHistory = (token, filename) => {
    const a = document.createElement('a');
    a.href = `./api/index.php?action=ffmpeg_download&token=${token}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenLocalFile = async (path) => {
    try {
      const formData = new FormData();
      formData.append('path', path);
      const res = await fetch('./api/index.php?action=open_local_file', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      }
    } catch (e) {
      alert('Failed to open file: ' + e.message);
    }
  };

  const handleDeleteHistoryItem = (index) => {
    const updated = historyRef.current.filter((_, idx) => idx !== index);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const handleReset = async () => {
    await cleanupTemp();
    setWatermarkImageFile(null);
    setTargetSize('');
    setTargetSizeResult(null);
    setScenes(null);
    setTrimDrag(null);
    setCropDrag(null);
    dispatch({ type: 'SET_FILE', payload: null });
    dispatch({ type: 'SET_MEDIA_INFO', payload: null });
    dispatch({ type: 'SET_FILE_PATH', payload: '' });
    dispatch({ type: 'SET_FILE_ERROR', payload: '' });
    dispatch({ type: 'SET_CONVERT_DONE', payload: null });
    dispatch({ type: 'UPDATE_PROGRESS', payload: { convertProgress: 0, convertStatus: '' } });
  };

  const calculateTargetSize = () => {
    const mb = parseFloat(targetSize);
    if (!mb || mb <= 0 || !mediaInfo?.duration) {
      setTargetSizeResult(null);
      return;
    }
    const durationSec = mediaInfo.duration;
    const totalBits = mb * 1024 * 1024 * 8;
    const audioBitrate = settings.audioCodec !== 'copy' && settings.audioBitrate !== 'auto'
      ? parseInt(settings.audioBitrate) * 1000 : 128000;
    const videoBits = totalBits - (audioBitrate * durationSec);
    const videoBitrateBps = Math.max(videoBits / durationSec, 32000);
    const videoKbps = Math.round(videoBitrateBps / 1000);

    let suggestedCrf = 28;
    if (videoKbps >= 8000) suggestedCrf = 18;
    else if (videoKbps >= 4000) suggestedCrf = 23;
    else if (videoKbps >= 2000) suggestedCrf = 28;
    else if (videoKbps >= 1000) suggestedCrf = 32;
    else suggestedCrf = 35;

    setTargetSizeResult({
      targetMB: mb,
      videoBitrateKbps: videoKbps,
      suggestedCrf,
      estimatedAudioSize: Math.round(audioBitrate * durationSec / 8 / 1024 / 1024 * 10) / 10,
    });
  };

  // ---------- Trim timeline drag handlers ----------
  const trimDuration = mediaInfo?.duration || 0;

  const handleTrimMouseDown = (e, handle) => {
    e.preventDefault();
    const rect = e.currentTarget.closest('.trim-timeline')?.getBoundingClientRect();
    if (!rect) return;
    const startSec = parseTimeToSeconds(settings.startTime);
    const durSec = parseTimeToSeconds(settings.duration);
    const endSec = durSec > 0 ? Math.min(startSec + durSec, trimDuration) : trimDuration;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = handle === 'start' ? startSec : endSec;
    }
    setTrimDrag({
      handle,
      startSec,
      durSec,
      endSec,
      rect,
    });
  };

  React.useEffect(() => {
    if (!trimDrag) return;
    const onMove = (e) => {
      const { handle, startSec, durSec, endSec, rect } = trimDrag;
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const pos = pct * trimDuration;
      if (handle === 'start') {
        const newStart = Math.max(0, Math.min(pos, endSec - 0.001));
        updateSetting('startTime', secondsToTimeStr(newStart));
        const newDur = endSec - newStart;
        updateSetting('duration', newDur > 0.001 ? secondsToTimeStr(newDur) : '');
        if (videoRef.current) videoRef.current.currentTime = newStart;
      } else {
        const newEnd = Math.max(startSec + 0.001, Math.min(pos, trimDuration));
        const newDur = newEnd - startSec;
        updateSetting('duration', newDur > 0.001 ? secondsToTimeStr(newDur) : '');
        if (videoRef.current) videoRef.current.currentTime = newEnd;
      }
    };
    const onUp = () => setTrimDrag(null);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [trimDrag, trimDuration]);

  // Constrain video playback within trim range
  React.useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const startSec = parseTimeToSeconds(settings.startTime);
    const durSec = parseTimeToSeconds(settings.duration);
    const hasTrim = startSec > 0 || durSec > 0;
    if (!hasTrim) return;
    const endSec = durSec > 0 ? Math.min(startSec + durSec, trimDuration) : trimDuration;
    const onTimeUpdate = () => {
      if (trimDrag) return;
      if (vid.currentTime < startSec) {
        vid.currentTime = startSec;
      } else if (vid.currentTime > endSec) {
        vid.currentTime = endSec;
        vid.pause();
      }
    };
    vid.addEventListener('timeupdate', onTimeUpdate);
    return () => vid.removeEventListener('timeupdate', onTimeUpdate);
  }, [settings.startTime, settings.duration, trimDuration, trimDrag]);

  // ---------- Crop overlay drag handlers ----------
  const hasCrop = parseInt(settings.cropW) > 0 && parseInt(settings.cropH) > 0;

  const handleCropMouseDown = (e, mode) => {
    if (!videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const vw = videoRef.current.videoWidth || rect.width;
    const vh = videoRef.current.videoHeight || rect.height;
    const sx = vw / rect.width;
    const sy = vh / rect.height;
    let cw = parseInt(settings.cropW) || 0;
    let ch = parseInt(settings.cropH) || 0;
    let cx = parseInt(settings.cropX) || 0;
    let cy = parseInt(settings.cropY) || 0;
    if (cw === 0 && ch === 0) {
      cw = Math.round(vw * 0.75);
      ch = Math.round(vh * 0.75);
      cx = Math.round((vw - cw) / 2);
      cy = Math.round((vh - ch) / 2);
      updateSetting('cropX', String(cx));
      updateSetting('cropY', String(cy));
      updateSetting('cropW', String(cw));
      updateSetting('cropH', String(ch));
    }
    setCropDrag({
      mode,
      startX: e.clientX,
      startY: e.clientY,
      cropX: cx, cropY: cy, cropW: cw, cropH: ch,
      sx, sy, vw, vh,
    });
  };

  React.useEffect(() => {
    if (!cropDrag) return;
    const onMove = (e) => {
      const { mode, startX, startY, cropX, cropY, cropW, cropH, sx, sy, vw, vh } = cropDrag;
      const dx = (e.clientX - startX) * sx;
      const dy = (e.clientY - startY) * sy;
      let nx = cropX, ny = cropY, nw = cropW, nh = cropH;
      if (mode === 'move') {
        nx = Math.max(0, Math.min(vw - cropW, cropX + dx));
        ny = Math.max(0, Math.min(vh - cropH, cropY + dy));
      } else if (mode === 'se') {
        nw = Math.max(16, Math.min(vw - cropX, cropW + dx));
        nh = Math.max(16, Math.min(vh - cropY, cropH + dy));
        if (cropLockAspect) { const ar = cropW / cropH; nw = Math.max(16, Math.min(vw - cropX, cropW + dx)); nh = nw / ar; }
      } else if (mode === 'sw') {
        const maxW = cropX + cropW;
        nw = Math.max(16, Math.min(maxW, cropW - dx));
        nh = Math.max(16, Math.min(vh - cropY, cropH + dy));
        if (cropLockAspect) { const ar = cropW / cropH; nw = Math.max(16, Math.min(maxW, cropW - dx)); nh = nw / ar; }
        nx = cropX + (cropW - nw);
      } else if (mode === 'ne') {
        nw = Math.max(16, Math.min(vw - cropX, cropW + dx));
        const maxH = cropY + cropH;
        nh = Math.max(16, Math.min(maxH, cropH - dy));
        if (cropLockAspect) { const ar = cropW / cropH; nw = Math.max(16, Math.min(vw - cropX, cropW + dx)); nh = nw / ar; }
        ny = cropY + (cropH - nh);
      } else if (mode === 'nw') {
        const maxW = cropX + cropW;
        const maxH = cropY + cropH;
        nw = Math.max(16, Math.min(maxW, cropW - dx));
        nh = Math.max(16, Math.min(maxH, cropH - dy));
        if (cropLockAspect) { const ar = cropW / cropH; nw = Math.max(16, Math.min(maxW, cropW - dx)); nh = nw / ar; }
        nx = cropX + (cropW - nw);
        ny = cropY + (cropH - nh);
      }
      updateSetting('cropX', String(Math.round(nx)));
      updateSetting('cropY', String(Math.round(ny)));
      updateSetting('cropW', String(Math.round(nw)));
      updateSetting('cropH', String(Math.round(nh)));
    };
    const onUp = () => setCropDrag(null);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [cropDrag, cropLockAspect]);

  const detectScenes = async () => {
    if (!mediaInfo && !selectedFile && !filePath) return;
    setAnalyzingScenes(true);
    try {
      let path = filePath;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('path', selectedFile.name);
        const res = await fetch('./api/index.php?action=ffmpeg_info', { method: 'POST', body: formData });
        const data = await res.json();
        path = data._temp_cleanup || selectedFile.name;
      }
      if (path) {
        const fd = new FormData();
        fd.append('path', path);
        fd.append('type', 'scenes');
        const res = await fetch('./api/index.php?action=ffmpeg_analyze', { method: 'POST', body: fd });
        const data = await res.json();
        setScenes(data.scenes || []);
      }
    } catch { }
    setAnalyzingScenes(false);
  };

  const handleConcatAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setConcatFiles(prev => [...prev, ...files]);
    if (concatInputRef.current) concatInputRef.current.value = '';
  };

  const handleConcatRemove = (idx) => {
    setConcatFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConcatMove = (idx, dir) => {
    const items = [...concatFiles];
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    setConcatFiles(items);
  };

  const handleConcatStart = async () => {
    if (concatFiles.length < 2) return;
    setConcatConverting(true);
    setConcatDone(null);
    await cleanupTemp();

    const formData = new FormData();
    for (const f of concatFiles) formData.append('files[]', f);
    formData.append('options', JSON.stringify({
      container: settings.container,
      re_encode: concatReEncode,
      video_codec: concatReEncode ? settings.videoCodec : 'copy',
      audio_codec: concatReEncode ? settings.audioCodec : 'copy',
      crf: concatReEncode ? settings.crf : '',
      preset: concatReEncode ? settings.preset : '',
      audio_bitrate: concatReEncode && settings.audioBitrate !== 'auto' ? settings.audioBitrate : '',
      metadata_preserve: settings.metadataPreserve,
    }));

    try {
      const res = await fetch('./api/index.php?action=ffmpeg_concat', { method: 'POST', body: formData });
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
              if (msg.type === 'done') setConcatDone(msg);
              else if (msg.type === 'error') setConcatDone({ error: msg.message });
            } catch { }
          }
        }
      }
    } catch { }
    setConcatConverting(false);
  };

  const handleSplitAddSegment = () => {
    setSplitSegments(prev => [...prev, { start: '', end: '', label: 'segment_' + (prev.length + 1) }]);
  };

  const handleSplitUpdateSegment = (idx, field, value) => {
    setSplitSegments(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleSplitRemoveSegment = (idx) => {
    setSplitSegments(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleSplitFromScenes = () => {
    if (!scenes || scenes.length === 0) return;
    const segs = scenes.map((s, i) => ({
      start: s.time,
      end: scenes[i + 1] ? scenes[i + 1].time : '',
      label: 'scene_' + (i + 1),
    }));
    setSplitSegments(segs);
  };

  const handleSplitStart = async () => {
    const valid = splitSegments.filter(s => s.start);
    if (valid.length === 0) return;
    setSplitConverting(true);
    setSplitResults([]);
    await cleanupTemp();

    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
      formData.append('input', selectedFile.name);
    } else {
      formData.append('input', filePath);
    }
    formData.append('segments', JSON.stringify(valid.map(s => ({ ...s, container: settings.container }))));

    try {
      const res = await fetch('./api/index.php?action=ffmpeg_split', { method: 'POST', body: formData });
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
              if (msg.type === 'segment_done') setSplitResults(prev => [...prev, msg]);
              else if (msg.type === 'segment_error') setSplitResults(prev => [...prev, msg]);
              else if (msg.type === 'done') splitDone();
            } catch { }
          }
        }
      }
    } catch { }
    setSplitConverting(false);
  };

  const splitDone = () => { };

  const hasEncoder = (name) => {
    return ffmpegStatus.video_encoders?.some(e => e.includes(name)) ||
      ffmpegStatus.audio_encoders?.some(e => e.includes(name));
  };

  const getAvailableVideoCodecs = () => {
    return VIDEO_CODECS.filter(c => {
      if (c.value === 'copy') return true;
      const encoderMap = { 'h264': 'libx264', 'h265': 'libx265', 'vp9': 'libvpx-vp9', 'av1': 'libaom-av1', 'mpeg4': 'mpeg4', 'vp8': 'libvpx' };
      const enc = encoderMap[c.value];
      return !enc || hasEncoder(enc);
    });
  };

  const getAvailableAudioCodecs = () => {
    return AUDIO_CODECS.filter(c => {
      if (c.value === 'copy') return true;
      const encoderMap = { 'aac': 'aac', 'mp3': 'libmp3lame', 'opus': 'libopus', 'flac': 'flac', 'wav': 'pcm_s16le', 'ac3': 'ac3', 'eac3': 'eac3' };
      const enc = encoderMap[c.value];
      return !enc || hasEncoder(enc);
    });
  };

  const isAudioOnly = ['m4a', 'mp3', 'flac', 'wav', 'ogg'].includes(settings.container);
  const isAudioContainer = isAudioOnly;
  const isGif = settings.container === 'gif';
  const showVideoOptions = !isAudioContainer && !isGif;

  // ---- Build command preview ----
  const buildCommandPreview = useCallback(() => {
    const s = settings;
    // Fix the comma-separated format bug for the preview
    const rawFmt = mediaInfo?.format_name || 'file';
    const inExt = rawFmt.split(',')[0];

    // Start building command (we don't add -i yet so we can put -hwaccel before it)
    let cmd = `ffmpeg -y`;

    const vfParts = [];
    const afParts = [];

    // 1. Build Visual Filters FIRST
    if (s.deinterlace) vfParts.push('yadif');
    if (s.resolution !== 'original') {
      vfParts.push(isNaN(s.resolution) ? `scale=${s.resolution.replace('x', ':')}` : `scale=-1:${s.resolution}`);
    }
    if (s.cropW && s.cropH && parseInt(s.cropW) > 0 && parseInt(s.cropH) > 0) {
      vfParts.push(`crop=${s.cropW}:${s.cropH}:${s.cropX || 0}:${s.cropY || 0}`);
    }

    const eqP = [];
    if (s.colorBrightness !== 0) eqP.push(`brightness=${s.colorBrightness}`);
    if (Math.abs(s.colorContrast - 1) > 0.01) eqP.push(`contrast=${s.colorContrast}`);
    if (Math.abs(s.colorSaturation - 1) > 0.01) eqP.push(`saturation=${s.colorSaturation}`);
    if (Math.abs(s.colorGamma - 1) > 0.01) eqP.push(`gamma=${s.colorGamma}`);
    if (eqP.length) vfParts.push('eq=' + eqP.join(':'));

    if (s.rotate === '90cw') vfParts.push('transpose=1');
    else if (s.rotate === '90ccw') vfParts.push('transpose=2');
    else if (s.rotate === '180') { vfParts.push('hflip'); vfParts.push('vflip'); }
    if (s.hflip) vfParts.push('hflip');
    if (s.vflip) vfParts.push('vflip');

    if (s.speed !== 1) vfParts.push(`setpts=${(1 / s.speed).toFixed(3)}*PTS`);

    if (s.watermarkType === 'text' && s.watermarkText) {
      const posMap = {
        'top-left': "x=10:y=10",
        'top-middle': "x=(w-tw)/2:y=10",
        'top-right': "x=w-tw-10:y=10",
        'center': "x=(w-tw)/2:y=(h-th)/2",
        'bottom-left': "x=10:y=h-th-10",
        'bottom-middle': "x=(w-tw)/2:y=h-th-10",
        'bottom-right': "x=w-tw-10:y=h-th-10"
      }
      const pos = posMap[s.watermarkPosition] || 'x=(w-tw)/2:y=(h-th)/2';

      let cleanColor = s.watermarkColor || '#ffffff';
      if (cleanColor.startsWith('#')) {
        cleanColor = cleanColor.replace('#', '0x');
        const opacityAlpha = Math.round((parseFloat(s.watermarkOpacity) || 1) * 255);
        const hexAlpha = opacityAlpha.toString(16).padStart(2, '0').toUpperCase();
        cleanColor += hexAlpha;
      }

      // NEW: Grab the selected font and build a placeholder path for the UI preview
      const fontFile = s.watermarkFont || (availableFonts.length > 0 ? availableFonts[0] : 'arial.ttf');
      const previewFontPath = `uploads/fonts/${fontFile}`;

      // Insert fontfile parameter into the string
      vfParts.push(`drawtext=text='${s.watermarkText}':fontfile='${previewFontPath}':fontsize=${s.watermarkFontSize}:fontcolor=${cleanColor}:${pos}`);
    }

    const originalCodec = mediaInfo?.streams?.find(s => s.type === 'video')?.codec;

    // 2. Determine Safe Video Codec & HW Accel Rules
    const needsVideoEncode = vfParts.length > 0 || (s.watermarkType === 'image');
    const displayVideoCodec = (s.videoCodec === 'copy' && needsVideoEncode) ? 'h264' : s.videoCodec;

    // NEW: Map to hardware encoder (e.g. h264_nvenc)
    const finalEncoder = displayVideoCodec === 'copy' ? 'copy' : getSafeEncoder(displayVideoCodec, s.hwaccel);

    // NEW: Disable hardware *decoding* if using CPU filters to avoid Code 69 crash
    const isProblematicCodec = originalCodec === 'av1' || originalCodec === 'vp9';
    const safeHwAccel = (needsVideoEncode && isProblematicCodec) ? 'none' : s.hwaccel;

    if (safeHwAccel && safeHwAccel !== 'none') cmd += ` -hwaccel ${safeHwAccel}`;

    // Append Inputs AFTER hwaccel
    cmd += ` -i input.${inExt}`;
    if (s.watermarkType === 'image') cmd += ` -i watermark.png`;

    // 3. Append Video Arguments using the new finalEncoder
    if (finalEncoder === 'copy') {
      cmd += ' -c:v copy';
    } else {
      cmd += ` -c:v ${finalEncoder}`;

      // --- THE NVENC CRF FIX ---
      if (finalEncoder.includes('nvenc')) {
        // NVENC uses -cq and requires VBR rate control to act like CRF
        if (s.crf !== '') cmd += ` -rc vbr -cq ${s.crf} -b:v 0`;
        // Map standard CPU presets to Nvidia's 'p' presets
        const nvencPresets = { 'ultrafast': 'p1', 'superfast': 'p2', 'veryfast': 'p3', 'faster': 'p4', 'fast': 'p4', 'medium': 'p4', 'slow': 'p5', 'slower': 'p6', 'veryslow': 'p7' };
        if (s.preset) cmd += ` -preset ${nvencPresets[s.preset] || 'p4'}`;
      } else {
        // Standard CPU CRF behavior
        if (s.crf !== '') cmd += ` -crf ${s.crf}`;
        if (s.preset) cmd += ` -preset ${s.preset}`;
      }

      if (s.videoBitrate !== 'auto') cmd += ` -b:v ${s.videoBitrate}`;
      if (s.framerate !== 'original') cmd += ` -r ${s.framerate}`;
      if (s.tune) cmd += ` -tune ${s.tune}`;
      if (s.profile) cmd += ` -profile:v ${s.profile}`;
      if (s.pixFmt) cmd += ` -pix_fmt ${s.pixFmt}`;
    }

    if (s.subtitleMode === 'copy') cmd += ' -c:s copy';

    // 4. Append Filters
    if (vfParts.length) cmd += ' -vf "' + vfParts.join(',') + '"';

    // 5. Build Audio
    if (s.audioCodec === 'copy') {
      cmd += ' -c:a copy';
    } else {
      const acMap = { 'aac': 'aac', 'mp3': 'libmp3lame', 'opus': 'libopus', 'flac': 'flac', 'wav': 'pcm_s16le', 'ac3': 'ac3', 'eac3': 'eac3' };
      cmd += ` -c:a ${acMap[s.audioCodec] || s.audioCodec}`;
      if (s.audioBitrate !== 'auto') cmd += ` -b:a ${s.audioBitrate}`;
      if (s.sampleRate !== 'original') cmd += ` -ar ${s.sampleRate}`;
      if (s.channels !== 'original') {
        const chMap = { 'mono': 1, 'stereo': 2, '5.1': 6, '7.1': 8 };
        cmd += ` -ac ${chMap[s.channels] || s.channels}`;
      }
    }

    if (s.speed !== 1 && s.speedMaintainPitch) {
      let r = s.speed;
      const at = [];
      while (r > 2) { at.push('atempo=2.0'); r /= 2; }
      while (r < 0.5) { at.push('atempo=0.5'); r /= 0.5; }
      if (Math.abs(r - 1) > 0.01) at.push(`atempo=${r.toFixed(6)}`);
      afParts.push(...at);
    } else if (s.volume !== '0' && s.volume !== 'original') {
      afParts.push(`volume=${s.volume}dB`);
    }

    if (afParts.length) cmd += ' -af "' + afParts.join(',') + '"';

    // 6. Append Utilities
    if (s.startTime) cmd += ` -ss ${s.startTime}`;
    if (s.duration) cmd += ` -t ${s.duration}`;
    if (s.twoPass) cmd += ' -pass 2';
    if (parseInt(s.threads) > 0) cmd += ` -threads ${s.threads}`;
    if (s.metadataPreserve) cmd += ' -map_metadata 0';
    if (s.container === 'mp4') cmd += ' -movflags +faststart';
    if (s.customArgs) cmd += ` ${s.customArgs}`;

    cmd += ` output.${s.container}`;
    return cmd;
  }, [settings, mediaInfo]);

  // ---- Batch queue processing ----
  // ---- Batch queue processing ----
  const processQueue = async () => {
    await cleanupTemp();

    // 1. Determine safe codec upfront before processing the queue
    const needsVideoEncode =
      settings.deinterlace ||
      settings.resolution !== 'original' ||
      (parseInt(settings.cropW) > 0 && parseInt(settings.cropH) > 0) ||
      settings.colorBrightness !== 0 ||
      Math.abs(settings.colorContrast - 1) > 0.01 ||
      Math.abs(settings.colorSaturation - 1) > 0.01 ||
      Math.abs(settings.colorGamma - 1) > 0.01 ||
      settings.rotate !== '' ||
      settings.hflip || settings.vflip ||
      settings.speed !== 1 ||
      (settings.watermarkType === 'text' && settings.watermarkText) ||
      settings.watermarkType === 'image';

    // Grab the original video codec from the probed streams
    const originalCodec = mediaInfo?.streams?.find(s => s.type === 'video')?.codec;

    // Force fallback to the original codec, or h264 if we can't figure it out
    let fallbackCodec = 'h264';
    if (originalCodec && originalCodec !== 'av1' && originalCodec !== 'vp9') {
      fallbackCodec = originalCodec;
    }
    const finalVideoCodec = (settings.videoCodec === 'copy' && needsVideoEncode) ? fallbackCodec : settings.videoCodec;

    // --- HW ACCEL FIX START ---
    // Map to hardware encoder (e.g., h264_nvenc) if applicable
    const finalEncoder = finalVideoCodec === 'copy' ? 'copy' : getSafeEncoder(finalVideoCodec, settings.hwaccel);

    // Disable GPU decoding if using filters on problematic codecs (AV1/VP9) to prevent Code 69
    const isProblematicCodec = originalCodec === 'av1' || originalCodec === 'vp9';
    const safeHwAccel = (needsVideoEncode && isProblematicCodec) ? 'none' : settings.hwaccel;
    // --- HW ACCEL FIX END ---

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'done' || item.status === 'error') continue;
      dispatch({ type: 'UPDATE_QUEUE_ITEM', payload: { index: i, data: { status: 'converting' } } });

      const options = {
        container: settings.container,
        video_codec: finalEncoder, // <-- Updated to use hardware encoder
        audio_codec: settings.audioCodec,
        crf: finalEncoder !== 'copy' ? settings.crf : '',
        video_bitrate: (finalEncoder !== 'copy' && settings.videoBitrate !== 'auto') ? settings.videoBitrate : '',
        resolution: settings.resolution, framerate: settings.framerate,
        preset: finalEncoder !== 'copy' ? settings.preset : '',
        tune: settings.tune, profile: settings.profile, pix_fmt: settings.pixFmt,
        audio_bitrate: (settings.audioCodec !== 'copy' && settings.audioBitrate !== 'auto') ? settings.audioBitrate : '',
        sample_rate: settings.sampleRate, channels: settings.channels, volume: settings.volume,
        start_time: settings.startTime, duration: settings.duration,
        crop_w: settings.cropW, crop_h: settings.cropH, crop_x: settings.cropX, crop_y: settings.cropY,
        subtitle_mode: settings.subtitleMode, subtitle_stream: settings.subtitleStream,
        deinterlace: settings.deinterlace,
        hwaccel: safeHwAccel, // <-- Now safe for AV1/VP9
        two_pass: settings.twoPass, threads: settings.threads,
        metadata_preserve: settings.metadataPreserve, custom_args: settings.customArgs,
      };

      try {
        const formData = new FormData();
        formData.append('input', item.file.name);
        formData.append('file', item.file);
        formData.append('options', JSON.stringify(options));

        const res = await fetch('./api/index.php?action=ffmpeg_convert', { method: 'POST', body: formData });
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
                  dispatch({ type: 'UPDATE_QUEUE_ITEM', payload: { index: i, data: { progress: msg.percent, status: 'converting' } } });
                } else if (msg.type === 'done') {
                  dispatch({ type: 'UPDATE_QUEUE_ITEM', payload: { index: i, data: { status: 'done', progress: 100, result: msg } } });
                } else if (msg.type === 'error') {
                  dispatch({ type: 'UPDATE_QUEUE_ITEM', payload: { index: i, data: { status: 'error', error: msg.message } } });
                }
              } catch { }
            }
          }
        }
      } catch (e) {
        dispatch({ type: 'UPDATE_QUEUE_ITEM', payload: { index: i, data: { status: 'error', error: e.message } } });
      }
    }
  };

  const updateSetting = (key, value) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { key, value } });
  };

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
            <button className="btn-refresh-status" onClick={checkFfmpeg} title="Check status"><RefreshCw size={14} /></button>
          </>
        ) : (
          <><AlertCircle size={16} /> FFmpeg not found
            <span className="ffmpeg-install-hint">Install FFmpeg from <a href="https://ffmpeg.org" target="_blank" rel="noopener">ffmpeg.org</a></span>
          </>
        )}
      </div>

      {/* File Selection */}
      {!mediaInfo && !loadingInfo && !fileError && (
        <div className="file-selection-section">
          <div ref={dropZoneRef} className="drop-zone" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()}>
            <Upload size={40} className="drop-zone-icon" />
            <h3>Drop a media file here</h3>
            <p>or click to browse your files</p>
            <input ref={fileInputRef} type="file" accept="video/*,audio/*,image/gif" style={{ display: 'none' }} onChange={handleFileSelected} />
          </div>

          <div className="path-input-divider"><span>OR enter a server path</span></div>

          <div className="path-input-section">
            <div className="path-input-wrapper">
              <Folder size={18} className="path-icon" />
              <input type="text" className="path-input" placeholder="C:\Users\...\video.mp4"
                value={filePath} onChange={(e) => dispatch({ type: 'SET_FILE_PATH', payload: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePathSubmit(); }} />
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
          <button className="btn-try-again" onClick={handleReset}>Try Again</button>
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
              <button className="btn-icon" onClick={handleReset} title="Clear file"><X size={16} /></button>
            </div>
          </div>
          <div className="media-stats">
            <div className="media-stat"><Clock size={14} /><span className="stat-label">Duration</span><span className="stat-value">{formatDuration(mediaInfo.duration)}</span></div>
            <div className="media-stat"><Disc size={14} /><span className="stat-label">Size</span><span className="stat-value">{formatBytes(mediaInfo.size)}</span></div>
            <div className="media-stat"><Radio size={14} /><span className="stat-label">Bitrate</span><span className="stat-value">{formatBitrate(mediaInfo.bit_rate)}</span></div>
            <div className="media-stat"><Film size={14} /><span className="stat-label">Streams</span><span className="stat-value">{mediaInfo.streams?.length || 0}</span></div>
          </div>
          {videoStreams.length > 0 && (
            <div className="streams-section">
              <h4 className="streams-heading"><Video size={16} /> Video Streams ({videoStreams.length})</h4>
              <div className="streams-list">{videoStreams.map(s => <StreamCard key={s.index} stream={s} />)}</div>
            </div>
          )}
          {audioStreams.length > 0 && (
            <div className="streams-section">
              <h4 className="streams-heading"><Music size={16} /> Audio Streams ({audioStreams.length})</h4>
              <div className="streams-list">{audioStreams.map(s => <StreamCard key={s.index} stream={s} />)}</div>
            </div>
          )}
          {subtitleStreams.length > 0 && (
            <div className="streams-section">
              <h4 className="streams-heading"><Subtitles size={16} /> Subtitle Streams ({subtitleStreams.length})</h4>
              <div className="streams-list">{subtitleStreams.map(s => <StreamCard key={s.index} stream={s} />)}</div>
            </div>
          )}
        </div>
      )}

      {/* Video Preview */}
      {mediaInfo && !loadingInfo && (
        <div className="preview-section">
          <div className="preview-inner">
            <div className="preview-player-wrap">
              {videoSrc ? (
                <>
                  <video ref={videoRef} className="preview-video" src={videoSrc}
                    onClick={() => { const v = videoRef.current; if (!v) return; if (v.paused) v.play(); else v.pause(); }}
                    onTimeUpdate={() => { if (!playerSeeking.current) setPlayerTime(videoRef.current?.currentTime || 0); }}
                    onPlay={() => setPlayerPlaying(true)} onPause={() => setPlayerPlaying(false)}
                    onLoadedMetadata={() => { setPlayerTime(0); setPlayerPlaying(false); }}
                    style={getPreviewStyle()}>
                    Your browser does not support video playback.
                  </video>
                  {/* Include our runtime style wrapper injection right above the watermark */}
                  {fontStylesMarkup}

                  {settings.watermarkType === 'text' && settings.watermarkText && (
                    <div
                      className="preview-watermark"
                      style={{
                        ...watermarkPosMap[settings.watermarkPosition] || watermarkPosMap.se,
                        opacity: settings.watermarkOpacity,
                        color: settings.watermarkColor,
                        fontSize: `${visualFontSize}px`,
                        fontFamily: `'${dynamicFontFamilyName}', sans-serif` // 🟢 Added this line
                      }}
                    >
                      {settings.watermarkText}
                    </div>
                  )}
                  {videoSrc && (() => {
                    const rect = videoRef.current?.getBoundingClientRect();
                    const vw = videoRef.current?.videoWidth || rect?.width || 1;
                    const vh = videoRef.current?.videoHeight || rect?.height || 1;
                    const dw = rect?.width || 320;
                    const dh = rect?.height || 240;
                    const hasCrop = parseInt(settings.cropW) > 0 && parseInt(settings.cropH) > 0;
                    const cx = hasCrop ? (parseInt(settings.cropX) || 0) / vw * 100 : 0;
                    const cy = hasCrop ? (parseInt(settings.cropY) || 0) / vh * 100 : 0;
                    const cw = hasCrop ? (parseInt(settings.cropW) || 0) / vw * 100 : 100;
                    const ch = hasCrop ? (parseInt(settings.cropH) || 0) / vh * 100 : 100;
                    const cxEnd = cx + cw;
                    const cyEnd = cy + ch;
                    return (
                      <div className="crop-overlay" style={{ zIndex: 5 }}>
                        {hasCrop && (
                          <>
                            <div className="crop-mask" style={{ top: '0', left: '0', right: '0', height: `${cy}%` }} />
                            <div className="crop-mask" style={{ top: `${cyEnd}%`, left: '0', right: '0', bottom: '0' }} />
                            <div className="crop-mask" style={{ top: `${cy}%`, left: '0', width: `${cx}%`, height: `${ch}%` }} />
                            <div className="crop-mask" style={{ top: `${cy}%`, right: '0', width: `${100 - cxEnd}%`, height: `${ch}%` }} />
                            <div className="crop-stats">{Math.round(parseInt(settings.cropW) || 0)}×{Math.round(parseInt(settings.cropH) || 0)} · ({parseInt(settings.cropX) || 0},{parseInt(settings.cropY) || 0}) · {(() => {
                              const w = parseInt(settings.cropW) || 1;
                              const h = parseInt(settings.cropH) || 1;
                              const g = (a, b) => b ? g(b, a % b) : a;
                              const d = g(w, h);
                              return `${w / d}:${h / d}`;
                            })()}</div>
                          </>
                        )}
                        {hasCrop && (
                          <div className="crop-hole" style={{ left: `${cx}%`, top: `${cy}%`, width: `${cw}%`, height: `${ch}%` }} onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'move'); }} />
                        )}
                        <div className={`crop-border${hasCrop ? '' : ' crop-border-inert'}`} style={{ left: `${cx}%`, top: `${cy}%`, width: `${cw}%`, height: `${ch}%` }} />
                        <div className="crop-handle" style={{ cursor: 'nw-resize', left: `${cx}%`, top: `${cy}%` }} onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'nw'); }} />
                        <div className="crop-handle" style={{ cursor: 'ne-resize', left: `${cxEnd}%`, top: `${cy}%` }} onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'ne'); }} />
                        <div className="crop-handle" style={{ cursor: 'sw-resize', left: `${cx}%`, top: `${cyEnd}%` }} onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'sw'); }} />
                        <div className="crop-handle" style={{ cursor: 'se-resize', left: `${cxEnd}%`, top: `${cyEnd}%` }} onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'se'); }} />
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="preview-placeholder">
                  <FileVideo size={32} />
                  <span>{mediaInfo.filename}</span>
                </div>
              )}
            </div>
          </div>
          {/* Custom player controls */}
          {videoSrc && (
            <div className="player-controls" onClick={(e) => e.stopPropagation()}>
              <button className="pc-btn" onClick={() => { const v = videoRef.current; if (!v) return; if (v.paused) v.play(); else v.pause(); }} title={playerPlaying ? 'Pause' : 'Play'}>
                {playerPlaying ? <span className="pc-icon">⏸</span> : <span className="pc-icon">▶</span>}
              </button>
              <span className="pc-time">{secondsToTimeStr(playerTime) || '0:00.000'}</span>
              <div className="pc-progress" onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const rawT = pct * trimDuration;
                const startSec = parseTimeToSeconds(settings.startTime);
                const durSec = parseTimeToSeconds(settings.duration);
                const endSec = durSec > 0 ? Math.min(startSec + durSec, trimDuration) : trimDuration;
                const t = Math.max(startSec, Math.min(durSec > 0 ? endSec : trimDuration, rawT));
                playerSeeking.current = true;
                if (videoRef.current) videoRef.current.currentTime = t;
                setPlayerTime(t);
                const onMove = (e2) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const p = Math.max(0, Math.min(1, (e2.clientX - r.left) / r.width));
                  const ntRaw = p * trimDuration;
                  const nt = Math.max(startSec, Math.min(durSec > 0 ? endSec : trimDuration, ntRaw));
                  if (videoRef.current) videoRef.current.currentTime = nt;
                  setPlayerTime(nt);
                };
                const onUp = () => { playerSeeking.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}>
                {(() => {
                  const startSec = parseTimeToSeconds(settings.startTime);
                  const durSec = parseTimeToSeconds(settings.duration);
                  const endSec = durSec > 0 ? Math.min(startSec + durSec, trimDuration) : trimDuration;
                  const hasTrim = startSec > 0 || durSec > 0;
                  const dur = videoRef.current?.duration || trimDuration;
                  const pct = dur ? (playerTime / dur) * 100 : 0;
                  return (
                    <>
                      <div className="pc-progress-track" />
                      {hasTrim && <div className="pc-progress-outside" style={{ left: '0', width: `${(startSec / dur) * 100}%` }} />}
                      <div className="pc-progress-fill" style={{ left: `${(startSec / dur) * 100}%`, width: `${((endSec - startSec) / dur) * 100}%` }} />
                      {hasTrim && <div className="pc-progress-outside" style={{ left: `${(endSec / dur) * 100}%`, width: `${((dur - endSec) / dur) * 100}%` }} />}
                      <div className="pc-progress-thumb" style={{ left: `${pct}%` }} />
                    </>
                  );
                })()}
              </div>
              <span className="pc-time">{secondsToTimeStr(trimDuration)}</span>
              <button className="pc-btn pc-vol-btn" onClick={() => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; }}>
                <span className="pc-icon">{videoRef.current?.muted || videoRef.current?.volume === 0 ? '🔇' : videoRef.current?.volume < 0.5 ? '🔉' : '🔊'}</span>
              </button>
              <input type="range" className="pc-vol-slider" min="0" max="1" step="0.05" defaultValue={1}
                onChange={(e) => { const v = videoRef.current; if (v) { v.volume = parseFloat(e.target.value); v.muted = false; } }} />
            </div>
          )}
          {/* Trim Timeline */}
          {videoSrc && trimDuration > 0 && (
            <div className="trim-timeline" onMouseDown={(e) => {
              if (e.target.closest('.trim-handle')) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const pos = pct * trimDuration;
              if (videoRef.current) videoRef.current.currentTime = pos;
            }}>
              <div className="trim-track">
                <div className="trim-track-bg" />
                {(() => {
                  const startSec = parseTimeToSeconds(settings.startTime);
                  const durSec = parseTimeToSeconds(settings.duration);
                  const endSec = durSec > 0 ? Math.min(startSec + durSec, trimDuration) : trimDuration;
                  const sp = (startSec / trimDuration) * 100;
                  const ep = (endSec / trimDuration) * 100;
                  return (
                    <>
                      <div className="trim-range" style={{ left: `${sp}%`, width: `${ep - sp}%` }} />
                      <div className="trim-handle trim-handle-start" style={{ left: `${sp}%` }}
                        onMouseDown={(e) => handleTrimMouseDown(e, 'start')}>
                        <span className="trim-label">{secondsToTimeStr(startSec) || '0:00.000'}</span>
                      </div>
                      <div className="trim-handle trim-handle-end" style={{ left: `${ep}%` }}
                        onMouseDown={(e) => handleTrimMouseDown(e, 'end')}>
                        <span className="trim-label">{secondsToTimeStr(endSec) || secondsToTimeStr(trimDuration)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          {/* Trim & Crop settings */}
          {videoSrc && (
            <div className="trim-crop-bar">
              <div className="tcb-row">
                <div className="tcb-field">
                  <span className="tcb-label">Start</span>
                  <input type="text" className="tcb-input" value={settings.startTime}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateSetting('startTime', v);
                      const s = parseTimeToSeconds(v);
                      const d = parseTimeToSeconds(settings.duration);
                      if (s > 0 && d > 0) {
                        const maxEnd = trimDuration;
                        const end = Math.min(s + d, maxEnd);
                        const newD = end - s;
                        updateSetting('duration', newD > 0.001 ? secondsToTimeStr(newD) : '');
                      }
                    }} placeholder="0:00.000" />
                </div>
                <div className="tcb-field">
                  <span className="tcb-label">End</span>
                  <input type="text" className="tcb-input" value={(() => {
                    const s = parseTimeToSeconds(settings.startTime);
                    const d = parseTimeToSeconds(settings.duration);
                    if (d > 0) return secondsToTimeStr(Math.min(s + d, trimDuration));
                    return '';
                  })()}
                    onChange={(e) => {
                      const v = e.target.value;
                      const endSec = parseTimeToSeconds(v);
                      const startSec = parseTimeToSeconds(settings.startTime);
                      if (endSec > 0 && endSec > startSec) {
                        const newDur = endSec - startSec;
                        updateSetting('duration', newDur > 0.001 ? secondsToTimeStr(newDur) : '');
                      }
                    }} placeholder="0:00.000" />
                </div>
                <div className="tcb-field">
                  <span className="tcb-label">Dur</span>
                  <input type="text" className="tcb-input" value={settings.duration}
                    onChange={(e) => updateSetting('duration', e.target.value)} placeholder="0:05.000" />
                </div>
                <button className="tcb-btn" onClick={() => { updateSetting('startTime', ''); updateSetting('duration', ''); }} title="Reset trim"><Trash2 size={12} /></button>
              </div>
              <div className="tcb-row">
                <div className="tcb-field tcb-crop">
                  <span className="tcb-label">Crop</span>
                  <input type="number" className="tcb-input-sm" value={settings.cropW}
                    onChange={(e) => updateSetting('cropW', e.target.value)} placeholder="W" min="0" />
                  <span className="tcb-dim">×</span>
                  <input type="number" className="tcb-input-sm" value={settings.cropH}
                    onChange={(e) => updateSetting('cropH', e.target.value)} placeholder="H" min="0" />
                  <span className="tcb-dim">@</span>
                  <input type="number" className="tcb-input-sm" value={settings.cropX}
                    onChange={(e) => updateSetting('cropX', e.target.value)} placeholder="X" min="0" />
                  <input type="number" className="tcb-input-sm" value={settings.cropY}
                    onChange={(e) => updateSetting('cropY', e.target.value)} placeholder="Y" min="0" />
                </div>
                <label className="tcb-toggle" title="Lock aspect ratio when resizing">
                  <input type="checkbox" checked={cropLockAspect} onChange={(e) => setCropLockAspect(e.target.checked)} />
                  <span>Lock</span>
                </label>
                <label className="tcb-toggle" title="Deinterlace video">
                  <input type="checkbox" checked={settings.deinterlace} onChange={(e) => updateSetting('deinterlace', e.target.checked)} />
                  <span>Dei</span>
                </label>
                <button className="tcb-btn" onClick={() => { updateSetting('cropW', ''); updateSetting('cropH', ''); updateSetting('cropX', ''); updateSetting('cropY', ''); }} title="Reset crop"><Trash2 size={12} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Presets */}
      {mediaInfo && !loadingInfo && !convertDone && (
        <div className="preset-cards-section">
          <div className="options-title-row" style={{ marginBottom: '10px' }}>
            <h3 className="options-title"><Wand2 size={18} /> Presets</h3>
            <span className="options-subtitle">Quick-start settings for common use cases</span>
          </div>
          <div className="preset-cards-grid">
            {Object.entries(QUICK_PRESETS).map(([key, preset]) => {
              const cats = { default: 'default', web_h264: 'web', web_h265: 'web', compatible: 'compat', youtube: 'social', discord: 'social', small: 'size', audio: 'audio' };
              const isActive = Object.entries(preset.settings).every(([k, v]) => settings[k] === v);
              return (
                <button key={key} className={`preset-card cat-${cats[key] || 'default'}${isActive ? ' active' : ''}`} onClick={() => handleQuickPreset(key)} title={preset.settings.container + ' · ' + preset.settings.videoCodec + '/' + preset.settings.audioCodec} type="button">
                  <span className="preset-card-label">{preset.label}</span>
                  <span className="preset-card-desc">{preset.settings.container.toUpperCase()} {preset.settings.videoCodec !== 'copy' ? '· ' + preset.settings.videoCodec.toUpperCase() : ''}</span>
                </button>
              );
            })}
          </div>
          <div className="preset-actions">
            {Object.keys(savedPresets).length > 0 && (
              <select className="preset-saved-select" defaultValue="" onChange={(e) => { if (e.target.value) handleApplySavedPreset(e.target.value); }}>
                <option value="" disabled>Saved presets ({Object.keys(savedPresets).length})</option>
                {Object.keys(savedPresets).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
            <button className="btn-sm" onClick={() => setShowSavePreset(true)} title="Save current settings"><Save size={13} /> Save</button>
            <button className="btn-sm" onClick={handlePresetExport} title="Export settings as JSON"><Download size={13} /> Export</button>
            <button className="btn-sm" onClick={() => presetInputRef.current?.click()} title="Import settings from JSON"><Upload size={13} /> Import</button>
            <input ref={presetInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handlePresetImport} />
          </div>
        </div>
      )}

      {/* Save Preset Dialog */}
      {showSavePreset && (
        <div className="save-preset-dialog">
          <input type="text" className="input-full" placeholder="Preset name..." value={presetName} onChange={(e) => setPresetName(e.target.value)} autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && presetName.trim()) { savePresetToStorage(presetName.trim(), settings); } }} />
          <button className="btn-primary-small" onClick={() => { if (presetName.trim()) savePresetToStorage(presetName.trim(), settings); }} disabled={!presetName.trim()}>Save</button>
          <button className="btn-secondary-small" onClick={() => { setShowSavePreset(false); setPresetName(''); }}>Cancel</button>
        </div>
      )}

      {/* Tab Navigation */}
      {mediaInfo && !loadingInfo && !convertDone && (
        <div className="conv-tabs">
          <button className={`conv-tab ${activeTab === 'format' ? 'active' : ''}`} onClick={() => setActiveTab('format')}><Film size={15} /> Format</button>
          <button className={`conv-tab ${activeTab === 'effects' ? 'active' : ''}`} onClick={() => setActiveTab('effects')}><Palette size={15} /> Effects</button>
          <button className={`conv-tab ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}><Scissors size={15} /> Tools</button>
          <button className={`conv-tab ${activeTab === 'convert' ? 'active' : ''}`} onClick={() => setActiveTab('convert')}><Wand2 size={15} /> Convert</button>
        </div>
      )}

      {/* Tab: Format */}
      {mediaInfo && !loadingInfo && !convertDone && activeTab === 'format' && (
        <div className="conversion-options">
          <div className="options-title-row">
            <h3 className="options-title"><Film size={18} /> Format Settings</h3>
          </div>

          {/* Output Format */}
          <Section icon={Film} title="Output Format" description="Choose the container format for your converted file." defaultOpen={true}>
            <div className="container-grid">
              {CONTAINERS.map(c => (
                <button key={c.value} className={`container-btn ${settings.container === c.value ? 'active' : ''}`}
                  onClick={() => updateSetting('container', c.value)} title={c.description} type="button">
                  <span className="container-btn-label">{c.label}</span>
                  <span className="container-btn-desc">{c.description}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Video Options */}
          {showVideoOptions && (
            <Section icon={Video} title="Video Settings" description="Configure video encoding parameters." defaultOpen={false}>
              <OptionRow label="Video Codec" tooltip="Choose how to encode the video stream. 'Copy' skips re-encoding." description="Select video encoder">
                <select value={settings.videoCodec} onChange={(e) => updateSetting('videoCodec', e.target.value)}>
                  {getAvailableVideoCodecs().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </OptionRow>
              {settings.videoCodec !== 'copy' && (
                <>
                  <OptionRow label="CRF Quality" tooltip="Constant Rate Factor. Lower = better quality, larger file." description={getCrfDescription(settings.crf)}>
                    <div className="crf-slider-group">
                      <input type="range" min="0" max="51" step="1" value={settings.crf}
                        onChange={(e) => updateSetting('crf', e.target.value)} className="crf-slider" title="0-51: Lower = better quality, larger file" />
                      <span className="crf-value">{settings.crf}</span>
                    </div>
                  </OptionRow>
                  <OptionRow label="Video Bitrate" tooltip="Target bitrate. Leave 'Auto' to use CRF. Format: 1000k, 5M." description="Set a specific bitrate target">
                    <div className="bitrate-input-group">
                      <select value={settings.videoBitrate === 'auto' ? 'auto' : 'custom'}
                        onChange={(e) => {
                          if (e.target.value === 'auto') {
                            updateSetting('videoBitrate', 'auto');
                          } else {
                            const bps = mediaInfo?.bit_rate;
                            const suggested = bps >= 1000000 ? (bps / 1000000).toFixed(1) + 'M' : (bps >= 1000 ? Math.round(bps / 1000) + 'k' : '1000k');
                            updateSetting('videoBitrate', suggested);
                          }
                        }}>
                        <option value="auto">Auto (use CRF)</option>
                        <option value="custom">Custom</option>
                      </select>
                      {settings.videoBitrate !== 'auto' && (
                        <input type="text" className="input-inline" value={settings.videoBitrate}
                          onChange={(e) => updateSetting('videoBitrate', e.target.value)} placeholder="1000k, 5M..." />
                      )}
                    </div>
                  </OptionRow>
                  <OptionRow label="Resolution" tooltip="Output resolution. Pick a standard size, or choose Custom for exact dimensions." description="Lower resolution = smaller file">
                    {RESOLUTIONS.some(r => r.value === settings.resolution) ? (
                      <select value={settings.resolution} onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          updateSetting('resolution', '');
                        } else {
                          updateSetting('resolution', e.target.value);
                        }
                      }}>
                        {RESOLUTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        <option value="__custom__">Custom…</option>
                      </select>
                    ) : (
                      <div className="resolution-custom-group">
                        <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center' }}>
                          <input type="text" className="input-inline" value={settings.resolution}
                            onChange={(e) => updateSetting('resolution', e.target.value)}
                            placeholder="e.g. 1920x1080 or 540" style={{ flex: '1' }} />
                          <button className="btn-sm" onClick={() => updateSetting('resolution', 'original')}>Presets</button>
                        </div>
                        <span className="input-hint">Use <strong>WxH</strong> (e.g. 1920x1080) or just a <strong>height</strong> (e.g. 720 for auto-width)</span>
                      </div>
                    )}
                  </OptionRow>
                  <OptionRow label="Frame Rate" tooltip="Output frames per second." description="Common video standards">
                    <select value={settings.framerate} onChange={(e) => updateSetting('framerate', e.target.value)}>
                      {FPS_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </OptionRow>
                  <OptionRow label="Encoding Preset" tooltip="Speed vs compression tradeoff." description="Affects encoding speed and file size">
                    <select value={settings.preset} onChange={(e) => updateSetting('preset', e.target.value)}>
                      {PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </OptionRow>
                  {['h264', 'h265'].includes(settings.videoCodec) && (
                    <OptionRow label="Tune" tooltip="Optimize encoding for specific content types (x264/x265 only)." description="Tune for your content type">
                      <select value={settings.tune} onChange={(e) => updateSetting('tune', e.target.value)}>
                        {TUNE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </OptionRow>
                  )}
                  {['h264', 'h265'].includes(settings.videoCodec) && (
                    <OptionRow label="Profile" tooltip="Constraint on encoding features for device compatibility (x264/x265 only)." description="Compatibility level">
                      <select value={settings.profile} onChange={(e) => updateSetting('profile', e.target.value)}>
                        {PROFILES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </OptionRow>
                  )}
                  <OptionRow label="Pixel Format" tooltip="Color subsampling. yuv420p is most compatible." description="Color sampling format">
                    <select value={settings.pixFmt} onChange={(e) => updateSetting('pixFmt', e.target.value)}>
                      {PIX_FMTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </OptionRow>
                </>
              )}
            </Section>
          )}

          {/* GIF Options */}
          {isGif && (
            <Section icon={Image} title="GIF Settings" description="Options specific to animated GIF output." defaultOpen={false}>
              <OptionRow label="Frame Rate" tooltip="Lower FPS = smaller GIF." description="GIF frame rate">
                <select value={settings.framerate} onChange={(e) => updateSetting('framerate', e.target.value)}>
                  {FPS_OPTIONS.filter(f => ['original', '10', '15', '20', '24', '30'].includes(f.value)).map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </OptionRow>
              <OptionRow label="Resolution" tooltip="GIFs are large. Lower resolution helps. Pick a standard size or enter a custom one." description="Output size">
                {RESOLUTIONS.filter(r => ['original', '720', '540', '480', '360'].includes(r.value)).some(r => r.value === settings.resolution) ? (
                  <select value={settings.resolution} onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      updateSetting('resolution', '');
                    } else {
                      updateSetting('resolution', e.target.value);
                    }
                  }}>
                    {RESOLUTIONS.filter(r => ['original', '720', '540', '480', '360'].includes(r.value)).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    <option value="__custom__">Custom…</option>
                  </select>
                ) : (
                  <div className="resolution-custom-group">
                    <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center' }}>
                      <input type="text" className="input-inline" value={settings.resolution}
                        onChange={(e) => updateSetting('resolution', e.target.value)}
                        placeholder="e.g. 320x240 or 480" style={{ flex: '1' }} />
                      <button className="btn-sm" onClick={() => updateSetting('resolution', 'original')}>Presets</button>
                    </div>
                    <span className="input-hint">Use <strong>WxH</strong> (e.g. 320x240) or just a <strong>height</strong> (e.g. 480 for auto-width)</span>
                  </div>
                )}
              </OptionRow>
            </Section>
          )}

          {/* Audio Options */}
          {!isGif && (
            <Section icon={Music} title="Audio Settings" description="Configure audio encoding." defaultOpen={false}>
              <OptionRow label="Audio Codec" tooltip="How to encode the audio stream. 'Copy' preserves original quality." description="Choose audio encoder">
                <select value={settings.audioCodec} onChange={(e) => updateSetting('audioCodec', e.target.value)}>
                  {getAvailableAudioCodecs().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </OptionRow>
              {settings.audioCodec !== 'copy' && (
                <>
                  <OptionRow label="Audio Bitrate" tooltip="Higher bitrate = better quality, larger file." description="Audio quality">
                    <select value={settings.audioBitrate} onChange={(e) => updateSetting('audioBitrate', e.target.value)}>
                      {AUDIO_BITRATES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </OptionRow>
                  <OptionRow label="Sample Rate" tooltip="Audio sample frequency." description="Audio frequency">
                    <select value={settings.sampleRate} onChange={(e) => updateSetting('sampleRate', e.target.value)}>
                      {SAMPLE_RATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </OptionRow>
                  <OptionRow label="Channels" tooltip="Number of audio channels." description="Audio channels">
                    <select value={settings.channels} onChange={(e) => updateSetting('channels', e.target.value)}>
                      {CHANNEL_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </OptionRow>
                  <OptionRow label="Volume Adjustment" tooltip="Adjust audio volume in dB." description="Volume level">
                    <div className="volume-group">
                      <input type="range" min="-30" max="30" step="1" value={settings.volume}
                        onChange={(e) => updateSetting('volume', e.target.value)} className="crf-slider" title="-30 dB to +30 dB: Adjust audio volume" />
                      <span className="crf-value">{settings.volume > 0 ? '+' : ''}{settings.volume} dB</span>
                    </div>
                  </OptionRow>
                </>
              )}
            </Section>
          )}

          {showAdvanced && (
            <Section icon={Settings} title="Advanced Settings" description="Fine-tune encoding with advanced parameters." defaultOpen={false}>
              <OptionRow label="Hardware Acceleration" tooltip="Use GPU to speed up encoding." description="GPU encoding">
                <select value={settings.hwaccel} onChange={(e) => updateSetting('hwaccel', e.target.value)}>
                  {HW_ACCELS.map(h => (
                    <option key={h.value} value={h.value}
                      disabled={h.value !== 'none' && !ffmpegStatus.hwaccels?.includes(h.value)}>{h.label}</option>
                  ))}
                </select>
              </OptionRow>
              <OptionRow label="2-Pass Encoding" tooltip="Analyze video twice for optimal bitrate distribution. 2x slower." description="Analyze twice for better quality">
                <label className="toggle-label">
                  <input type="checkbox" checked={settings.twoPass} onChange={(e) => updateSetting('twoPass', e.target.checked)} disabled={settings.videoCodec === 'copy'} />
                  <span className="toggle-switch"></span>
                  {settings.twoPass ? 'Enabled' : 'Disabled'}
                </label>
              </OptionRow>
              <OptionRow label="Threads" tooltip="Number of CPU threads for encoding. 0 = auto (recommended)." description="CPU threads">
                <input type="number" className="input-inline" value={settings.threads}
                  onChange={(e) => updateSetting('threads', e.target.value)} min="0" max="64" placeholder="0 = auto" style={{ width: '80px' }} />
                <span className="input-suffix">(0 = auto)</span>
              </OptionRow>
              <OptionRow label="Preserve Metadata" tooltip="Keep original file metadata in the output." description="Keep metadata">
                <label className="toggle-label">
                  <input type="checkbox" checked={settings.metadataPreserve} onChange={(e) => updateSetting('metadataPreserve', e.target.checked)} />
                  <span className="toggle-switch"></span>
                  {settings.metadataPreserve ? 'Enabled' : 'Disabled'}
                </label>
              </OptionRow>
              <OptionRow label="Custom FFmpeg Arguments" tooltip="Add any additional FFmpeg arguments directly." description="Raw ffmpeg flags">
                <input type="text" className="input-full" value={settings.customArgs}
                  onChange={(e) => updateSetting('customArgs', e.target.value)}
                  placeholder="-vf 'eq=brightness=0.1' -metadata title='My Video' ..." />
              </OptionRow>
            </Section>
          )}
        </div>
      )}

      {/* Tab: Effects */}
      {mediaInfo && !loadingInfo && !convertDone && activeTab === 'effects' && (
        <div className="conversion-options">
          <div className="options-title-row">
            <h3 className="options-title"><Palette size={18} /> Visual Effects</h3>
          </div>
          <ToggleSection icon={Palette} title="Visual Filters" description="Apply color correction, watermarks, speed changes, and rotation effects." open={true}>
            {/* Color Correction */}
            <h4 className="vf-subheading"><Gauge size={14} /> Color Correction</h4>
            <OptionRow label="Brightness" tooltip="Adjust image brightness. Negative = darker, positive = brighter." description="Image brightness">
              <div className="crf-slider-group">
                <input type="range" min="-1" max="1" step="0.05" value={settings.colorBrightness}
                  onChange={(e) => updateSetting('colorBrightness', parseFloat(e.target.value))} className="crf-slider" title="-1 to +1: Negative = darker, Positive = brighter" />
                <span className="crf-value">{settings.colorBrightness > 0 ? '+' : ''}{settings.colorBrightness}</span>
              </div>
            </OptionRow>
            <OptionRow label="Contrast" tooltip="Adjust image contrast. 1.0 is normal. Higher = more contrast." description="Image contrast">
              <div className="crf-slider-group">
                <input type="range" min="0.1" max="2.0" step="0.05" value={settings.colorContrast}
                  onChange={(e) => updateSetting('colorContrast', parseFloat(e.target.value))} className="crf-slider" title="0.1 to 2.0: 1.0 = normal" />
                <span className="crf-value">{settings.colorContrast.toFixed(2)}</span>
              </div>
            </OptionRow>
            <OptionRow label="Saturation" tooltip="Color intensity. 1.0 is normal. 0 = grayscale." description="Color saturation">
              <div className="crf-slider-group">
                <input type="range" min="0" max="3" step="0.05" value={settings.colorSaturation}
                  onChange={(e) => updateSetting('colorSaturation', parseFloat(e.target.value))} className="crf-slider" title="0 to 3: 1.0 = normal, 0 = grayscale" />
                <span className="crf-value">{settings.colorSaturation.toFixed(2)}</span>
              </div>
            </OptionRow>
            <OptionRow label="Gamma" tooltip="Adjust mid-tone brightness. 1.0 is normal." description="Gamma correction">
              <div className="crf-slider-group">
                <input type="range" min="0.1" max="2.0" step="0.05" value={settings.colorGamma}
                  onChange={(e) => updateSetting('colorGamma', parseFloat(e.target.value))} className="crf-slider" title="0.1 to 2.0: 1.0 = normal" />
                <span className="crf-value">{settings.colorGamma.toFixed(2)}</span>
              </div>
            </OptionRow>

            <hr className="vf-divider" />

            {/* Speed */}
            <h4 className="vf-subheading"><Sun size={14} /> Speed Change</h4>
            <OptionRow label="Speed" tooltip="Change playback speed. 1.0 = normal, 2.0 = double speed, 0.5 = half speed." description="Playback rate">
              <div className="crf-slider-group">
                <input type="range" min="0.25" max="4" step="0.05" value={settings.speed}
                  onChange={(e) => updateSetting('speed', parseFloat(e.target.value))} className="crf-slider" title="0.25x to 4x: 1.0 = normal speed" />
                <span className="crf-value">{settings.speed.toFixed(2)}x</span>
              </div>
            </OptionRow>
            <OptionRow label="Frame Handling" tooltip="How to handle frames when changing speed." description="Frame processing">
              <select value={settings.speedMaintainPitch ? 'smooth' : 'fast'} onChange={(e) => updateSetting('speedMaintainPitch', e.target.value === 'smooth')}>
                <option value="smooth">Smooth (maintain pitch, duplicate frames)</option>
                <option value="fast">Fast (drop/duplicate frames, no pitch shift)</option>
              </select>
            </OptionRow>

            <hr className="vf-divider" />

            {/* Rotate & Flip */}
            <h4 className="vf-subheading"><RotateCw size={14} /> Rotate & Flip</h4>
            <OptionRow label="Rotation" description="Rotate the video" fullWidth>
              <div className="vf-button-group">
                {[
                  { value: '', label: 'None' },
                  { value: '90cw', label: '90° CW' },
                  { value: '90ccw', label: '90° CCW' },
                  { value: '180', label: '180°' },
                ].map(o => (
                  <button key={o.value} type="button"
                    className={`vf-btn ${settings.rotate === o.value ? 'active' : ''}`}
                    onClick={() => updateSetting('rotate', o.value)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </OptionRow>
            <OptionRow label="Flip" description="Mirror the video" fullWidth>
              <div className="vf-button-group">
                <button type="button" className={`vf-btn ${settings.hflip ? 'active' : ''}`}
                  onClick={() => updateSetting('hflip', !settings.hflip)}>
                  <FlipHorizontal size={14} /> Horizontal
                </button>
                <button type="button" className={`vf-btn ${settings.vflip ? 'active' : ''}`}
                  onClick={() => updateSetting('vflip', !settings.vflip)}>
                  <FlipVertical size={14} /> Vertical
                </button>
              </div>
            </OptionRow>

            <hr className="vf-divider" />

            {/* Watermark */}
            <h4 className="vf-subheading"><Type size={14} /> Watermark</h4>
            <OptionRow label="Watermark Type" description="Add a text or image watermark">
              <select value={settings.watermarkType} onChange={(e) => updateSetting('watermarkType', e.target.value)}>
                <option value="none">None</option>
                <option value="text">Text Watermark</option>
                <option value="image">Image Watermark</option>
              </select>
            </OptionRow>
            {settings.watermarkType === 'text' && (
              <>
                <OptionRow label="Font Family" description="Choose a typeface for the text">
                  <select
                    value={settings.watermarkFont}
                    onChange={(e) => updateSetting('watermarkFont', e.target.value)}
                    className="select-input"
                  >
                    {availableFonts.length === 0 && <option value="">No fonts found in uploads/fonts...</option>}
                    {availableFonts.map(font => (
                      <option key={font} value={font}>
                        {font.replace(/\.[^/.]+$/, "")} {/* Removes the .ttf extension for a cleaner look */}
                      </option>
                    ))}
                  </select>
                </OptionRow>
                <OptionRow label="Watermark Text" description="Text to display">
                  <input type="text" className="input-full" value={settings.watermarkText}
                    onChange={(e) => updateSetting('watermarkText', e.target.value)} placeholder="My Watermark" />
                </OptionRow>
                <OptionRow label="Font Size" description="Text size in pixels">
                  <input type="number" className="input-inline" value={settings.watermarkFontSize}
                    onChange={(e) => updateSetting('watermarkFontSize', parseInt(e.target.value) || 24)} min="8" max="200" style={{ width: '80px' }} />
                </OptionRow>
                <OptionRow label="Color" description="Text color">
                  <input type="color" value={settings.watermarkColor}
                    onChange={(e) => updateSetting('watermarkColor', e.target.value)} style={{ width: '60px', height: '32px', padding: '2px' }} />
                </OptionRow>
              </>
            )}
            {settings.watermarkType === 'image' && (
              <OptionRow label="Watermark Image" description="Upload a PNG with transparency">
                <div className="watermark-upload-area">
                  <button type="button" className="btn-upload-watermark" onClick={() => watermarkInputRef.current?.click()}>
                    <Upload size={14} /> {watermarkImageFile ? watermarkImageFile.name : 'Choose Image'}
                  </button>
                  <input ref={watermarkInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setWatermarkImageFile(f); }} />
                  {watermarkImageFile && (
                    <button type="button" className="btn-watermark-remove" onClick={() => { setWatermarkImageFile(null); if (watermarkInputRef.current) watermarkInputRef.current.value = ''; }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </OptionRow>
            )}
            {settings.watermarkType !== 'none' && (
              <OptionRow label="Position" description="Where to place the watermark">
                <div className="watermark-position-matrix">
                  {[
                    { v: 'top-left', l: '↖' },
                    { v: 'top-middle', l: '↑' },
                    { v: 'top-right', l: '↗' },
                    { v: 'bottom-left', l: '↙' },
                    { v: 'bottom-middle', l: '↓' },
                    { v: 'bottom-right', l: '↘' },
                    { v: 'center', l: 'Center' }
                  ].map(o => (
                    <button
                      key={o.v}
                      type="button"
                      className={`vf-btn-sm position-grid-btn ${o.v} ${settings.watermarkPosition === o.v ? 'active' : ''}`}
                      onClick={() => updateSetting('watermarkPosition', o.v)}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </OptionRow>
            )}
            {settings.watermarkType !== 'none' && (
              <OptionRow label="Opacity" tooltip="Watermark transparency. 1.0 = fully visible, 0.0 = invisible." description="Transparency level">
                <div className="crf-slider-group">
                  <input type="range" min="0" max="1" step="0.05" value={settings.watermarkOpacity}
                    onChange={(e) => updateSetting('watermarkOpacity', parseFloat(e.target.value))} className="crf-slider" title="0% to 100%: Watermark transparency" />
                  <span className="crf-value">{Math.round(settings.watermarkOpacity * 100)}%</span>
                </div>
              </OptionRow>
            )}
          </ToggleSection>
        </div>
      )}

      {/* Tab: Tools */}
      {mediaInfo && !loadingInfo && !convertDone && activeTab === 'tools' && (
        <div className="conversion-options">
          <div className="options-title-row">
            <h3 className="options-title"><Scissors size={18} /> Tools</h3>
          </div>
          <ToggleSection icon={BarChart3} title="Target File Size" description="Calculate the required bitrate to hit a specific output file size. Leave empty or set to 0 for auto/default quality.">
            <OptionRow label="Target Size (MB)" tooltip="Enter your desired output file size in megabytes. Leave empty or 0 for auto/default quality (uses CRF-based encoding)." description="Desired output size">
              <div className="target-size-group">
                <input type="number" className="input-inline" value={targetSize}
                  onChange={(e) => setTargetSize(e.target.value)} min="0" max="99999" placeholder="empty/0 = auto" style={{ width: '100px' }} />
                <span className="input-suffix">MB</span>
                <button className="btn-calculate-size" onClick={calculateTargetSize} disabled={!mediaInfo?.duration}>
                  Calculate
                </button>
              </div>
            </OptionRow>
            {targetSizeResult && (
              <div className="target-size-result">
                <div className="tsr-row">
                  <span className="tsr-label">Required video bitrate:</span>
                  <span className="tsr-value">{targetSizeResult.videoBitrateKbps.toLocaleString()} kb/s</span>
                </div>
                <div className="tsr-row">
                  <span className="tsr-label">Suggested CRF:</span>
                  <span className="tsr-value tsr-crf">{targetSizeResult.suggestedCrf}</span>
                </div>
                <div className="tsr-row">
                  <span className="tsr-label">Estimated audio size:</span>
                  <span className="tsr-value">~{targetSizeResult.estimatedAudioSize} MB</span>
                </div>
                <p className="tsr-hint">
                  Set Video Bitrate to <strong>{targetSizeResult.videoBitrateKbps}k</strong> or CRF to <strong>{targetSizeResult.suggestedCrf}</strong> and enable 2-Pass for best results.
                </p>
              </div>
            )}
          </ToggleSection>

          {/* Scene Detection */}
          <ToggleSection icon={Sun} title="Scene Detection" description="Detect scene changes (chapter points) in your video using FFmpeg.">
            <OptionRow label="Scene Threshold" description="Sensitivity (0.1 = few scenes, 0.6 = many scenes)" fullWidth>
              <div className="scene-detect-area">
                <button className="btn-detect-scenes" onClick={detectScenes} disabled={analyzingScenes}>
                  {analyzingScenes ? <><Loader2 size={14} className="spin" /> Analyzing...</> : <>Detect Scenes</>}
                </button>
                {scenes && scenes.length > 0 && (
                  <span className="scene-count">{scenes.length} scene{scenes.length !== 1 ? 's' : ''} found</span>
                )}
                {scenes && scenes.length === 0 && (
                  <span className="scene-count none">No scene changes detected</span>
                )}
              </div>
            </OptionRow>
            {scenes && scenes.length > 0 && (
              <div className="scene-list">
                {scenes.slice(0, 30).map((s, i) => (
                  <div key={i} className="scene-item">
                    <span className="scene-idx">#{i + 1}</span>
                    <span className="scene-time">{s.time}</span>
                    <button className="scene-copy-btn" onClick={() => navigator.clipboard.writeText(`-ss ${s.time}`)}
                      title="Copy -ss timestamp"><Copy size={11} /></button>
                  </div>
                ))}
                {scenes.length > 30 && <div className="scene-more">...and {scenes.length - 30} more</div>}
              </div>
            )}
          </ToggleSection>

          {/* Concatenation */}
          <ToggleSection icon={Merge} title="Concatenation" description="Join multiple video files together. Supports stream copy (fast) or re-encode.">
            <OptionRow label="Source Files" description="Add files to merge. Order matters." fullWidth>
              <div className="concat-area">
                <div className="concat-drop" onClick={() => concatInputRef.current?.click()}>
                  <Upload size={18} />
                  <span>Click to add files</span>
                  <input ref={concatInputRef} type="file" accept="video/*,audio/*" multiple style={{ display: 'none' }} onChange={handleConcatAdd} />
                </div>
              </div>
            </OptionRow>
            {concatFiles.length > 0 && (
              <OptionRow fullWidth>
                <div className="concat-list">
                  {concatFiles.map((f, i) => (
                    <div key={i} className="concat-item">
                      <span className="concat-idx">{i + 1}</span>
                      <span className="concat-name">{f.name}</span>
                      <span className="concat-size">{formatBytes(f.size)}</span>
                      <div className="concat-actions">
                        <button className="concat-move" onClick={() => handleConcatMove(i, -1)} disabled={i === 0} title="Move up"><span>↑</span></button>
                        <button className="concat-move" onClick={() => handleConcatMove(i, 1)} disabled={i === concatFiles.length - 1} title="Move down"><span>↓</span></button>
                        <button className="concat-remove" onClick={() => handleConcatRemove(i)} title="Remove"><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </OptionRow>
            )}
            {concatFiles.length >= 2 && (
              <OptionRow label="Mode" description="Stream copy is instant. Re-encode applies current settings.">
                <label className="toggle-label">
                  <input type="checkbox" checked={concatReEncode} onChange={(e) => setConcatReEncode(e.target.checked)} />
                  <span className="toggle-switch"></span>
                  {concatReEncode ? 'Re-encode' : 'Stream Copy (fast)'}
                </label>
              </OptionRow>
            )}
            {concatFiles.length >= 2 && (
              <div className="concat-action">
                <button className="btn-concat-start" onClick={handleConcatStart} disabled={concatConverting}>
                  {concatConverting ? <><Loader2 size={16} className="spin" /> Merging...</> : <><Merge size={16} /> Merge {concatFiles.length} Files</>}
                </button>
              </div>
            )}
            {concatDone && !concatDone.error && (
              <div className="concat-done">
                <CheckCircle size={16} /> Merged: {concatDone.filename} ({concatDone.size_formatted})
                <button className="btn-download-cb" onClick={() => { const a = document.createElement('a'); a.href = `./api/index.php?action=ffmpeg_download&token=${concatDone.download_token}`; a.download = concatDone.filename; a.click(); }}>
                  <Download size={14} /> Download
                </button>
              </div>
            )}
            {concatDone?.error && (
              <div className="concat-done error">
                <AlertCircle size={16} /> {concatDone.error}
              </div>
            )}
          </ToggleSection>

          {/* Splitter */}
          <ToggleSection icon={Split} title="Splitter" description="Split your video into multiple segments by specifying time ranges.">
            <OptionRow label="Segments" description="Define start/end times for each segment. Leave end empty for 'to end'." fullWidth>
              <div className="split-segments">
                {splitSegments.map((seg, i) => (
                  <div key={i} className="split-segment-row">
                    <span className="split-idx">{i + 1}</span>
                    <input type="text" className="split-input" placeholder="Start (00:00)" value={seg.start}
                      onChange={(e) => handleSplitUpdateSegment(i, 'start', e.target.value)} />
                    <span className="split-to">→</span>
                    <input type="text" className="split-input" placeholder="End (optional)" value={seg.end}
                      onChange={(e) => handleSplitUpdateSegment(i, 'end', e.target.value)} />
                    <input type="text" className="split-label-input" placeholder="Label" value={seg.label}
                      onChange={(e) => handleSplitUpdateSegment(i, 'label', e.target.value)} />
                    <button className="split-remove-btn" onClick={() => handleSplitRemoveSegment(i)} disabled={splitSegments.length <= 1}><X size={14} /></button>
                  </div>
                ))}
              </div>
            </OptionRow>
            <div className="split-actions">
              <button className="btn-split-add" onClick={handleSplitAddSegment}>+ Add Segment</button>
              {scenes && scenes.length > 0 && (
                <button className="btn-split-scenes" onClick={handleSplitFromScenes}>Use Scenes</button>
              )}
            </div>
            {splitSegments.some(s => s.start) && (
              <OptionRow fullWidth>
                <button className="btn-split-start" onClick={handleSplitStart} disabled={splitConverting}>
                  {splitConverting ? <><Loader2 size={16} className="spin" /> Splitting...</> : <><Split size={16} /> Split into {splitSegments.filter(s => s.start).length} Segments</>}
                </button>
              </OptionRow>
            )}
            {splitResults.length > 0 && (
              <div className="split-results">
                {splitResults.map((r, i) => (
                  <div key={i} className={`split-result-item ${r.error ? 'error' : ''}`}>
                    {r.error ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                    <span>{r.label}</span>
                    {!r.error && <span className="split-result-size">{r.size_formatted}</span>}
                    {!r.error && (
                      <button className="btn-download-cb" onClick={() => { const a = document.createElement('a'); a.href = `./api/index.php?action=ffmpeg_download&token=${r.download_token}`; a.download = r.filename; a.click(); }}>
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ToggleSection>

          {/* Subtitles */}
          {subtitleStreams.length > 0 && (
            <Section icon={Subtitles} title="Subtitles" description="Handle subtitle streams." defaultOpen={false}>
              <OptionRow label="Subtitle Mode" tooltip="How to handle subtitles." description="Subtitle handling">
                <select value={settings.subtitleMode} onChange={(e) => updateSetting('subtitleMode', e.target.value)}>
                  <option value="none">None (discard subtitles)</option>
                  <option value="copy">Copy subtitles to output</option>
                  <option value="burn">Burn subtitles into video (hardcode)</option>
                </select>
              </OptionRow>
              {settings.subtitleMode !== 'none' && (
                <OptionRow label="Subtitle Stream" tooltip="Which subtitle track to use." description="Select track">
                  <select value={settings.subtitleStream} onChange={(e) => updateSetting('subtitleStream', parseInt(e.target.value))}>
                    {subtitleStreams.map((s, i) => (
                      <option key={s.index} value={i}>#{s.index} {s.language?.toUpperCase() || 'Unknown'}{s.title ? ` - ${s.title}` : ''}</option>
                    ))}
                  </select>
                </OptionRow>
              )}
            </Section>
          )}
        </div>
      )}

      {/* Tab: Convert */}
      {mediaInfo && !loadingInfo && !convertDone && activeTab === 'convert' && (
        <div className="conversion-options">
          <div className="options-title-row">
            <h3 className="options-title"><Wand2 size={18} /> Convert</h3>
          </div>
          {/* Command Preview */}
          {mediaInfo && (
            <div className="command-preview">
              <div className="command-preview-header">
                <span className="command-preview-title"><Settings size={14} /> FFmpeg Command Preview</span>
                <button className="btn-copy-cmd" onClick={() => { navigator.clipboard.writeText(buildCommandPreview()); dispatch({ type: 'SET_COMMAND_COPIED', payload: true }); setTimeout(() => dispatch({ type: 'SET_COMMAND_COPIED', payload: false }), 2000); }}>
                  {state.commandCopied ? <Check size={14} /> : <Copy size={14} />}
                  {state.commandCopied ? ' Copied!' : ' Copy'}
                </button>
              </div>
              <pre className="command-preview-code"><code>{buildCommandPreview()}</code></pre>
            </div>
          )}

          {/* Convert Button */}
          <div className="convert-action">
            <button className={`btn-convert ${converting ? 'converting' : ''}`} onClick={handleConvert} disabled={converting}>
              {converting ? <><Loader2 size={20} className="spin" /> Converting... {convertProgress > 0 ? `${convertProgress}%` : ''}</> : <><Wand2 size={20} /> Start Conversion</>}
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
              {convertLog.slice(-5).map((msg, i) => <div key={i} className="log-line">{msg}</div>)}
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

          {/* Original vs Output comparison */}
          {mediaInfo && (
            <div className="comparison-table-wrap">
              <h4 className="comparison-title"><BarChart3 size={16} /> Original vs Output</h4>
              <table className="comparison-table">
                <thead>
                  <tr><th></th><th>Original</th><th>Output</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="cmp-label">Size</td>
                    <td>{formatBytes(mediaInfo.size)}</td>
                    <td>{convertDone.size_formatted}</td>
                  </tr>
                  <tr>
                    <td className="cmp-label">Bitrate</td>
                    <td>{formatBitrate(mediaInfo.bit_rate)}</td>
                    <td>{convertBitrate || '-'}</td>
                  </tr>
                  <tr>
                    <td className="cmp-label">Format</td>
                    <td>{mediaInfo.format_name?.toUpperCase()}</td>
                    <td>{settings.container.toUpperCase()}</td>
                  </tr>
                  {videoStreams[0] && (
                    <tr>
                      <td className="cmp-label">Video</td>
                      <td>{videoStreams[0].codec} {videoStreams[0].width}x{videoStreams[0].height}</td>
                      <td>{settings.videoCodec !== 'copy' ? settings.videoCodec.toUpperCase() : videoStreams[0].codec} {settings.resolution !== 'original' ? settings.resolution + 'p' : videoStreams[0].width + 'x' + videoStreams[0].height}</td>
                    </tr>
                  )}
                  {audioStreams[0] && (
                    <tr>
                      <td className="cmp-label">Audio</td>
                      <td>{audioStreams[0].codec} {formatBitrate(audioStreams[0].bitrate)}</td>
                      <td>{settings.audioCodec !== 'copy' ? settings.audioCodec.toUpperCase() : audioStreams[0].codec}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="cmp-label">Duration</td>
                    <td>{formatDuration(mediaInfo.duration)}</td>
                    <td>{convertTime || formatDuration(mediaInfo.duration)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

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

      {/* Batch Queue Display */}
      {queue.length > 0 && (
        <div className="batch-queue-panel">
          <div className="batch-queue-header">
            <span className="batch-queue-title"><List size={16} /> Batch Queue ({queue.length})</span>
            <div className="batch-queue-actions">
              <button className="btn-batch-start" onClick={processQueue} disabled={converting} title="Process all pending items">
                <Play size={14} /> Process All
              </button>
              <button className="btn-batch-clear" onClick={() => dispatch({ type: 'CLEAR_QUEUE' })} title="Clear queue">
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
          <div className="batch-queue-list">
            {queue.map((item, idx) => (
              <div key={idx} className={`batch-queue-item status-${item.status} ${dragIndex === idx ? 'dragging' : ''}`}
                draggable={item.status !== 'converting'}
                onDragStart={handleQueueDragStart(idx)}
                onDragOver={handleQueueDragOver}
                onDrop={handleQueueDrop(idx)}>
                <div className="bqi-grip"><GripVertical size={14} /></div>
                <div className="bqi-info">
                  <span className="bqi-name">{item.name}</span>
                  <span className="bqi-size">{formatBytes(item.size)}</span>
                </div>
                <div className="bqi-status">
                  {item.status === 'pending' && <span className="bqi-badge pending">Pending</span>}
                  {item.status === 'converting' && (
                    <div className="bqi-progress">
                      <Loader2 size={12} className="spin" />
                      <div className="bqi-progress-bar"><div className="bqi-progress-fill" style={{ width: `${item.progress || 0}%` }} /></div>
                      <span>{item.progress || 0}%</span>
                    </div>
                  )}
                  {item.status === 'done' && <span className="bqi-badge done"><CheckCircle size={12} /> Done</span>}
                  {item.status === 'error' && <span className="bqi-badge error"><AlertCircle size={12} /> {item.error || 'Error'}</span>}
                </div>
                <button className="bqi-remove" onClick={() => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: idx })} disabled={item.status === 'converting'}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Convert History */}
      {history.length > 0 && (
        <div className="converter-history">
          <div className="history-header">
            <Clock size={16} />
            <span className="history-title">Convert History ({history.length})</span>
          </div>
          <div className="history-list">
            {history.map((entry, i) => (
              <div key={i} className="history-item">
                <div className="history-item-content">
                  <div className="history-item-main">
                    <div className="history-flow">
                      <span className="history-flow-source" title={entry.originalName || "Original source"}>
                        {entry.originalName || "Original source"}
                      </span>
                      <span className="history-flow-arrow">➔</span>
                      <span className="history-flow-dest" title={entry.filename}>
                        {entry.filename}
                      </span>
                    </div>
                    <div className="history-details">
                      <span className="history-detail-badge">{entry.container.toUpperCase()}</span>
                      {entry.videoCodec && entry.videoCodec !== 'copy' && <span className="history-detail-badge">{entry.videoCodec.toUpperCase()}</span>}
                      <span>{entry.size}</span>
                      <span className="history-dot">&middot;</span>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>
                  <div className="history-item-actions">
                    {entry.outputPath && (
                      <button className="history-action-btn btn-open" onClick={() => handleOpenLocalFile(entry.outputPath)} title="Open output file locally">
                        <ExternalLink size={13} />
                        <span>Open</span>
                      </button>
                    )}
                    {entry.downloadToken && (
                      <button className="history-action-btn btn-download" onClick={() => handleDownloadFromHistory(entry.downloadToken, entry.filename)} title="Download file via browser">
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    )}
                    <button className="history-action-btn btn-delete" onClick={() => handleDeleteHistoryItem(i)} title="Remove from history">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!mediaInfo && !loadingInfo && !fileError && !convertDone && (
        <div className="converter-empty">
          <Wand2 size={64} className="empty-icon" />
          <h2>Media Converter</h2>
          <p>Convert video and audio files with FFmpeg</p>
          <p className="empty-hint">Supports MP4, MKV, WebM, AVI, MOV, MP3, FLAC, WAV and more</p>
        </div>
      )}
    </div>
  );
}
