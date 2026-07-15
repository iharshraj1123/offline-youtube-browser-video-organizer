<?php
// api/classes/FFmpegService.php

class FFmpegService {
    private static $codecMap = [
        'h264' => 'libx264', 'h265' => 'libx265', 'hevc' => 'libx265',
        'vp9' => 'libvpx-vp9', 'av1' => 'libaom-av1', 'mpeg4' => 'mpeg4',
        'vp8' => 'libvpx', 'aac' => 'aac', 'mp3' => 'libmp3lame',
        'opus' => 'libopus', 'flac' => 'flac', 'wav' => 'pcm_s16le',
        'ac3' => 'ac3', 'eac3' => 'eac3', 'copy' => 'copy',
    ];

    public static function getFFmpegPath() {
        $localBin = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'ffmpeg.exe';
        if (file_exists($localBin)) return '"' . $localBin . '"';
        $standardPaths = [
            'C:\\ffmpeg\\bin\\ffmpeg.exe', 'C:\\ffmpeg\\ffmpeg.exe',
            'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
            'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe'
        ];
        foreach ($standardPaths as $path) {
            if (file_exists($path)) return '"' . $path . '"';
        }
        $output = []; $returnVar = -1;
        @exec('where ffmpeg', $output, $returnVar);
        if ($returnVar === 0 && !empty($output)) {
            $foundPath = trim($output[0]);
            if (file_exists($foundPath)) return '"' . $foundPath . '"';
            return 'ffmpeg';
        }
        return null;
    }

    public static function getFFprobePath() {
        $ffmpeg = self::getFFmpegPath();
        if (!$ffmpeg) return null;
        $p = str_replace('"', '', $ffmpeg);
        return str_replace('ffmpeg.exe', 'ffprobe.exe', $p);
    }

    public static function getTempHardlink($sourcePath) {
        $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
        if (!is_dir($tmpDir)) @mkdir($tmpDir, 0777, true);
        $safeName = preg_replace('/[^\x20-\x7A]/', '_', basename($sourcePath));
        if (empty($safeName)) $safeName = 'input_' . uniqid();
        $tempPath = $tmpDir . '/' . uniqid('hl_') . '_' . $safeName;
        $result = @exec('fsutil hardlink create ' . escapeshellarg($tempPath) . ' ' . escapeshellarg($sourcePath) . ' 2>&1');
        if ($result !== false && file_exists($tempPath)) return $tempPath;
        $result = @copy($sourcePath, $tempPath);
        if ($result !== false && file_exists($tempPath)) return $tempPath;
        return null;
    }

    public static function verify() {
        $result = [
            'installed' => false, 'ffmpeg_version' => null, 'ffprobe_version' => null,
            'video_encoders' => [], 'audio_encoders' => [], 'hwaccels' => [], 'formats' => [],
        ];
        $ffmpegPath = self::getFFmpegPath();
        if (!$ffmpegPath) return $result;

        exec($ffmpegPath . ' -version 2>&1', $out, $code);
        if ($code === 0 && !empty($out)) {
            $result['installed'] = true;
            if (preg_match('/ffmpeg\s+version\s+([\w\.\-]+)/i', $out[0], $m)) {
                $result['ffmpeg_version'] = $m[1];
            } else {
                $result['ffmpeg_version'] = substr($out[0], 0, 60);
            }
        }

        $ffprobe = self::getFFprobePath();
        if ($ffprobe) {
            exec($ffprobe . ' -version 2>&1', $out2, $code2);
            if ($code2 === 0 && !empty($out2)) {
                if (preg_match('/ffprobe\s+version\s+([\w\.\-]+)/i', $out2[0], $m)) {
                    $result['ffprobe_version'] = $m[1];
                } else {
                    $result['ffprobe_version'] = substr($out2[0], 0, 60);
                }
            }
        }

        exec($ffmpegPath . ' -encoders 2>&1', $encOut, $encCode);
        if ($encCode === 0) {
            $allText = implode("\n", $encOut);
            preg_match_all('/^\sV.{5}\s+([^\s]+)\s/m', $allText, $vMatches);
            foreach ($vMatches[1] as $enc) {
                $e = trim($enc);
                if (!empty($e)) $result['video_encoders'][] = $e;
            }
            preg_match_all('/^\sA.{5}\s+([^\s]+)\s/m', $allText, $aMatches);
            foreach ($aMatches[1] as $enc) {
                $e = trim($enc);
                if (!empty($e)) $result['audio_encoders'][] = $e;
            }
        }

        exec($ffmpegPath . ' -hwaccels 2>&1', $hwOut, $hwCode);
        if ($hwCode === 0) {
            foreach ($hwOut as $line) {
                $t = trim($line);
                if (!empty($t) && preg_match('/^[a-z][a-z0-9]+$/i', $t)) {
                    $result['hwaccels'][] = $t;
                }
            }
        }

        exec($ffmpegPath . ' -formats 2>&1', $fmtOut, $fmtCode);
        if ($fmtCode === 0) {
            $allText = implode("\n", $fmtOut);
            preg_match_all('/^\s{2}[DE]?\s+(\S+)\s+/m', $allText, $fmtMatches);
            foreach ($fmtMatches[1] as $fmt) {
                if (!empty($fmt)) $result['formats'][] = $fmt;
            }
        }

        return $result;
    }

