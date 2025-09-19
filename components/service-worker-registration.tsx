"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Wait for the page to load completely
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            type: "classic",
          })

          console.log("[v0] Service Worker registered successfully:", registration.scope)

          // Handle service worker updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[v0] New service worker available")
                }
              })
            }
          })

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data && event.data.type === "HIGHLIGHT_NOTICE") {
              const noticeElement = document.getElementById(`notice-${event.data.noticeId}`)
              if (noticeElement) {
                noticeElement.scrollIntoView({ behavior: "smooth" })
                noticeElement.classList.add("ring-2", "ring-primary", "shadow-lg")
                setTimeout(() => {
                  noticeElement.classList.remove("ring-2", "ring-primary", "shadow-lg")
                }, 3000)
              }
            }
          })
        } catch (error) {
          console.warn("[v0] Service Worker registration failed:", error)

          // Check if it's a MIME type error (common in development)
          if (error instanceof Error && error.message.includes("MIME type")) {
            console.warn("[v0] Service Worker MIME type error - this is common in development environments")
          }

          // App continues to work without service worker
        }
      }

      // Register after page load to avoid blocking
      if (document.readyState === "complete") {
        registerSW()
      } else {
        window.addEventListener("load", registerSW)
        return () => window.removeEventListener("load", registerSW)
      }
    }
  }, [])

  return null // This component doesn't render anything
}
