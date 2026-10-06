import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em dev, /api é repassado para o Spring Boot (sem problemas de CORS).
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080' } },
})