    public static function getMediaInfo($input) {
        $ffprobe = self::getFFprobePath();
        if (!$ffprobe) return ['error' => 'FFprobe not found'];

        $downloaded = false;
        if (preg_match('#^https?://#i', $input)) {
            $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
            if (!is_dir($tmpDir)) @mkdir($tmpDir, 0777, true);
            $ext = 'mp4';
            $parsed = parse_url($input);
            $pathParts = pathinfo($parsed['path'] ?? '');
            if (isset($pathParts['extension']) && !empty($pathParts['extension'])) {
                $ext = $pathParts['extension'];
            }
            $dlPath = $tmpDir . '/' . uniqid('remote_') . '.' . $ext;
            exec('curl -sL -o ' . escapeshellarg($dlPath) . ' --connect-timeout 10 --max-time 120 ' . escapeshellarg($input) . ' 2>&1', $dlOut, $dlCode);
            if ($dlCode === 0 && file_exists($dlPath) && filesize($dlPath) > 0) {
                $input = $dlPath;
                $downloaded = true;
            } else {
                if (file_exists($dlPath)) @unlink($dlPath);
                return ['error' => 'Failed to download remote file'];
            }
        }

        $tempLink = self::getTempHardlink($input);
        $probePath = $tempLink ? $tempLink : $input;
        $cmd = $ffprobe . ' -v quiet -print_format json -show_format -show_streams -show_chapters ' . escapeshellarg($probePath) . ' 2>&1';
        $output = []; $code = -1;
        exec($cmd, $output, $code);
        if ($tempLink && file_exists($tempLink)) @unlink($tempLink);
        if ($code !== 0 || empty($output)) {
            return ['error' => 'Failed to probe file. Make sure it is a valid media file.'];
        }

        $json = json_decode(implode('', $output), true);
        if (!$json) return ['error' => 'Invalid ffprobe output'];

        $result = [];
        if (isset($json['format'])) {
            $f = $json['format'];
            $result['filename'] = basename($input);
            $result['size'] = intval($f['size'] ?? 0);
            $result['duration'] = floatval($f['duration'] ?? 0);
            $result['bit_rate'] = intval($f['bit_rate'] ?? 0);
            $result['format_name'] = $f['format_name'] ?? '';
            $result['format_long'] = $f['format_long_name'] ?? '';
        }

        $result['streams'] = [];
        if (isset($json['streams'])) {
            foreach ($json['streams'] as $stream) {
                $type = $stream['codec_type'] ?? 'unknown';
                $info = [
                    'index' => intval($stream['index'] ?? 0),
                    'codec' => $stream['codec_name'] ?? '',
                    'codec_long' => $stream['codec_long_name'] ?? '',
                    'type' => $type,
                ];
                if ($type === 'video') {
                    $info['width'] = intval($stream['width'] ?? 0);
                    $info['height'] = intval($stream['height'] ?? 0);
                    if ($info['width'] > 0 && $info['height'] > 0) {
                        $g = function($a, $b) use (&$g) { return ($b == 0) ? $a : $g($b, $a % $b); };
                        $d = $g($info['width'], $info['height']);
                        $info['aspect_ratio'] = ($info['width'] / $d) . ':' . ($info['height'] / $d);
                        $info['display_aspect_ratio'] = $stream['display_aspect_ratio'] ?? $info['aspect_ratio'];
                    }
                    $info['pix_fmt'] = $stream['pix_fmt'] ?? '';
                    if (isset($stream['avg_frame_rate'])) {
                        $parts = explode('/', $stream['avg_frame_rate']);
                        if (count($parts) === 2 && floatval($parts[1]) > 0) {
                            $info['fps'] = round(floatval($parts[0]) / floatval($parts[1]), 3);
                        }
                    }
                    $info['bitrate'] = intval($stream['bit_rate'] ?? 0);
                    $info['profile'] = $stream['profile'] ?? '';
                    $info['field_order'] = $stream['field_order'] ?? 'progressive';
                    $info['bits_per_raw_sample'] = intval($stream['bits_per_raw_sample'] ?? 8);
                    $info['color_space'] = $stream['color_space'] ?? '';
                    $info['color_transfer'] = $stream['color_transfer'] ?? '';
                } elseif ($type === 'audio') {
                    $info['sample_rate'] = intval($stream['sample_rate'] ?? 0);
                    $info['channels'] = intval($stream['channels'] ?? 0);
                    $info['channel_layout'] = $stream['channel_layout'] ?? '';
                    $info['bitrate'] = intval($stream['bit_rate'] ?? 0);
                    $info['language'] = $stream['tags']['language'] ?? '';
                    $info['title'] = $stream['tags']['title'] ?? '';
                    $info['profile'] = $stream['profile'] ?? '';
                } elseif ($type === 'subtitle') {
                    $info['language'] = $stream['tags']['language'] ?? '';
                    $info['title'] = $stream['tags']['title'] ?? '';
                }
                $result['streams'][] = $info;
            }
        }

        $result['chapters'] = [];
        if (isset($json['chapters'])) {
            foreach ($json['chapters'] as $ch) {
                $result['chapters'][] = [
                    'id' => intval($ch['id'] ?? 0),
                    'start' => floatval($ch['start_time'] ?? 0),
                    'end' => floatval($ch['end_time'] ?? 0),
                    'title' => $ch['tags']['title'] ?? '',
                ];
            }
        }

        $result['_temp_cleanup'] = $downloaded ? $input : null;
        return $result;
    }

