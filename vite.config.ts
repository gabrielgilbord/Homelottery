import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

/**
 * Offline-first service worker, generated at build time.
 * It precaches EVERY file of the build (html, js, css, all font files, icons, manifest)
 * on the first visit, so the app opens with zero network afterwards.
 */
function offlineServiceWorker(): Plugin {
  return {
    name: 'homelottery-offline-sw',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const built = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const publicFiles = readdirSync('public').filter((f) => !f.startsWith('.'));
      const files = [...new Set(['index.html', ...built, ...publicFiles])].sort();
      const version = createHash('sha256').update(files.join('|')).digest('hex').slice(0, 12);
      const source = `/* HOMELOTTERY offline service worker · build ${version} (generated, do not edit) */
const CACHE = 'homelottery-${version}';
const PRECACHE = ${JSON.stringify(files.map((f) => './' + f))};
const INDEX = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('homelottery') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Page loads: try the network briefly (to pick up a new version), otherwise the cached app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      withTimeout(fetch(req), 3000)
        .then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(INDEX, copy)); }
          return res && res.ok ? res : caches.match(INDEX);
        })
        .catch(() => caches.match(INDEX))
    );
    return;
  }

  // Everything else (hashed assets, fonts, icons, manifest): cache first, network as a fallback.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// base './' => works on Vercel, Netlify, GitHub Pages subpaths or any static server.
export default defineConfig({
  plugins: [react(), offlineServiceWorker()],
  base: './',
});
