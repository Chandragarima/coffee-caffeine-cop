// Run this in your browser console to clear service worker cache
// Open DevTools (F12) -> Console tab -> paste and run this code

console.log('Clearing service worker cache...');

// Unregister all service workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    console.log('Unregistering service worker:', registration.scope);
    registration.unregister();
  }
});

// Clear all caches
caches.keys().then(function(cacheNames) {
  return Promise.all(
    cacheNames.map(function(cacheName) {
      console.log('Deleting cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
}).then(function() {
  console.log('All caches cleared! Refresh the page.');
});

// Clear localStorage items related to PWA
Object.keys(localStorage).forEach(key => {
  if (key.includes('coffeepolice') || key.includes('install')) {
    console.log('Removing localStorage item:', key);
    localStorage.removeItem(key);
  }
});

console.log('Done! Please refresh the page.');
