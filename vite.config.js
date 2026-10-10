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

/*
 * Analytics, and ONLY in the build nginx serves.
 *
 * capacitor.config.json sets webDir to "dist", and `npm run sync` is literally
 * `npm run build && cap sync` -- so the exact bytes built here are copied into
 * ios/App/App/public and the Android assets. A <script> written into
 * index.html would therefore not be a web-only change: it would ship inside
 * the store binary, where Google Analytics is tracking under Apple's
 * definition and needs an ATT prompt or the app is rejected.
 *
 * That is not hypothetical on this box. Plyr2-Client removed its tag from the
 * web source and the stale copies under ios/ and android/ went on carrying the
 * measurement ID afterwards.
 *
 * So the tag is injected from an environment variable that only the web image
 * sets (Dockerfile runs `npm run build:web`). A plain `npm run build`, which is
 * what `sync` calls before `cap sync`, produces a dist with no tag. The default
 * is deliberately the safe one: forgetting the flag loses some web analytics,
 * whereas the opposite default ships tracking to the App Store.
 */
function analytics() {
  const id = process.env.WHEREFROM_GA_ID
  return {
    name: 'analytics-web-only',
    transformIndexHtml(html) {
      if (!id) return html
      return html.replace(
        '</head>',
        `    <!-- Google tag (gtag.js) - web build only, see vite.config.js -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', '${id}');
    </script>
  </head>`
      )
    },
  }
}

export default defineConfig({
  base,
  plugins: [
    react(),
    analytics(),
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
