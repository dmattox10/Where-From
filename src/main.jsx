import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/outfit'
import './styles/app.css'
import App from './App.jsx'

/*
 * Take a copy of the app on first visit so later ones never touch the network.
 * A phone at a table has no signal to spare, and a web view that iOS discarded
 * while the screen was off comes back as a cold load — which must not be a
 * blank page.
 *
 * file:// has no service workers, so the native build skips this.
 */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {
      /* offline caching is a bonus; the app runs without it */
    })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
