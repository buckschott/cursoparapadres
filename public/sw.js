// =============================================================================
// SERVICE WORKER - MINIMAL PWA SUPPORT
// =============================================================================
// Path: /public/sw.js
// Purpose: Enables PWA installability (Add to Home Screen / Add to Dock)
// =============================================================================

// Version for cache busting
const SW_VERSION = '1.0.0';

// Install event - minimal, just activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - pass through to network (no caching)
// Admin panel should always show fresh data
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
