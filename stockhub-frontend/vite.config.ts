import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      // Proxy all /api calls to the backend.
      // 'secure: false' is the key — it tells Vite's proxy to accept
      // the self-signed ASP.NET Core dev certificate without throwing errors.
      '/api': {
        target: 'https://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
