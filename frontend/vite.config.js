import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
	target: 'http://localhost:8000',
//        target: 'https://dermaai-c4d9.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
