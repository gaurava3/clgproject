"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, X, Check, AlertCircle } from "lucide-react"

export default function NotificationManager() {
  const [showPermissionRequest, setShowPermissionRequest] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)

  useEffect(() => {
    // Check current notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)

      // Show permission request if not granted or denied
      if (Notification.permission === "default") {
        // Delay showing the request to avoid overwhelming users immediately
        const timer = setTimeout(() => {
          setShowPermissionRequest(true)
        }, 2000)

        return () => clearTimeout(timer)
      }
    }
  }, [])

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          console.log("[v0] Service Worker is ready:", registration.scope)
          setIsServiceWorkerReady(true)
        })
        .catch((error) => {
          console.warn("[v0] Service Worker not available:", error)
          setIsServiceWorkerReady(false)
        })
    }
  }, [])

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        setShowPermissionRequest(false)

        if (permission === "granted") {
          // Show a welcome notification
          const notification = new Notification("Notifications Enabled!", {
            body: "You will now receive notifications for new notices.",
            icon: "/favicon.ico",
            tag: "welcome-notification",
            silent: false,
          })

          // Auto-close after 4 seconds
          setTimeout(() => {
            notification.close()
          }, 4000)

          notification.onclick = () => {
            window.focus()
            notification.close()
          }
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error)
        setShowPermissionRequest(false)
      }
    }
  }

  const dismissPermissionRequest = () => {
    setShowPermissionRequest(false)
    // Don't show again for this session
    sessionStorage.setItem("notificationRequestDismissed", "true")
  }

  // Don't show if already dismissed in this session
  if (sessionStorage.getItem("notificationRequestDismissed")) {
    return null
  }

  if (!showPermissionRequest || notificationPermission !== "default") {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <Bell className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Enable Notifications</span>
                  {isServiceWorkerReady && <Check className="h-4 w-4 text-secondary" />}
                </CardTitle>
                <CardDescription>Get notified instantly when new notices are posted</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={dismissPermissionRequest}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground mb-1">Why enable notifications?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Stay updated with important announcements</li>
                  <li>• Receive alerts even when the app is closed</li>
                  <li>• Never miss critical information</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={requestNotificationPermission} className="flex-1">
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
              <Button variant="outline" onClick={dismissPermissionRequest} className="flex-1 bg-transparent">
                Maybe Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