    public static function cleanup() {
        $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
        if (!is_dir($tmpDir)) return;
        $files = glob($tmpDir . '/*');
        foreach ($files as $f) {
            $base = basename($f);
            if (preg_match('/^[a-f0-9]{32}_/', $base)) continue;
            @unlink($f);
        }
    }

    private static function getWatermarkPosition($pos) {
        switch ($pos) {
            case 'nw': return '10:10';
            case 'ne': return 'W-w-10:10';
            case 'sw': return '10:H-h-10';
            case 'center': return '(W-w)/2:(H-h)/2';
            default: return 'W-w-10:H-h-10';
        }
    }

    private static function buildVfFilters($opts) {
        $parts = [];
        if (!empty($opts['deinterlace'])) $parts[] = 'yadif';
        if (!empty($opts['resolution']) && $opts['resolution'] !== 'original') {
            if (is_numeric($opts['resolution'])) {
                $parts[] = 'scale=-1:' . intval($opts['resolution']);
            } else {
                $res = str_replace(['x', 'X'], ':', $opts['resolution']);
                $parts[] = 'scale=' . $res;
            }
        }
        if (!empty($opts['crop_w']) && intval($opts['crop_w']) > 0 && !empty($opts['crop_h']) && intval($opts['crop_h']) > 0) {
            $parts[] = "crop={$opts['crop_w']}:{$opts['crop_h']}:{$opts['crop_x']}:{$opts['crop_y']}";
        }
        $eqParts = [];
        if (isset($opts['color_brightness']) && floatval($opts['color_brightness']) !== 0.0) {
            $eqParts[] = 'brightness=' . floatval($opts['color_brightness']);
        }
        if (isset($opts['color_contrast']) && abs(floatval($opts['color_contrast']) - 1.0) > 0.01) {
            $eqParts[] = 'contrast=' . floatval($opts['color_contrast']);
        }
        if (isset($opts['color_saturation']) && abs(floatval($opts['color_saturation']) - 1.0) > 0.01) {
            $eqParts[] = 'saturation=' . floatval($opts['color_saturation']);
        }
        if (isset($opts['color_gamma']) && abs(floatval($opts['color_gamma']) - 1.0) > 0.01) {
            $eqParts[] = 'gamma=' . floatval($opts['color_gamma']);
        }
        if (!empty($eqParts)) $parts[] = 'eq=' . implode(':', $eqParts);
        if (!empty($opts['rotate'])) {
            if ($opts['rotate'] === '90cw') $parts[] = 'transpose=1';
            elseif ($opts['rotate'] === '90ccw') $parts[] = 'transpose=2';
            elseif ($opts['rotate'] === '180') { $parts[] = 'hflip'; $parts[] = 'vflip'; }
        }
        if (!empty($opts['hflip'])) $parts[] = 'hflip';
        if (!empty($opts['vflip'])) $parts[] = 'vflip';
        if (isset($opts['speed']) && floatval($opts['speed']) > 0 && abs(floatval($opts['speed']) - 1.0) > 0.01) {
            $parts[] = 'setpts=' . (1 / floatval($opts['speed'])) . '*PTS';
        }
        // Text watermark
        if (!empty($opts['watermark_type']) && $opts['watermark_type'] === 'text' && !empty($opts['watermark_text'])) {
            $pos = self::getWatermarkPosition($opts['watermark_position'] ?? 'se');
            $fs = intval($opts['watermark_font_size'] ?? 24);
            $color = preg_replace('/[^a-fA-F0-9#]/', '', $opts['watermark_color'] ?? 'white');
            $alpha = floatval($opts['watermark_opacity'] ?? 1.0);
            $text = escapeshellarg($opts['watermark_text']);
            $parts[] = "drawtext=text={$text}:fontsize={$fs}:fontcolor={$color}@{$alpha}:{$pos}";
        }

        if (!empty($opts['subtitle_mode']) && $opts['subtitle_mode'] === 'burn') {
            $subStream = intval($opts['subtitle_stream'] ?? 0);
            $parts[] = 'subtitles=' . escapeshellarg($opts['_input_path_for_subtitles']) . ':stream_index=' . $subStream;
        }
        return $parts;
    }

