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

        // 3. Fallback to basic calculations if we only have duration (e.g. from client updates later)
        $stats['method'] = 'basic';
        return $stats;
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
        // Create temporary hardlink in the same folder to bypass Windows Unicode cmd.exe bugs
        $tempLink = self::getTempHardlink($filePath);
        $inputPath = $tempLink ? $tempLink : $filePath;

        $cmd = "$ffprobePath -v quiet -print_format json -show_format -show_streams " . escapeshellarg($inputPath);
        $output = [];
        $returnVar = -1;
        @exec($cmd, $output, $returnVar);

        // Clean up temporary hardlink
        if ($tempLink && file_exists($tempLink)) {
            @unlink($tempLink);
        }

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
                    $result['codec'] = $stream['codec_name'];

                    // Aspect Ratio
                    if (isset($stream['display_aspect_ratio']) && $stream['display_aspect_ratio'] !== 'N/A' && $stream['display_aspect_ratio'] !== '0:1') {
                        $result['aspect_ratio'] = $stream['display_aspect_ratio'];
                    } elseif ($result['width'] > 0 && $result['height'] > 0) {
                        $result['aspect_ratio'] = self::calculateAspectRatio($result['width'], $result['height']);
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
                    $data = $end_data; // use end data for unpacking
                    $mvhd_pos = $pos;
                }
            }
            if ($tkhd_pos === false) {
                $pos = strpos($end_data, 'tkhd');
                if ($pos !== false) {
                    // if tkhd is in end data but mvhd was in beginning, we offset accordingly
                    // but usually they are both in the same moov block.
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
                // Version 1: 64-bit creation, modification, timescale, duration
                $timescale = unpack('N', substr($data, $mvhd_pos + 20, 4))[1];
                $duration_bytes = substr($data, $mvhd_pos + 24, 8);
                $unpack = unpack('Nhigh/Nlow', $duration_bytes);
                $duration = ($unpack['high'] * 4294967296) + $unpack['low'];
            } else {
                // Version 0: 32-bit creation, modification, timescale, duration
                $timescale = unpack('N', substr($data, $mvhd_pos + 12, 4))[1];
                $duration = unpack('N', substr($data, $mvhd_pos + 16, 4))[1];
            }

            if ($timescale > 0) {
                $result['duration'] = (int)round($duration / $timescale);
            }
        }

        // 2. Parse Width & Height from tkhd (track header)
        // There can be multiple tracks (video/audio). We scan for the video track (which has non-zero width/height)
        if ($tkhd_pos !== false && strlen($data) >= $tkhd_pos + 5) {
            $version = ord($data[$tkhd_pos + 4]);
            $offset = ($version === 1) ? 84 : 72; // size varies based on version
            
            // Width and Height are stored as 16.16 fixed point numbers (4 bytes integer, 4 bytes fraction)
            // Width is at $tkhd_pos + $offset, Height is at $tkhd_pos + $offset + 4
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

        // Default code fallbacks
        $result['codec'] = 'h264';
        $result['framerate'] = 30; // standard average fallback

        return !empty($result) ? $result : null;
    }

    private static function getTempHardlink($originalPath) {
        $dir = dirname($originalPath);
        $ext = pathinfo($originalPath, PATHINFO_EXTENSION);
        
        // Create random unique ASCII filename
        $tempName = 'temp_probe_' . uniqid() . '.' . $ext;
        $tempPath = $dir . DIRECTORY_SEPARATOR . $tempName;
        
        // Normalize path slashes for Windows link()
        $tempPath = str_replace('/', DIRECTORY_SEPARATOR, $tempPath);
        $originalPath = str_replace('/', DIRECTORY_SEPARATOR, $originalPath);
        
        if (@link($originalPath, $tempPath)) {
            return $tempPath;
        }
        return null;
    }
}
