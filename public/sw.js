// Service Worker for background notifications and PWA functionality
const CACHE_NAME = "notice-board-v1"
const urlsToCache = ["/", "/manifest.json", "/favicon.ico"]

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  event.waitUntil(self.clients.claim())
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification)
  event.notification.close()

  const noticeId = event.notification.data?.noticeId

  // Focus or open the app window
  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        // If a window is already open, focus it and send message
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.focus()
            if (noticeId) {
              client.postMessage({
                type: "HIGHLIGHT_NOTICE",
                noticeId: noticeId,
              })
            }
            return
          }
        }
        // Otherwise, open a new window
        return self.clients.openWindow("/")
      }),
  )
})

// Handle push notifications (for future server-sent notifications)
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event)

  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || "New notice available",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "notice-notification",
      data: data.data || {},
      actions: [
        {
          action: "view",
          title: "View Notice",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200],
    }

    event.waitUntil(self.registration.showNotification(data.title || "New Notice", options))
  }
})

// Handle notification action clicks
self.addEventListener("notificationactionclick", (event) => {
  console.log("Notification action clicked:", event.action)
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(self.clients.openWindow("/"))
  }
  // 'dismiss' action just closes the notification
})

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
