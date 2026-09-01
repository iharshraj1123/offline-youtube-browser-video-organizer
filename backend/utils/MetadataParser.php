<?php
// c:\laragon\www\youtube\api\utils\MetadataParser.php

class MetadataParser {
    
    /**
     * Parse video metadata (size, duration, resolution, aspect ratio, frame rate, bitrate)
     * 
     * @param string $filePath Absolute path to the video file
     * @return array Metadata array
     */
    public static function parse($filePath) {
        $tempFile = null;
        try {
            // Basic fallback initializations
            $stats = [
                'duration' => 0,
                'filesize' => @filesize($filePath) ?: 0,
                'width' => null,
                'height' => null,
                'aspect_ratio' => null,
                'bitrate' => null,
                'framerate' => null,
                'codec' => null,
                'method' => 'none'
            ];

            if (!file_exists($filePath)) {
                return $stats;
            }

            // Create temporary file on the same drive if path has Unicode chars
            if (preg_match('/[^\x20-\x7e]/', $filePath)) {
                $tempFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . bin2hex(random_bytes(8)) . '.mp4';
                if (!copy($filePath, $tempFile)) {
                    $tempFile = null;
                } else {
                    $filePath = $tempFile;
                }
            }

            // 1. Try FFprobe first (Industrial strength)
            $ffprobePath = self::getFFprobePath();
            if ($ffprobePath) {
                $ffprobeStats = self::parseWithFFprobe($ffprobePath, $filePath);
                if ($ffprobeStats) {
                    $ffprobeStats['method'] = 'ffprobe';
                    return array_merge($stats, $ffprobeStats);
                }
            }

            // 2. Fallback to Pure-PHP Binary Parser (For MP4 files)
            $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            if ($ext === 'mp4') {
                $phpStats = self::parseMp4Binary($filePath);
                if ($phpStats) {
                    $phpStats['method'] = 'pure-php';
                    return array_merge($stats, $phpStats);
                }
            }

            // 3. Fallback to basic
            $stats['method'] = 'basic';
            return $stats;
        } catch (Exception $e) {
            return [
                'duration' => 0,
                'filesize' => @filesize($filePath) ?: 0,
                'width' => null,
                'height' => null,
                'aspect_ratio' => null,
                'bitrate' => null,
                'framerate' => null,
                'codec' => null,
                'method' => 'error'
            ];
        } finally {
            if ($tempFile && file_exists($tempFile)) {
                @unlink($tempFile);
            }
        }
    }

    /**
     * Find if FFprobe is available (local bin folder or global system PATH)
     */
    private static function getFFprobePath() {
        // Check local project bin folder first
        $localBin = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'ffprobe.exe';
        if (file_exists($localBin)) {
            return '"' . $localBin . '"';
        }

        // Check standard Windows installations
        $standardPaths = [
            'C:\\ffmpeg\\bin\\ffprobe.exe',
            'C:\\ffmpeg\\ffprobe.exe',
            'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe',
            'C:\\Program Files (x86)\\ffmpeg\\bin\\ffprobe.exe'
        ];
        foreach ($standardPaths as $path) {
            if (file_exists($path)) {
                return '"' . $path . '"';
            }
        }

        // Check if ffprobe is in system PATH (Windows)
        $output = [];
        $returnVar = -1;
        @exec('where ffprobe', $output, $returnVar);
        if ($returnVar === 0 && !empty($output)) {
            $foundPath = trim($output[0]);
            if (file_exists($foundPath)) {
                return '"' . $foundPath . '"';
            }
            return 'ffprobe';
        }

        return null;
    }

    /**
     * Parse metadata using FFprobe
     */
    private static function parseWithFFprobe($ffprobePath, $filePath) {
        $tempLink = self::getTempHardlink($filePath);
        $inputPath = $tempLink ? $tempLink : $filePath;

        try {
            $cmd = "$ffprobePath -v quiet -print_format json -show_format -show_streams " . escapeshellarg($inputPath);
            $output = [];
            $returnVar = -1;
            @exec($cmd, $output, $returnVar);

            if ($returnVar !== 0 || empty($output)) {
                return null;
            }

            $json = json_decode(implode('', $output), true);
            if (!$json) {
                return null;
            }

            $result = [];

            // Parse format info
            if (isset($json['format'])) {
                if (isset($json['format']['duration'])) {
                    $result['duration'] = (int)round($json['format']['duration']);
                }
                if (isset($json['format']['size'])) {
                    $result['filesize'] = (int)$json['format']['size'];
                }
                if (isset($json['format']['bit_rate'])) {
                    $result['bitrate'] = (int)round($json['format']['bit_rate'] / 1000); // in kbps
                }
            }

            // Parse video stream info
            if (isset($json['streams'])) {
                foreach ($json['streams'] as $stream) {
                    if (isset($stream['codec_type']) && $stream['codec_type'] === 'video') {
                        $result['width'] = (int)$stream['width'];
                        $result['height'] = (int)$stream['height'];
                        $result['codec'] = substr(trim($stream['codec_name'] ?? ''), 0, 100);

                        // Aspect Ratio
                        if (isset($stream['display_aspect_ratio']) && $stream['display_aspect_ratio'] !== 'N/A' && $stream['display_aspect_ratio'] !== '0:1') {
                            $result['aspect_ratio'] = substr(trim($stream['display_aspect_ratio']), 0, 50);
                        } elseif ($result['width'] > 0 && $result['height'] > 0) {
                            $result['aspect_ratio'] = substr(trim(self::calculateAspectRatio($result['width'], $result['height'])), 0, 50);
                        }

                        // Frame rate
                        if (isset($stream['avg_frame_rate'])) {
                            $parts = explode('/', $stream['avg_frame_rate']);
                            if (count($parts) === 2 && (float)$parts[1] > 0) {
                                $fps = (float)$parts[0] / (float)$parts[1];
                                $result['framerate'] = round($fps * 100) / 100;
                            }
                        }
                        break;
                    }
                }
            }

            return $result;
        } finally {
            if ($tempLink && file_exists($tempLink)) {
                @unlink($tempLink);
            }
        }
    }

