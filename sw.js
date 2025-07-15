const CACHE_NAME = 'cricstreamzone-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js',
  'https://cdn.onesignal.com/sdks/OneSignalSDK.js'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Background sync for notifications
self.addEventListener('sync', function(event) {
  if (event.tag === 'notification-check') {
    event.waitUntil(checkNotificationsInBackground());
  }
});

// Background notification check
async function checkNotificationsInBackground() {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxZfHUGsH19x3hZp5eeo3tEMJuQxvOPHpyS_LAqow4rlBciyrhP0NdaI2NzeZiyA5SF9A/exec');
    const data = await response.json();
    const matches = data.matches || [];
    
    const now = new Date();
    
    matches.forEach(match => {
      const matchTime = new Date(match.MatchTime);
      const timeDiff = matchTime - now;
      const matchTitle = `${match.Team1} vs ${match.Team2}`;
      
      // Check for notification triggers
      if (timeDiff > 14 * 60 * 1000 && timeDiff <= 15 * 60 * 1000) {
        self.registration.showNotification('⏰ Match Starting Soon!', {
          body: `${matchTitle} starts in 15 minutes. Get ready! 🏏`,
          icon: match.Team1Logo || 'https://i.postimg.cc/3rPWWckN/icon-192.png',
          badge: 'https://i.postimg.cc/3rPWWckN/icon-192.png',
          vibrate: [200, 100, 200],
          tag: `match-15min-${match.Team1}-${match.Team2}`
        });
      }
      
      if (timeDiff > 4 * 60 * 1000 && timeDiff <= 5 * 60 * 1000) {
        self.registration.showNotification('🚨 Match Alert!', {
          body: `${matchTitle} starts in 5 minutes! Don't miss it! ⚡`,
          icon: match.Team1Logo || 'https://i.postimg.cc/3rPWWckN/icon-192.png',
          badge: 'https://i.postimg.cc/3rPWWckN/icon-192.png',
          vibrate: [300, 200, 300, 200, 300],
          tag: `match-5min-${match.Team1}-${match.Team2}`
        });
      }
    });
  } catch (error) {
    console.error('Background notification check failed:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Skip waiting
self.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
