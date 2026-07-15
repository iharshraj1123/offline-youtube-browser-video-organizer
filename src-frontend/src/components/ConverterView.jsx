import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import {
  Wand2, FileVideo, Upload, X, Loader2, CheckCircle, AlertCircle,
  RefreshCw, Download, Folder, Clock, Video, Music, Film,
  Settings, HelpCircle, Play, Image, Disc, Radio, Timer, Subtitles,
  Scissors, Copy, Check, Save, Trash2, List, FileUp,
  Palette, Gauge, RotateCw, FlipHorizontal, FlipVertical, Type, Sun
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
  'default': { label: 'Default Settings',
    settings: { container: 'mp4', videoCodec: 'copy', audioCodec: 'copy', crf: 23, videoBitrate: 'auto', resolution: 'original', framerate: 'original', preset: 'medium', tune: '', profile: '', pixFmt: '', audioBitrate: 'auto', sampleRate: 'original', channels: 'original', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' } },
  'web_h264': { label: 'Web (H.264)',
    settings: { container: 'mp4', videoCodec: 'h264', audioCodec: 'aac', crf: 23, videoBitrate: 'auto', resolution: '1080', framerate: 'original', preset: 'medium', tune: '', profile: 'high', pixFmt: 'yuv420p', audioBitrate: '128k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' } },
  'web_h265': { label: 'Web (H.265/HEVC)',
    settings: { container: 'mp4', videoCodec: 'h265', audioCodec: 'aac', crf: 28, videoBitrate: 'auto', resolution: '1080', framerate: 'original', preset: 'medium', tune: '', profile: 'main', pixFmt: 'yuv420p', audioBitrate: '128k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' } },
  'compatible': { label: 'Max Compatibility',
    settings: { container: 'mp4', videoCodec: 'h264', audioCodec: 'aac', crf: 23, videoBitrate: 'auto', resolution: '720', framerate: '30', preset: 'medium', tune: '', profile: 'baseline', pixFmt: 'yuv420p', audioBitrate: '128k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' } },
  'youtube': { label: 'YouTube Ready',
    settings: { container: 'mp4', videoCodec: 'h264', audioCodec: 'aac', crf: 23, videoBitrate: 'auto', resolution: '1080', framerate: 'original', preset: 'slow', tune: 'film', profile: 'high', pixFmt: 'yuv420p', audioBitrate: '192k', sampleRate: '48000', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' } },
  'discord': { label: 'Discord/Twitter',
    settings: { container: 'mp4', videoCodec: 'h264', audioCodec: 'aac', crf: 28, videoBitrate: 'auto', resolution: '720', framerate: '30', preset: 'fast', tune: '', profile: 'main', pixFmt: 'yuv420p', audioBitrate: '128k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' } },
  'small': { label: 'Smallest Size',
    settings: { container: 'mp4', videoCodec: 'h265', audioCodec: 'aac', crf: 35, videoBitrate: 'auto', resolution: '480', framerate: '24', preset: 'veryslow', tune: '', profile: 'main', pixFmt: 'yuv420p', audioBitrate: '64k', sampleRate: '22050', channels: 'mono', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' } },
  'audio': { label: 'Audio Only (MP3)',
    settings: { container: 'mp3', videoCodec: 'copy', audioCodec: 'mp3', crf: 23, videoBitrate: 'auto', resolution: 'original', framerate: 'original', preset: 'medium', tune: '', profile: '', pixFmt: '', audioBitrate: '192k', sampleRate: '44100', channels: 'stereo', volume: '0', startTime: '', duration: '', cropW: '', cropH: '', cropX: '', cropY: '', subtitleMode: 'none', subtitleStream: 0, deinterlace: false, hwaccel: 'none', twoPass: false, threads: '0', metadataPreserve: true, customArgs: '' } },
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
    watermarkType: 'none', watermarkPosition: 'se', watermarkOpacity: 1,
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
    case 'UPDATE_QUEUE_ITEM':
      return { ...state, queue: state.queue.map((item, i) => i === action.payload.index ? { ...item, ...action.payload.data } : item) };
    case 'SET_COMMAND_COPIED':
      return { ...state, commandCopied: action.payload };
    default:
      return state;
  }
}

// ---- Main Component ----

export function ConverterView() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fileInputRef = useRef(null);
  const batchInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const abortRef = useRef(null);
  const [presetName, setPresetName] = React.useState('');
  const [showSavePreset, setShowSavePreset] = React.useState(false);
  const [watermarkImageFile, setWatermarkImageFile] = React.useState(null);
  const watermarkInputRef = useRef(null);

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

  useEffect(() => {
    checkFfmpeg();
  }, []);

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
    try { await fetch('./api/index.php?action=ffmpeg_cleanup'); } catch {}
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

  const handleBatchSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const fileData = { file, name: file.name, size: file.size, status: 'pending', progress: 0, error: '' };
      dispatch({ type: 'ADD_TO_QUEUE', payload: fileData });
    }
  };

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

  const handleConvert = async () => {
    dispatch({ type: 'SET_CONVERTING', payload: true });
    dispatch({ type: 'UPDATE_PROGRESS', payload: { convertProgress: 0, convertTime: '', convertFps: '', convertSpeed: '', convertBitrate: '', convertEta: '', convertStatus: 'Starting conversion...' } });
    dispatch({ type: 'CLEAR_LOG' });
    dispatch({ type: 'SET_CONVERT_DONE', payload: null });

    await cleanupTemp();

    const options = {
      container: settings.container,
      video_codec: settings.videoCodec,
      audio_codec: settings.audioCodec,
      crf: settings.videoCodec !== 'copy' ? settings.crf : '',
      video_bitrate: (settings.videoCodec !== 'copy' && settings.videoBitrate !== 'auto') ? settings.videoBitrate : '',
      resolution: settings.resolution,
      framerate: settings.framerate,
      preset: settings.videoCodec !== 'copy' ? settings.preset : '',
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
      deinterlace: settings.deinterlace, hwaccel: settings.hwaccel,
      two_pass: settings.twoPass, threads: settings.threads,
      metadata_preserve: settings.metadataPreserve, custom_args: settings.customArgs,
      color_brightness: settings.colorBrightness, color_contrast: settings.colorContrast,
      color_saturation: settings.colorSaturation, color_gamma: settings.colorGamma,
      speed: settings.speed, speed_maintain_pitch: settings.speedMaintainPitch,
      rotate: settings.rotate, hflip: settings.hflip, vflip: settings.vflip,
      watermark_type: settings.watermarkType, watermark_position: settings.watermarkPosition,
      watermark_opacity: settings.watermarkOpacity, watermark_text: settings.watermarkText,
      watermark_font_size: settings.watermarkFontSize, watermark_color: settings.watermarkColor,
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
            } catch {}
          }
        }
      }
    } catch (e) {
      dispatch({ type: 'UPDATE_PROGRESS', payload: { convertStatus: 'Connection error' } });
      dispatch({ type: 'ADD_LOG', payload: 'Connection error: ' + e.message });
    }

    dispatch({ type: 'SET_CONVERTING', payload: false });
  };

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

  const handleReset = async () => {
    await cleanupTemp();
    setWatermarkImageFile(null);
    dispatch({ type: 'SET_FILE', payload: null });
    dispatch({ type: 'SET_MEDIA_INFO', payload: null });
    dispatch({ type: 'SET_FILE_PATH', payload: '' });
    dispatch({ type: 'SET_FILE_ERROR', payload: '' });
    dispatch({ type: 'SET_CONVERT_DONE', payload: null });
    dispatch({ type: 'UPDATE_PROGRESS', payload: { convertProgress: 0, convertStatus: '' } });
  };

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
    const inExt = mediaInfo?.format_name || 'file';
    let cmd = `ffmpeg -y -i input.${inExt}`;

    const vfParts = [];
    const afParts = [];

    if (s.hwaccel && s.hwaccel !== 'none') cmd += ` -hwaccel ${s.hwaccel}`;

    if (s.videoCodec === 'copy') {
      cmd += ' -c:v copy';
    } else {
      const vcMap = { 'h264': 'libx264', 'h265': 'libx265', 'vp9': 'libvpx-vp9', 'av1': 'libaom-av1', 'mpeg4': 'mpeg4', 'vp8': 'libvpx' };
      cmd += ` -c:v ${vcMap[s.videoCodec] || s.videoCodec}`;
      if (s.crf !== '') cmd += ` -crf ${s.crf}`;
      if (s.videoBitrate !== 'auto') cmd += ` -b:v ${s.videoBitrate}`;
      if (s.framerate !== 'original') cmd += ` -r ${s.framerate}`;
      if (s.preset) cmd += ` -preset ${s.preset}`;
      if (s.tune) cmd += ` -tune ${s.tune}`;
      if (s.profile) cmd += ` -profile:v ${s.profile}`;
      if (s.pixFmt) cmd += ` -pix_fmt ${s.pixFmt}`;
    }

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
      const pos = { nw: '10:10', ne: 'W-w-10:10', sw: '10:H-h-10', center: '(W-w)/2:(H-h)/2', se: 'W-w-10:H-h-10' }[s.watermarkPosition] || 'W-w-10:10';
      vfParts.push(`drawtext=text='${s.watermarkText}':fontsize=${s.watermarkFontSize}:fontcolor=${s.watermarkColor}@${s.watermarkOpacity}:${pos}`);
    }
    if (s.watermarkType === 'image') cmd = `ffmpeg -y -i input.${inExt} -i watermark.png`;

    if (s.subtitleMode === 'copy') cmd += ' -c:s copy';

    if (vfParts.length) cmd += ' -vf "' + vfParts.join(',') + '"';

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
  const processQueue = async () => {
    await cleanupTemp();
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'done' || item.status === 'error') continue;
      dispatch({ type: 'UPDATE_QUEUE_ITEM', payload: { index: i, data: { status: 'converting' } } });

      const options = {
        container: settings.container,
        video_codec: settings.videoCodec,
        audio_codec: settings.audioCodec,
        crf: settings.videoCodec !== 'copy' ? settings.crf : '',
        video_bitrate: (settings.videoCodec !== 'copy' && settings.videoBitrate !== 'auto') ? settings.videoBitrate : '',
        resolution: settings.resolution, framerate: settings.framerate,
        preset: settings.videoCodec !== 'copy' ? settings.preset : '',
        tune: settings.tune, profile: settings.profile, pix_fmt: settings.pixFmt,
        audio_bitrate: (settings.audioCodec !== 'copy' && settings.audioBitrate !== 'auto') ? settings.audioBitrate : '',
        sample_rate: settings.sampleRate, channels: settings.channels, volume: settings.volume,
        start_time: settings.startTime, duration: settings.duration,
        crop_w: settings.cropW, crop_h: settings.cropH, crop_x: settings.cropX, crop_y: settings.cropY,
        subtitle_mode: settings.subtitleMode, subtitle_stream: settings.subtitleStream,
        deinterlace: settings.deinterlace, hwaccel: settings.hwaccel,
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
              } catch {}
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

          {/* Batch Queue Drop Area */}
          <div className="batch-queue-area">
            <div className="batch-drop-zone" onClick={() => batchInputRef.current?.click()}>
              <FileUp size={20} />
              <span>Drop multiple files here or click to batch add</span>
              <input ref={batchInputRef} type="file" accept="video/*,audio/*,image/gif" multiple style={{ display: 'none' }} onChange={handleBatchSelect} />
            </div>
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

      {/* Quick Presets */}
      {mediaInfo && !loadingInfo && !convertDone && (
        <div className="quick-presets-bar">
          <div className="quick-presets-inner">
            <label className="quick-presets-label"><Wand2 size={16} /> Quick Preset:</label>
            <select className="quick-presets-select" defaultValue="" onChange={(e) => { if (e.target.value) handleQuickPreset(e.target.value); }}>
              <option value="" disabled>Choose a preset...</option>
              {Object.entries(QUICK_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>{preset.label}</option>
              ))}
            </select>
          </div>
          {Object.keys(savedPresets).length > 0 && (
            <div className="quick-presets-inner">
              <label className="quick-presets-label"><Save size={16} /> Saved:</label>
              <select className="quick-presets-select" defaultValue="" onChange={(e) => { if (e.target.value) handleApplySavedPreset(e.target.value); }}>
                <option value="" disabled>Load saved preset...</option>
                {Object.keys(savedPresets).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}
          <button className="btn-save-preset" onClick={() => setShowSavePreset(true)} title="Save current settings as preset">
            <Save size={14} /> Save
          </button>
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

      {/* Conversion Options */}
      {mediaInfo && !loadingInfo && !convertDone && (
        <div className="conversion-options">
          <h3 className="options-title"><Wand2 size={20} /> Conversion Options</h3>

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
                        onChange={(e) => updateSetting('crf', e.target.value)} className="crf-slider" />
                      <span className="crf-value">{settings.crf}</span>
                    </div>
                  </OptionRow>
                  <OptionRow label="Video Bitrate" tooltip="Target bitrate. Leave 'Auto' to use CRF. Format: 1000k, 5M." description="Set a specific bitrate target">
                    <div className="bitrate-input-group">
                      <select value={settings.videoBitrate === 'auto' ? 'auto' : 'custom'}
                        onChange={(e) => updateSetting('videoBitrate', e.target.value === 'auto' ? 'auto' : '1000k')}>
                        <option value="auto">Auto (use CRF)</option>
                        <option value="custom">Custom</option>
                      </select>
                      {settings.videoBitrate !== 'auto' && (
                        <input type="text" className="input-inline" value={settings.videoBitrate}
                          onChange={(e) => updateSetting('videoBitrate', e.target.value)} placeholder="1000k, 5M..." />
                      )}
                    </div>
                  </OptionRow>
                  <OptionRow label="Resolution" tooltip="Output resolution. Uses height (e.g., 1080 = 1920x1080)." description="Lower resolution = smaller file">
                    <select value={settings.resolution} onChange={(e) => updateSetting('resolution', e.target.value)}>
                      {RESOLUTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
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
                  <OptionRow label="Tune" tooltip="Optimize encoding for specific content types." description="Tune for your content type">
                    <select value={settings.tune} onChange={(e) => updateSetting('tune', e.target.value)}>
                      {TUNE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </OptionRow>
                  <OptionRow label="H.264/H.265 Profile" tooltip="Constraint on encoding features for device compatibility." description="Compatibility level">
                    <select value={settings.profile} onChange={(e) => updateSetting('profile', e.target.value)}>
                      {PROFILES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </OptionRow>
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
                  {FPS_OPTIONS.filter(f => ['original','10','15','20','24','30'].includes(f.value)).map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </OptionRow>
              <OptionRow label="Resolution" tooltip="GIFs are large. Lower resolution helps." description="Output size">
                <select value={settings.resolution} onChange={(e) => updateSetting('resolution', e.target.value)}>
                  {RESOLUTIONS.filter(r => ['original','720','540','480','360'].includes(r.value)).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
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
                        onChange={(e) => updateSetting('volume', e.target.value)} className="crf-slider" />
                      <span className="crf-value">{settings.volume > 0 ? '+' : ''}{settings.volume} dB</span>
                    </div>
                  </OptionRow>
                </>
              )}
            </Section>
          )}

          {/* Visual Filters */}
          <ToggleSection icon={Palette} title="Visual Filters" description="Apply color correction, watermarks, speed changes, and rotation effects.">
            {/* Color Correction */}
            <h4 className="vf-subheading"><Gauge size={14} /> Color Correction</h4>
            <OptionRow label="Brightness" tooltip="Adjust image brightness. Negative = darker, positive = brighter." description="Image brightness">
              <div className="crf-slider-group">
                <input type="range" min="-1" max="1" step="0.05" value={settings.colorBrightness}
                  onChange={(e) => updateSetting('colorBrightness', parseFloat(e.target.value))} className="crf-slider" />
                <span className="crf-value">{settings.colorBrightness > 0 ? '+' : ''}{settings.colorBrightness}</span>
              </div>
            </OptionRow>
            <OptionRow label="Contrast" tooltip="Adjust image contrast. 1.0 is normal. Higher = more contrast." description="Image contrast">
              <div className="crf-slider-group">
                <input type="range" min="0.1" max="2.0" step="0.05" value={settings.colorContrast}
                  onChange={(e) => updateSetting('colorContrast', parseFloat(e.target.value))} className="crf-slider" />
                <span className="crf-value">{settings.colorContrast.toFixed(2)}</span>
              </div>
            </OptionRow>
            <OptionRow label="Saturation" tooltip="Color intensity. 1.0 is normal. 0 = grayscale." description="Color saturation">
              <div className="crf-slider-group">
                <input type="range" min="0" max="3" step="0.05" value={settings.colorSaturation}
                  onChange={(e) => updateSetting('colorSaturation', parseFloat(e.target.value))} className="crf-slider" />
                <span className="crf-value">{settings.colorSaturation.toFixed(2)}</span>
              </div>
            </OptionRow>
            <OptionRow label="Gamma" tooltip="Adjust mid-tone brightness. 1.0 is normal." description="Gamma correction">
              <div className="crf-slider-group">
                <input type="range" min="0.1" max="2.0" step="0.05" value={settings.colorGamma}
                  onChange={(e) => updateSetting('colorGamma', parseFloat(e.target.value))} className="crf-slider" />
                <span className="crf-value">{settings.colorGamma.toFixed(2)}</span>
              </div>
            </OptionRow>

            <hr className="vf-divider" />

            {/* Speed */}
            <h4 className="vf-subheading"><Sun size={14} /> Speed Change</h4>
            <OptionRow label="Speed" tooltip="Change playback speed. 1.0 = normal, 2.0 = double speed, 0.5 = half speed." description="Playback rate">
              <div className="crf-slider-group">
                <input type="range" min="0.25" max="4" step="0.05" value={settings.speed}
                  onChange={(e) => updateSetting('speed', parseFloat(e.target.value))} className="crf-slider" />
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
                <div className="vf-button-grid">
                  {[{ v: 'nw', l: 'NW' }, { v: 'ne', l: 'NE' }, { v: 'center', l: 'Center' }, { v: 'sw', l: 'SW' }, { v: 'se', l: 'SE' }].map(o => (
                    <button key={o.v} type="button" className={`vf-btn-sm ${settings.watermarkPosition === o.v ? 'active' : ''}`}
                      onClick={() => updateSetting('watermarkPosition', o.v)}>{o.l}</button>
                  ))}
                </div>
              </OptionRow>
            )}
            {settings.watermarkType !== 'none' && (
              <OptionRow label="Opacity" tooltip="Watermark transparency. 1.0 = fully visible, 0.0 = invisible." description="Transparency level">
                <div className="crf-slider-group">
                  <input type="range" min="0" max="1" step="0.05" value={settings.watermarkOpacity}
                    onChange={(e) => updateSetting('watermarkOpacity', parseFloat(e.target.value))} className="crf-slider" />
                  <span className="crf-value">{Math.round(settings.watermarkOpacity * 100)}%</span>
                </div>
              </OptionRow>
            )}
          </ToggleSection>

          {/* Trim & Crop */}
          <ToggleSection icon={Scissors} title="Trim & Crop" description="Cut a segment and/or crop the video frame.">
            <OptionRow label="Start Time" tooltip="Start trimming from this time. Format: HH:MM:SS or seconds." description="Where to begin">
              <input type="text" className="input-full" value={settings.startTime}
                onChange={(e) => updateSetting('startTime', e.target.value)} placeholder="00:00:00 or 90 (seconds)" />
            </OptionRow>
            <OptionRow label="Duration" tooltip="Length of output. Leave empty to trim to end." description="How long to keep">
              <input type="text" className="input-full" value={settings.duration}
                onChange={(e) => updateSetting('duration', e.target.value)} placeholder="00:05:00 or 300 (seconds)" />
            </OptionRow>
            <OptionRow label="Crop Width" tooltip="Width of the cropped area in pixels." description="Crop region width">
              <input type="number" className="input-inline" value={settings.cropW}
                onChange={(e) => updateSetting('cropW', e.target.value)} min="0" max="7680" placeholder="e.g. 1920" style={{ width: '100px' }} />
            </OptionRow>
            <OptionRow label="Crop Height" tooltip="Height of the cropped area in pixels." description="Crop region height">
              <input type="number" className="input-inline" value={settings.cropH}
                onChange={(e) => updateSetting('cropH', e.target.value)} min="0" max="4320" placeholder="e.g. 1080" style={{ width: '100px' }} />
            </OptionRow>
            <OptionRow label="Crop X Offset" tooltip="X position (from left) to start cropping." description="Crop X origin">
              <input type="number" className="input-inline" value={settings.cropX}
                onChange={(e) => updateSetting('cropX', e.target.value)} min="0" placeholder="0" style={{ width: '100px' }} />
            </OptionRow>
            <OptionRow label="Crop Y Offset" tooltip="Y position (from top) to start cropping." description="Crop Y origin">
              <input type="number" className="input-inline" value={settings.cropY}
                onChange={(e) => updateSetting('cropY', e.target.value)} min="0" placeholder="0" style={{ width: '100px' }} />
            </OptionRow>
            <OptionRow label="Deinterlace" tooltip="Convert interlaced video to progressive." description="Fix interlacing">
              <label className="toggle-label">
                <input type="checkbox" checked={settings.deinterlace} onChange={(e) => updateSetting('deinterlace', e.target.checked)} />
                <span className="toggle-switch"></span>
                {settings.deinterlace ? 'Enabled' : 'Disabled'}
              </label>
            </OptionRow>
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

          {/* Advanced */}
          <ToggleSection icon={Settings} title="Advanced Settings" description="Fine-tune encoding with advanced parameters.">
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
            <OptionRow label="Threads" tooltip="Number of CPU threads for encoding. 0 = auto." description="CPU threads">
              <input type="number" className="input-inline" value={settings.threads}
                onChange={(e) => updateSetting('threads', e.target.value)} min="0" max="64" style={{ width: '80px' }} />
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
          </ToggleSection>

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
              <div key={idx} className={`batch-queue-item status-${item.status}`}>
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
