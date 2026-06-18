import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit (default 500KB) to 1500KB
    chunkSizeWarningLimit: 1500,
  },
})
