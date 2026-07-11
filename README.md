# Offline YouTube Browser & Video Organizer (YouTube-v2)

<img width="1912" height="967" alt="image" src="https://github.com/user-attachments/assets/dac41d5a-d97a-417b-ac3e-a087c51e432f" />

<img width="1915" height="922" alt="image" src="https://github.com/user-attachments/assets/8552707e-6b96-458a-98c1-6f83fdd378ad" />

<img width="1910" height="917" alt="image" src="https://github.com/user-attachments/assets/c007a1d0-8bc3-4326-9b00-8bdb6e80309a" />


A fast, standalone, and premium offline video player, library indexer, and custom social space. Built with React, Vite, PHP, and MySQL, this application scans local directories for video files, extracts rich technical metadata and thumbnail preview frames using FFmpeg, and presents them in a modern, glassmorphic dark-theme YouTube-clone interface.

## 🚀 Key Features

*   **Zero-Latency Custom HTML5 Player**: Fully custom controls, theater mode, double-click fast-forward, speed controls (0.25x - 2x), custom timeline hovers, and volume state persistence.
*   **Debounced Autoplay Hover Previews**: Hovering over homepage video cards for `400ms` initiates a silent, looped, inline preview play of the video stream, with smooth overlay fade transitions.
*   **Collapsible Nested Comments Section**: Fast, native comments and nested replies. Includes a plain-text emote parser (`:emote:`), timestamp seek links (e.g. `0:10` video seeking), user cards on hover, and reputation karma votes.
*   **Media Attachments**: Users can attach local image, GIF, or video files (or external URLs) directly to their comments and replies.
*   **Native Profiles & Channel Settings**: Customizable profile pages (`?page=profile&user=username`) featuring Joined Date, reputation score, bio descriptions, upload grids, and interactive comment history timelines. Account owners can upload avatars and customize channel names, descriptions, and passwords.
*   **Batch Thumbnail Extraction**: Server-side FFmpeg bulk thumbnail generator that processes assets in small batches controlled by frontend recursion to avoid PHP timeout errors and CPU stutters.
*   **Glassmorphic Modern Design**: Sleek typography, dark mode palettes, smooth micro-animations, custom-styled growing inputs, and floating mini-player.

## 🛠️ Technology Stack

*   **Frontend**: React 18, Vite, Vanilla CSS (Custom Design System), Lucide Icons, Rolldown.
*   **Backend**: PHP 7.4+ (PDO connection wrapper).
*   **Database**: MySQL / MariaDB (utf8mb4 encoding).
*   **Extractor**: FFmpeg / FFprobe.

## 💻 Installation & Setup

1.  **Environment Setup**: Install [XAMPP](https://www.apachefriends.org/) or any local server stack with Apache, PHP, and MySQL. Ensure **FFmpeg** is installed on your system and added to your system environment variables (`PATH`).
2.  **Clone / Copy**: Extract this repository directly to your Apache server root folder: `C:\xampp\htdocs\youtube-v2\`.
3.  **Database Configuration**:
    *   Create a MySQL database named `youtube-v2`.
    *   Import the [schema.sql](file:///c:/xampp/htdocs/youtube-v2/schema.sql) file structure.
    *   Configure your database host, username, and password in [api/db.php](file:///c:/xampp/htdocs/youtube-v2/api/db.php).
4.  **Frontend Compilation**:
    *   Open terminal in the frontend source directory:
        ```bash
        cd src-frontend
        npm install
        npm run build
        ```
    *   Vite compiles and outputs the production bundle directly to the parent directory (`../`), serving it via Apache.
5.  **Run Application**:
    *   Start Apache and MySQL from XAMPP Control Panel.
    *   Visit `http://localhost/youtube-v2/` in your browser.