    private static function buildAfFilters($opts) {
        $parts = [];
        if (!empty($opts['volume']) && $opts['volume'] !== '0' && $opts['volume'] !== 'original') {
            $vol = floatval($opts['volume']);
            if ($vol !== 0) $parts[] = 'volume=' . $vol . 'dB';
        }
        if (isset($opts['speed']) && floatval($opts['speed']) > 0 && abs(floatval($opts['speed']) - 1.0) > 0.01) {
            $speed = floatval($opts['speed']);
            $remaining = $speed;
            while ($remaining > 2.0) { $parts[] = 'atempo=2.0'; $remaining /= 2.0; }
            while ($remaining < 0.5) { $parts[] = 'atempo=0.5'; $remaining /= 0.5; }
            if (abs($remaining - 1.0) > 0.01) $parts[] = 'atempo=' . number_format($remaining, 6);
        }
        return $parts;
    }

    public static function convert($inputPath, $opts) {
        $ffmpegPath = self::getFFmpegPath();
        if (!$ffmpegPath) {
            echo "data: " . json_encode(['type' => 'error', 'message' => 'FFmpeg not found']) . "\n\n";
            flush(); exit;
        }

        $container = preg_replace('/[^a-zA-Z0-9]/', '', $opts['container'] ?? 'mp4');
        if (empty($container)) $container = 'mp4';

        $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
        if (!is_dir($tmpDir)) @mkdir($tmpDir, 0777, true);

        $token = bin2hex(random_bytes(16));
        $outputFilename = pathinfo(basename($inputPath), PATHINFO_FILENAME) . '_converted.' . $container;
        $outputPath = $tmpDir . '/' . $token . '_' . $outputFilename;

        // Get duration
        $ffprobe = self::getFFprobePath();
        $duration = 0;
        if ($ffprobe) {
            $tempLink = self::getTempHardlink($inputPath);
            $probePath = $tempLink ? $tempLink : $inputPath;
            $durCmd = $ffprobe . ' -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($probePath) . ' 2>&1';
            exec($durCmd, $durOut, $durCode);
            if ($tempLink && file_exists($tempLink)) @unlink($tempLink);
            if ($durCode === 0 && !empty($durOut) && is_numeric($durOut[0])) {
                $duration = floatval($durOut[0]);
            }
        }

        // Input via temp hardlink for Unicode
        $tempLink2 = self::getTempHardlink($inputPath);
        $cmdInput = $tempLink2 ? $tempLink2 : $inputPath;

        // Watermark image upload (from $_FILES)
        $watermarkImage = null;
        if (!empty($opts['watermark_type']) && $opts['watermark_type'] === 'image') {
            if (isset($_FILES['watermark_image']) && $_FILES['watermark_image']['error'] === UPLOAD_ERR_OK) {
                $tmpDir2 = dirname(__DIR__) . '/uploads/ffmpeg_temp';
                if (!is_dir($tmpDir2)) @mkdir($tmpDir2, 0777, true);
                $wmPath = $tmpDir2 . '/' . uniqid('wm_') . '_' . basename($_FILES['watermark_image']['name']);
                move_uploaded_file($_FILES['watermark_image']['tmp_name'], $wmPath);
                $watermarkImage = $wmPath;
            }
        }

        // Build command
        $cmd = $ffmpegPath . ' -y -progress pipe:1';

        if (!empty($opts['hwaccel']) && $opts['hwaccel'] !== 'none') {
            $cmd .= ' -hwaccel ' . escapeshellarg($opts['hwaccel']);
        }

        $cmd .= ' -i ' . escapeshellarg($cmdInput);

        // Add watermark image input if present
        if ($watermarkImage) {
            $cmd .= ' -i ' . escapeshellarg($watermarkImage);
        }

        // Build filter chains
        $opts['_input_path_for_subtitles'] = $cmdInput;
        $vfParts = self::buildVfFilters($opts);
        $afParts = self::buildAfFilters($opts);

        // Video options
        $videoCodec = $opts['video_codec'] ?? 'copy';
        if ($videoCodec === 'copy') {
            $cmd .= ' -c:v copy';
        } else {
            $ffVideoCodec = self::$codecMap[$videoCodec] ?? $videoCodec;
            $cmd .= ' -c:v ' . $ffVideoCodec;

            if (!empty($opts['crf']) && $opts['crf'] !== '') {
                $crf = intval($opts['crf']);
                if (in_array($videoCodec, ['vp9', 'av1'])) {
                    $cmd .= ' -crf ' . max(0, min(63, $crf));
                } else {
                    $cmd .= ' -crf ' . max(0, min(51, $crf));
                }
            }

            if (!empty($opts['video_bitrate'])) {
                $cmd .= ' -b:v ' . escapeshellarg($opts['video_bitrate']);
            }

            if (!empty($opts['framerate']) && $opts['framerate'] !== 'original') {
                $cmd .= ' -r ' . escapeshellarg($opts['framerate']);
            }

            if (!empty($opts['preset'])) {
                $cmd .= ' -preset ' . escapeshellarg($opts['preset']);
            }
            if (!empty($opts['tune'])) {
                $cmd .= ' -tune ' . escapeshellarg($opts['tune']);
            }
            if (!empty($opts['profile'])) {
                $cmd .= ' -profile:v ' . escapeshellarg($opts['profile']);
            }
            if (!empty($opts['pix_fmt'])) {
                $cmd .= ' -pix_fmt ' . escapeshellarg($opts['pix_fmt']);
            }
        }

        // Watermark: add overlay to filter chain or use filter_complex
        $useComplex = false;
        if ($watermarkImage) {
            $wmPos = self::getWatermarkPosition($opts['watermark_position'] ?? 'se');
            $alpha = floatval($opts['watermark_opacity'] ?? 1.0);
            if ($alpha < 1.0) {
                $wmExpr = "overlay={$wmPos}:format=auto,format=rgba,colorchannelmixer=aa={$alpha}";
            } else {
                $wmExpr = "overlay={$wmPos}";
            }
            $filterComplex = "[0:v]";
            if (!empty($vfParts)) {
                $filterComplex .= implode(',', $vfParts) . ",";
            }
            $filterComplex .= "[vid];[vid][1:v]" . $wmExpr;
            $useComplex = true;
        }

        // Apply video filter chain
        if ($useComplex) {
            $cmd .= ' -filter_complex "' . $filterComplex . '"';
        } elseif (!empty($vfParts)) {
            $cmd .= ' -vf "' . implode(',', $vfParts) . '"';
        }

        // Audio options
        $audioCodec = $opts['audio_codec'] ?? 'copy';
        if ($audioCodec === 'copy') {
            $cmd .= ' -c:a copy';
        } else {
            $ffAudioCodec = self::$codecMap[$audioCodec] ?? $audioCodec;
            $cmd .= ' -c:a ' . $ffAudioCodec;
            if (!empty($opts['audio_bitrate']) && $opts['audio_bitrate'] !== 'auto') {
                $cmd .= ' -b:a ' . escapeshellarg($opts['audio_bitrate']);
            }
            if (!empty($opts['sample_rate']) && $opts['sample_rate'] !== 'original') {
                $cmd .= ' -ar ' . intval($opts['sample_rate']);
            }
            if (!empty($opts['channels']) && $opts['channels'] !== 'original') {
                $chMap = ['mono' => 1, 'stereo' => 2, '5.1' => 6, '7.1' => 8];
                $ch = $chMap[$opts['channels']] ?? intval($opts['channels']);
                if ($ch > 0) $cmd .= ' -ac ' . $ch;
            }
        }

        // Subtitle handling (stream copy, not burn — burn handled in vf filters)
        if (!empty($opts['subtitle_mode']) && $opts['subtitle_mode'] === 'copy') {
            $cmd .= ' -c:s copy';
        }

        // Audio filter chain
        if (!empty($afParts)) {
            $cmd .= ' -af "' . implode(',', $afParts) . '"';
        }

        // Trim
        if (!empty($opts['start_time'])) $cmd .= ' -ss ' . escapeshellarg($opts['start_time']);
        if (!empty($opts['duration'])) $cmd .= ' -t ' . escapeshellarg($opts['duration']);

        // Two-pass
        $twoPass = !empty($opts['two_pass']);

        // Threads
        if (!empty($opts['threads']) && intval($opts['threads']) > 0) {
            $cmd .= ' -threads ' . intval($opts['threads']);
        }

        // Metadata
        if (!empty($opts['metadata_preserve'])) {
            $cmd .= ' -map_metadata 0';
        } else {
            $cmd .= ' -map_metadata -1';
        }

        // Faststart for MP4
        if ($container === 'mp4') {
            $cmd .= ' -movflags +faststart';
        }

        // Custom args
        if (!empty($opts['custom_args'])) {
            $cmd .= ' ' . $opts['custom_args'];
        }

        $cmd .= ' ' . escapeshellarg($outputPath) . ' 2>&1';

        // SSE headers
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');
        @set_time_limit(0);
        @ini_set('output_buffering', '0');
        @ini_set('zlib.output_compression', 0);
        while (@ob_get_level() > 0) { @ob_end_flush(); }
        ob_implicit_flush(true);

        echo "data: " . json_encode(['type' => 'info', 'message' => 'Starting conversion...']) . "\n\n";
        flush();

        // Two-pass
        if ($twoPass && $videoCodec !== 'copy') {
            $pass1Cmd = $cmd;
            $pass1Cmd = str_replace(' ' . escapeshellarg($outputPath), ' -pass 1 -f null NUL', $pass1Cmd);
            $pass1Cmd .= ' 2>&1';
            echo "data: " . json_encode(['type' => 'info', 'message' => 'Running first pass (2-pass encoding)...']) . "\n\n";
            flush();
            $proc1 = @proc_open($pass1Cmd, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes1);
            if (is_resource($proc1)) {
                fclose($pipes1[0]);
                stream_get_contents($pipes1[1]); stream_get_contents($pipes1[2]);
                fclose($pipes1[1]); fclose($pipes1[2]);
                proc_close($proc1);
            }
            $cmd = str_replace(' -c:v ', ' -c:v -pass 2 ', $cmd);
        }

        // Run FFmpeg
        $descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
        $process = @proc_open($cmd, $descriptors, $pipes);

        if (!is_resource($process)) {
            if ($tempLink2 && file_exists($tempLink2)) @unlink($tempLink2);
            echo "data: " . json_encode(['type' => 'error', 'message' => 'Failed to start FFmpeg process']) . "\n\n";
            flush(); exit;
        }

        fclose($pipes[0]);
        $stderrOutput = '';
        $startTime = time();

        $progressData = [];
        while (!feof($pipes[1])) {
            $line = fgets($pipes[1]);
            if ($line === false) break;
            $line = trim($line);
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $progressData[trim($key)] = trim($value);
                if (trim($key) === 'progress') {
                    if (trim($value) === 'end') {
                        echo "data: " . json_encode(['type' => 'complete']) . "\n\n";
                        flush(); break;
                    }
                    $outTimeUs = intval($progressData['out_time_us'] ?? 0);
                    $percent = 0; $eta = 0;
                    if ($duration > 0 && $outTimeUs > 0) {
                        $percent = min(round($outTimeUs / ($duration * 1000000) * 100, 1), 99.9);
                        $elapsedSec = max(1, time() - $startTime);
                        if ($elapsedSec > 0) {
                            $rate = $outTimeUs / $elapsedSec / 1000000;
                            if ($rate > 0) {
                                $eta = round(($duration - ($outTimeUs / 1000000)) / $rate);
                            }
                        }
                    }
                    echo "data: " . json_encode([
                        'type' => 'progress',
                        'percent' => $percent,
                        'time' => gmdate('H:i:s', floor($outTimeUs / 1000000)),
                        'fps' => $progressData['fps'] ?? '',
                        'speed' => $progressData['speed'] ?? '',
                        'bitrate' => $progressData['bitrate'] ?? '',
                        'eta' => $eta,
                    ]) . "\n\n";
                    flush();
                    $progressData = [];
                }
            }
        }

