"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, User, Settings } from "lucide-react"
import AdminLogin from "@/components/admin-login"
import AdminPanel from "@/components/admin-panel"
import NotificationManager from "@/components/notification-manager"
import PWAInstallPrompt from "@/components/pwa-install-prompt"

interface Notice {
  id: string
  title: string
  description: string
  timestamp: string
  author: string
  isNew?: boolean
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [highlightedNotice, setHighlightedNotice] = useState<string | null>(null)

  // Load notices from localStorage on mount
  useEffect(() => {
    const savedNotices = localStorage.getItem("notices")
    if (savedNotices) {
      setNotices(JSON.parse(savedNotices))
    }
  }, [])

  // Save notices to localStorage whenever notices change
  useEffect(() => {
    localStorage.setItem("notices", JSON.stringify(notices))
  }, [notices])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("admin") === "true") {
      setShowLogin(true)
    }
  }, [])

  const addNotice = (notice: Omit<Notice, "id" | "timestamp">) => {
    const newNotice: Notice = {
      ...notice,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isNew: true,
    }
    setNotices((prev) => [newNotice, ...prev])

    // Send notification to all users with enhanced features
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification("📢 New Notice Posted!", {
          body: `${notice.title}\n\nBy: ${notice.author}`,
          icon: "/favicon.ico",
          tag: `notice-${newNotice.id}`,
          data: {
            noticeId: newNotice.id,
            timestamp: newNotice.timestamp,
            author: notice.author,
          },
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200], // Vibration pattern for mobile devices
        })

        // Handle notification click
        notification.onclick = () => {
          window.focus()
          setHighlightedNotice(newNotice.id)
          notification.close()

          // Scroll to the notice and highlight it
          setTimeout(() => {
            const noticeElement = document.getElementById(`notice-${newNotice.id}`)
            if (noticeElement) {
              noticeElement.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }, 100)
        }

        // Auto-close notification after 8 seconds
        setTimeout(() => {
          notification.close()
        }, 8000)
      } catch (error) {
        console.error("Error showing notification:", error)
      }
    }

    // Clear new badge after 30 seconds
    setTimeout(() => {
      setNotices((prev) => prev.map((n) => (n.id === newNotice.id ? { ...n, isNew: false } : n)))
    }, 30000)
  }

  const updateNotice = (id: string, updatedNotice: Partial<Notice>) => {
    setNotices((prev) => prev.map((notice) => (notice.id === id ? { ...notice, ...updatedNotice } : notice)))
  }

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((notice) => notice.id !== id))
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Clear highlight after 5 seconds
  useEffect(() => {
    if (highlightedNotice) {
      const timer = setTimeout(() => {
        setHighlightedNotice(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [highlightedNotice])

  if (isAdmin) {
    return (
      <AdminPanel
        notices={notices}
        onAddNotice={addNotice}
        onUpdateNotice={updateNotice}
        onDeleteNotice={deleteNotice}
        onLogout={() => setIsAdmin(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NotificationManager />
      <PWAInstallPrompt />

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <Bell className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Digital Notice Board</h1>
            </div>
            <Button onClick={() => setShowLogin(true)} variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Admin Login</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Latest Notices</h2>
          <p className="text-muted-foreground">Stay updated with the latest announcements and information</p>
        </div>

        {notices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notices yet</h3>
              <p className="text-muted-foreground">Check back later for updates and announcements.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice) => (
              <Card
                key={notice.id}
                id={`notice-${notice.id}`}
                className={`transition-all duration-300 hover:shadow-lg ${
                  highlightedNotice === notice.id ? "ring-2 ring-primary shadow-lg" : ""
                } ${notice.isNew ? "border-primary" : ""}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-balance">{notice.title}</CardTitle>
                    {notice.isNew && (
                      <Badge variant="secondary" className="ml-2">
                        New
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-pretty leading-relaxed">{notice.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{notice.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(notice.timestamp)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      {showLogin && (
        <AdminLogin
          onLogin={() => {
            setIsAdmin(true)
            setShowLogin(false)
          }}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  )
}
