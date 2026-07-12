import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for built assets so it works perfectly in Apache subdirectories
  base: './',
  build: {
    // Output directly to the parent directory (youtube) so Apache can serve it
    outDir: '../',
    // Do NOT delete files in the parent directory during build because it contains our PHP api/ files!
    emptyOutDir: false,
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