    /**
     * Calculate greatest common divisor (GCD) to find aspect ratio
     */
    private static function calculateAspectRatio($width, $height) {
        $gcd = function($a, $b) use (&$gcd) {
            return ($b == 0) ? $a : $gcd($b, $a % $b);
        };
        $divisor = $gcd($width, $height);
        if ($divisor > 0) {
            return ($width / $divisor) . ":" . ($height / $divisor);
        }
        return null;
    }

    /**
     * Pure PHP MP4 binary parser
     * Reads movie header (mvhd) and track header (tkhd) to extract duration and resolution
     */
    private static function parseMp4Binary($filePath) {
        $size = @filesize($filePath);
        if ($size <= 0) return null;

        $fp = @fopen($filePath, 'rb');
        if (!$fp) return null;

        // Read first 10MB (usually contains 'moov' atom)
        $data = fread($fp, min($size, 10 * 1024 * 1024));
        $mvhd_pos = strpos($data, 'mvhd');
        $tkhd_pos = strpos($data, 'tkhd');

        // If not found, check the end of the file (web-optimized videos can put 'moov' at the end)
        if (($mvhd_pos === false || $tkhd_pos === false) && $size > 10 * 1024 * 1024) {
            fseek($fp, $size - 10 * 1024 * 1024);
            $end_data = fread($fp, 10 * 1024 * 1024);
            
            if ($mvhd_pos === false) {
                $pos = strpos($end_data, 'mvhd');
                if ($pos !== false) {
                    $data = $end_data;
                    $mvhd_pos = $pos;
                }
            }
            if ($tkhd_pos === false) {
                $pos = strpos($end_data, 'tkhd');
                if ($pos !== false) {
                    $data = $end_data;
                    $tkhd_pos = $pos;
                }
            }
        }
        fclose($fp);

        $result = [];

        // 1. Parse Duration & Timescale from mvhd
        if ($mvhd_pos !== false && strlen($data) >= $mvhd_pos + 32) {
            $version = ord($data[$mvhd_pos + 4]);
            if ($version === 1) {
                $timescale = unpack('N', substr($data, $mvhd_pos + 20, 4))[1];
                $duration_bytes = substr($data, $mvhd_pos + 24, 8);
                $unpack = unpack('Nhigh/Nlow', $duration_bytes);
                $duration = ($unpack['high'] * 4294967296) + $unpack['low'];
            } else {
                $timescale = unpack('N', substr($data, $mvhd_pos + 12, 4))[1];
                $duration = unpack('N', substr($data, $mvhd_pos + 16, 4))[1];
            }

            if ($timescale > 0) {
                $result['duration'] = (int)round($duration / $timescale);
            }
        }

        // 2. Parse Width & Height from tkhd (track header)
        if ($tkhd_pos !== false && strlen($data) >= $tkhd_pos + 5) {
            $version = ord($data[$tkhd_pos + 4]);
            $offset = ($version === 1) ? 84 : 72;
            
            if (strlen($data) >= $tkhd_pos + $offset + 8) {
                $w_int = unpack('n', substr($data, $tkhd_pos + $offset, 2))[1];
                $h_int = unpack('n', substr($data, $tkhd_pos + $offset + 4, 2))[1];
                
                if ($w_int > 0 && $h_int > 0) {
                    $result['width'] = $w_int;
                    $result['height'] = $h_int;
                    $result['aspect_ratio'] = self::calculateAspectRatio($w_int, $h_int);
                }
            }
        }

        // 3. Extrapolate size & bitrate
        if (isset($result['duration']) && $result['duration'] > 0) {
            $result['filesize'] = $size;
            $result['bitrate'] = (int)round(($size * 8) / ($result['duration'] * 1000)); // in kbps
        }

        $result['codec'] = 'h264';
        $result['framerate'] = 30;

        return !empty($result) ? $result : null;
    }

    private static function getTempHardlink($originalPath) {
        $normalized = str_replace('\\', '/', $originalPath);
        $dir = dirname($originalPath);
        
        if (preg_match('/^([a-zA-Z]):\//', $normalized, $matches)) {
            $tempDir = strtoupper($matches[1]) . ':/youtube_temp';
            if (!is_dir($tempDir)) @mkdir($tempDir, 0777, true);
            if (is_dir($tempDir)) $dir = $tempDir;
        }
        
        $ext = pathinfo($originalPath, PATHINFO_EXTENSION);
        $tempName = 'temp_probe_' . uniqid() . '.' . $ext;
        $tempPath = $dir . DIRECTORY_SEPARATOR . $tempName;
        
        $tempPath = str_replace('/', DIRECTORY_SEPARATOR, $tempPath);
        $origWin = str_replace('/', DIRECTORY_SEPARATOR, $originalPath);
        
        if (@link($origWin, $tempPath)) {
            return $tempPath;
        }
        return null;
    }
}
