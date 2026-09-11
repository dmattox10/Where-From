import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/*
 * Two places this gets served from, and they disagree about paths.
 *
 * GitHub Pages puts a project site in a subdirectory, so it needs an absolute
 * base. Capacitor serves the same build from file://, where nothing may be
 * asked for by absolute path at all. The Pages workflow sets GITHUB_PAGES.
 */
const base = process.env.GITHUB_PAGES ? '/Where-From/' : './'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered by hand in main.jsx, because a service worker cannot be
      // registered over file:// and the native build is served that way.
      injectRegister: null,
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Where From',
        short_name: 'Where From',
        description: "An on-the-go 'Welcome To' deck.",
        theme_color: '#17140F',
        background_color: '#17140F',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // woff2 is not in the default list, and losing the typeface offline
        // would be a silent fallback to a system font.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  build: { outDir: 'dist' },
  test: { environment: 'node', include: ['src/**/*.test.js'] },
})
