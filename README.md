# Offline YouTube Browser & Video Organizer

<img width="1917" height="972" alt="image" src="https://github.com/user-attachments/assets/c68b32c5-daa0-4818-9533-669c3e5d8d6b" />

<img width="1915" height="922" alt="image" src="https://github.com/user-attachments/assets/8552707e-6b96-458a-98c1-6f83fdd378ad" />

<img width="1910" height="917" alt="image" src="https://github.com/user-attachments/assets/c007a1d0-8bc3-4326-9b00-8bdb6e80309a" />

Offline YouTube Browser & Video Organizer is a self-hosted media platform designed to turn local video collections into a YouTube-style web application. It combines file system indexing, media processing, interactive playback, and community features into a single application.

The project consists of a React 19 single-page application on the frontend, supported by a PHP backend API, MySQL database, and FFmpeg for media processing.

## Overview

### Video Player and Touch Navigation
The primary media player supports variable speed playback, theater mode, looping, and volume persistence. Touch controls for mobile devices include a three-way horizontal touch division (rewind, fullscreen toggle, and forward seeking) and center-focused pinch-to-zoom. A floating mini-player persists across page navigation, allowing uninterrupted playback while browsing your library or adjusting settings.

### Shorts Viewer
A vertical video feed handles portrait media with vertical aspect-ratio fill, persistent zoom modes, and single-tap controls. An Eye button toggles the entire overlay UI off for distraction-free viewing.

### Dynamic Category Pills
The homepage includes a customizable category navigation bar backed by MySQL. Pills can filter videos by folder paths, tags, media types, or custom SQL queries, and can be sorted by upload date, views, duration, likes, or random mix. All pill configurations sync automatically across devices.

### Social and Discussion System
A full community feature set allows multiple user accounts, karma reputation tracking, nested comment threads with media attachments (images, GIFs, video clips), timestamp jump links, and direct messaging between users.

### Media Converter and Downloader
The platform includes built-in media conversion tools and integrated video downloading utilities, allowing users to format or acquire new content directly within the browser interface.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Vanilla CSS, Lucide Icons |
| Backend | PHP 7.4+ (PDO) |
| Database | MySQL 5.7+ / MariaDB 10.3+ |
| Processing | FFmpeg / FFprobe |
| Server | Apache (.htaccess routing, MIME types, DLNA headers) |

## Project Structure

```
youtube/
├── backend/
│   ├── index.php          # API controller handling all actions
│   ├── db.php             # Database connection wrapper and migrations
│   ├── .env.example       # Database credentials configuration template
│   └── utils/             # Helper utilities and parsers
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main application component and player routing
│   │   ├── components/    # Settings, Profile, Downloader, and Converter views
│   │   └── index.css      # Core stylesheets and design system
│   └── vite.config.js     # Vite configuration
├── public/                # Static files and compiled production bundle
├── thumbnails/            # Generated video thumbnails
├── uploads/               # Avatars and comment media attachments
├── schema.sql             # MySQL database schema definition
└── .htaccess              # Apache rewrite rules and headers
```

## Installation

### Prerequisites
- PHP 7.4 or higher with PDO MySQL extension
- MySQL 5.7+ or MariaDB 10.3+
- FFmpeg and FFprobe installed and available in system PATH
- Node.js 18+ and npm
- Apache Web Server with mod_rewrite enabled

### Setup Steps

1. Clone the repository into your web server directory:
   ```bash
   git clone https://github.com/iharshraj1123/offline-youtube-browser-video-organizer.git youtube
   ```

2. Configure Apache to serve local media directories. Add alias directives to `httpd.conf` if your media resides on external drives:
   ```apache
   Alias "/d:" "D:/"
   Alias "/c:" "C:/"

   <Directory "D:/">
       Options Indexes FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   <Directory "C:/">
       Options Indexes FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   ```

3. Import the database schema:
   ```bash
   mysql -u root -p < schema.sql
   ```

4. Create and configure environment settings:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Configure `backend/.env` with your database connection details:
   ```ini
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=youtube-v2
   ```

5. Install dependencies and build the frontend application:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

6. Open your browser and navigate to your host address (for example, `http://localhost/youtube/` or `http://youtube.test/`).

## Keyboard Shortcuts

The following shortcuts are available when the main video player is focused:

| Key | Function |
|---|---|
| Space | Play / Pause |
| F | Toggle fullscreen |
| T | Toggle theater mode |
| N | Next video |
| P | Previous video |
| L | Toggle loop playback |
| R | Toggle random / queue playback |
| C | Toggle captions / subtitles |
| M | Toggle mute |
| Right / Left Arrow | Seek forward / backward 5 seconds |
| Up / Down Arrow | Increase / decrease volume 5% |
| < / > | Decrease / increase playback speed |
| Numpad 5 | Focus video player |

## Database Schema

| Table | Description |
|---|---|
| `video_metadatas` | Main video metadata, FFmpeg file specs, and stats |
| `category_pills` | Database-backed category pills and custom filter rules |
| `playlists` | User playlists and video sequence mappings |
| `users` | User accounts, profile settings, and karma scores |
| `comments` | Top-level video comments and media attachments |
| `replies` | Nested comment reply chains |
| `user_activity_votes` | Upvote and downvote records per user |
| `chats` | User-to-user direct messages |
| `exclusion_lists` | Privacy filtering rules and hidden content lists |

## License

This project is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).
