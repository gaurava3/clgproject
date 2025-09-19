"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone, Monitor } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 10000) // Show after 10 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      console.log("PWA was installed")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }

      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error("Error during installation:", error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for 24 hours
    localStorage.setItem("pwaInstallDismissed", Date.now().toString())
  }

  // Don't show if dismissed recently
  const dismissedTime = localStorage.getItem("pwaInstallDismissed")
  if (dismissedTime && Date.now() - Number.parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null
  }

  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <Download className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm">Install App</CardTitle>
                <CardDescription className="text-xs">Get the full experience</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              <span>Works offline</span>
              <Monitor className="h-3 w-3 ml-2" />
              <span>Fast loading</span>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleInstallClick} size="sm" className="flex-1 text-xs">
                Install
              </Button>
              <Button variant="outline" onClick={handleDismiss} size="sm" className="flex-1 text-xs bg-transparent">
                Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
