# Offline YouTube Browser & Video Organizer

<img width="1917" height="972" alt="image" src="https://github.com/user-attachments/assets/c68b32c5-daa0-4818-9533-669c3e5d8d6b" />

<img width="1915" height="922" alt="image" src="https://github.com/user-attachments/assets/8552707e-6b96-458a-98c1-6f83fdd378ad" />

<img width="1910" height="917" alt="image" src="https://github.com/user-attachments/assets/c007a1d0-8bc3-4326-9b00-8bdb6e80309a" />

A standalone offline video player, library indexer, and custom social space. Built with React, Vite, PHP, and MySQL. Scans local directories for video files, extracts rich metadata and thumbnail previews using FFmpeg, and presents them in a modern glassmorphic dark-theme YouTube-clone interface.

## Features

### Player
- Custom HTML5 video player with full controls (theater mode, speed 0.25x-2x, loop, volume persistence)
- Double-click fast-forward/rewind (10s)
- Floating mini-player with drag support (persists across navigation)
- Keyboard shortcuts (see below)
- DLNA / Chromecast casting with on-the-fly audio transcoding (H.264 passthrough, AAC re-encode)
- Adaptive fullscreen orientation on phones (landscape default, portrait for vertical videos)
- Phone pinch-to-zoom with snap-to-fill, haptic feedback
- Playback history navigation (previous/next through watched videos)
- Stats for nerds overlay (codec, resolution, bitrate, etc.)

### Library
- Auto-scans configured local directories for video files (.mp4, .webm, .mkv, .avi, .mov, etc.)
- Batch thumbnail extraction via FFmpeg with progress tracking
- Video metadata extraction (resolution, codec, bitrate, framerate, filesize)
- Folder-based organization and navigation
- Debounced hover preview (silent looped inline playback on card hover)

### Social
- Collapsible nested comments with plain-text emote parser (`:emote:`)
- Timestamp seek links in comments (click `0:10` to jump)
- Media attachments on comments and replies (images, GIFs, video clips, URLs)
- User profiles with avatars, bio, karma, upload grids, comment history
- Reputation system with upvote/downvote voting
- Playlists (create, reorder, add/remove videos)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Vanilla CSS, Lucide Icons |
| Backend | PHP 7.4+ (PDO) |
| Database | MySQL / MariaDB (utf8mb4) |
| Media | FFmpeg / FFprobe |
| Server | Apache (.htaccess routing, MIME types, DLNA headers) |

## Project Structure

```
youtube/
├── backend/
│   ├── index.php          # Main API router (all endpoints)
│   ├── db.php             # PDO database connection wrapper
│   ├── .env.example       # Database credentials template
│   └── utils/             # Helper functions
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main SPA (App + PlayerView components)
│   │   └── index.css      # All styles (glassmorphic design system)
│   └── vite.config.js     # Vite config (outputs to public dir)
├── public/                # Static files, compiled JS/CSS bundles (Vite output)
│   ├── assets/            # Compiled bundles
│   └── index.html         # SPA entry point
├── thumbnails/            # FFmpeg-generated video thumbnails
├── uploads/               # User-uploaded avatars and attachments
├── Userdatabase/          # Default profile pictures
├── schema.sql             # Full database schema
└── .htaccess              # Apache MIME types, DLNA headers, rewrite rules
```

## Installation

### Prerequisites
- **PHP 7.4+** with PDO MySQL extension
- **MySQL 5.7+** or MariaDB 10.3+
- **FFmpeg & FFprobe** installed and added to system `PATH`
- **Node.js 18+** (for frontend build)
- **Apache** with `mod_rewrite` enabled

### Setup

1. **Clone the repository** into your web server root:
   ```bash
   # Laragon: C:\laragon\www\youtube\
   # XAMPP:   C:\xampp\htdocs\youtube\
   git clone https://github.com/iharshraj1123/offline-youtube-browser-video-organizer.git youtube
   ```

2. **Configure Apache** to serve your video directories. Add to `httpd.conf`:
   ```apache
   Alias "/d:" "D:/"
   Alias "/c:" "C:/"

   <Directory "D:/">
       Options Indexes FollowSymLinks Includes ExecCGI
       AllowOverride All
       Require all granted
   </Directory>
   <Directory "C:/">
       Options Indexes FollowSymLinks Includes ExecCGI
       AllowOverride All
       Require all granted
   </Directory>
   ```

3. **Set up the database**:
   ```bash
   # Import the schema
   mysql -u root -p < schema.sql
   ```
   This creates the `youtube-v2` database with all required tables.

4. **Configure database credentials**:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=youtube-v2
   ```

5. **Build the frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   Vite compiles and outputs the production bundle to the public directory (`../public`).

6. **Start the server** and visit:
   - Laragon: `http://youtube.test/`
   - XAMPP: `http://localhost/youtube/`

### Adding Videos

Add your video directories to the database by calling the scan API, or place your video files in directories that Apache can serve. The app will index them and extract thumbnails automatically.

## Keyboard Shortcuts

> Video must be focused (press `Numpad 5` if not)

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `F` | Toggle fullscreen |
| `T` | Toggle theater mode |
| `N` | Next video |
| `P` | Previous video |
| `L` | Toggle loop |
| `R` | Toggle random / in-queue play |
| `Numpad 0` | Toggle reverse autoplay |
| `C` | Toggle captions / subtitles |
| `M` | Toggle mute |
| `→` / `←` | Seek forward / backward 5s |
| `↑` / `↓` | Volume up / down 5% |
| `<` / `>` | Decrease / increase playback speed |
| `Numpad 5` | Focus video element |

## Database Schema

| Table | Purpose |
|-------|---------|
| `video_metadatas` | Video info, FFmpeg metadata (codec, resolution, bitrate) |
| `playlists` | User-created playlists with ordered video IDs |
| `users` | Accounts, profiles, karma, avatars |
| `comments` | Top-level comments with attachments |
| `replies` | Nested replies (supports parent chains) |
| `user_activity_votes` | Upvote/downvote tracking (unique per user+target) |
| `chats` | Direct messaging between users |

## API Endpoints

All endpoints are served through `api/index.php?action=<action>` (rewritten internally to `backend/index.php?action=<action>`). Key actions:

| Action | Method | Description |
|--------|--------|-------------|
| `scan_videos` | POST | Scan directory for video files |
| `get_videos` | GET | List all indexed videos |
| `get_video` | GET | Get single video metadata |
| `update_duration` | POST | Save detected video duration |
| `get_thumbnails` | POST | Batch generate thumbnails |
| `get_comments` | GET | Fetch comments for a video |
| `add_comment` | POST | Post a comment |
| `add_reply` | POST | Post a reply |
| `vote` | POST | Upvote/downvote comment or reply |
| `cast_control` | POST | Control DLNA/cast playback |
| `transcode` | POST | On-the-fly media transcoding for cast |

## License

[CC BY-NC-SA 4.0](LICENSE.md) - Creative Commons Attribution-NonCommercial-ShareAlike
