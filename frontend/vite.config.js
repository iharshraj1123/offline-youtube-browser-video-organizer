import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for built assets so it works perfectly in Apache subdirectories
  base: './',
  build: {
    // Output directly to the public directory so Apache can serve it
    outDir: '../public',
    // Clean public directory before build to keep old assets from piling up
    emptyOutDir: true,
  },
  server: {
    // Configure proxy during development so local React calls to /api/ reach XAMPP Apache
    proxy: {
      '/api': {
        target: 'http://localhost/youtube',
        changeOrigin: true,
      }
    }
  }
})
