import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Add-to-home-screen support. Only in the production build and only over HTTPS
// (or localhost) — browsers refuse to install a service worker otherwise, so the
// site still works perfectly without it.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* installable features are optional; never break the page over this */
    })
  })
}
