import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // proxy: {
    //   '/api': {
    //     target: `${import.meta.env.VITE_API_BASE_URL}`,
    //     changeOrigin: true,
    //     secure: false
    //   }
    // }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 