        $stderrOutput .= stream_get_contents($pipes[2]);
        fclose($pipes[1]); fclose($pipes[2]);
        $returnCode = proc_close($process);
        if ($tempLink2 && file_exists($tempLink2)) @unlink($tempLink2);

        if ($returnCode === 0 && file_exists($outputPath) && filesize($outputPath) > 0) {
            $fs = filesize($outputPath);
            echo "data: " . json_encode([
                'type' => 'done',
                'download_token' => $token,
                'filename' => $outputFilename,
                'size' => $fs,
                'size_formatted' => $fs > 1048576 ? round($fs / 1048576, 2) . ' MB' : round($fs / 1024, 2) . ' KB',
                'output_path' => $outputPath,
            ]) . "\n\n";
        } elseif (file_exists($outputPath) && filesize($outputPath) === 0) {
            @unlink($outputPath);
            echo "data: " . json_encode(['type' => 'error', 'message' => 'Output file is empty. FFmpeg may have failed.']) . "\n\n";
        } else {
            $errMsg = !empty($stderrOutput) ? substr(trim($stderrOutput), -500) : 'Unknown error (return code: ' . $returnCode . ')';
            echo "data: " . json_encode(['type' => 'error', 'message' => 'Conversion failed: ' . $errMsg]) . "\n\n";
        }
        flush(); exit;
    }

    public static function download($token) {
        if (empty($token) || strlen($token) !== 32) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }
        $tmpDir = dirname(__DIR__) . '/uploads/ffmpeg_temp';
        $files = glob($tmpDir . '/' . $token . '_*');
        if (empty($files)) {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['error' => 'File not found or expired']);
            exit;
        }
        $filePath = $files[0];
        $displayName = preg_replace('/^[a-f0-9]{32}_/', '', basename($filePath));
        $fs = filesize($filePath);
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $displayName . '"');
        header('Content-Length: ' . $fs);
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no');
        @set_time_limit(0);
        $fp = @fopen($filePath, 'rb');
        if ($fp) {
            while (!feof($fp)) { echo fread($fp, 8192); flush(); }
            fclose($fp);
        }
        @unlink($filePath);
        exit;
    }
}
