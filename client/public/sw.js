/* Suraj Kumar — portfolio service worker.
 *
 * Goal: make the site feel like an app when it is added to the home screen —
 * instant repeat loads and a usable offline shell — WITHOUT ever touching the
 * private dashboard or the API.
 *
 * Rules:
 *   1. Never cache or intercept /api/* or any non-GET / cross-origin request.
 *   2. Navigation is always network-first, so the dashboard and any fresh HTML
 *      always come straight from the server (only "/" falls back to cache offline).
 *   3. Only hashed build assets, icons and images are cached.
 */

const CACHE = 'sk-portfolio-v1'

const SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/og.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

// hashed build output + our own icons: safe to serve straight from cache
const IMMUTABLE = /^\/(assets|icons)\//
// images that can be replaced by the owner: serve cache, refresh in background
const MEDIA = /^\/(projects|gallery)\/|\.(jpg|jpeg|png|svg|webp|gif|ico)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await Promise.all(
        SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null))
      )
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      await self.clients.claim()
    })()
  )
})

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (res && res.ok) cache.put(request, res.clone())
  return res
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone())
      return res
    })
    .catch(() => null)
  return hit || (await network) || Response.error()
}

async function navigation(request, url) {
  try {
    return await fetch(request)
  } catch (err) {
    // offline: only the public home page gets the cached shell. Every other
    // route (including the private dashboard) fails honestly instead of being
    // replaced by a cached page.
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const cache = await caches.open(CACHE)
      const cached = await cache.match('/')
      if (cached) return cached
    }
    throw err
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.endsWith('/sw.js')) return

  if (request.mode === 'navigate') {
    event.respondWith(navigation(request, url))
    return
  }
  if (IMMUTABLE.test(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }
  if (MEDIA.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})
