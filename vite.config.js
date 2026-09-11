import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Capacitor serves the build from a file:// origin, so nothing may be
  // requested from an absolute path.
  base: './',
  build: { outDir: 'dist' },
  test: { environment: 'node', include: ['src/**/*.test.js'] },
})
