import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Sibling apps in this repo already use 5173 and 5174.
  server: {
    port: 5175,
    strictPort: true,
    // The Express API (server/index.js) talks to Neon; the browser never sees DATABASE_URL.
    proxy: { '/api': 'http://localhost:8787' },
  },
})
