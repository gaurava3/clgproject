"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, LogOut, Bell, Calendar, User, Settings } from "lucide-react"

interface Notice {
  id: string
  title: string
  description: string
  timestamp: string
  author: string
  isNew?: boolean
}

interface AdminPanelProps {
  notices: Notice[]
  onAddNotice: (notice: Omit<Notice, "id" | "timestamp">) => void
  onUpdateNotice: (id: string, notice: Partial<Notice>) => void
  onDeleteNotice: (id: string) => void
  onLogout: () => void
}

export default function AdminPanel({
  notices,
  onAddNotice,
  onUpdateNotice,
  onDeleteNotice,
  onLogout,
}: AdminPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "Admin",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingNotice) {
      // Update existing notice
      onUpdateNotice(editingNotice.id, {
        ...formData,
        isNew: false, // Remove new badge when editing
      })
      setEditingNotice(null)
    } else {
      // Add new notice
      onAddNotice(formData)
      setShowAddDialog(false)
    }

    // Reset form
    setFormData({
      title: "",
      description: "",
      author: "Admin",
    })
  }

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title,
      description: notice.description,
      author: notice.author,
    })
  }

  const handleCancelEdit = () => {
    setEditingNotice(null)
    setFormData({
      title: "",
      description: "",
      author: "Admin",
    })
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

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-primary text-primary-foreground border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-foreground/20 rounded-lg p-2">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-primary-foreground/80 text-sm">Digital Notice Board Management</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="secondary" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Notices</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {notices.filter((n) => n.isNew).length}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{notices.filter((n) => n.isNew).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Update</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {notices.length > 0 ? formatDate(notices[0].timestamp) : "No notices"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Manage Notices</h2>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Notice</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Notice</DialogTitle>
                <DialogDescription>Create a new notice that will be visible to all users.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter notice title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter notice description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Add Notice
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notices List */}
        {notices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notices created</h3>
              <p className="text-muted-foreground mb-4">Start by creating your first notice.</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Notice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <Card key={notice.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                        {notice.isNew && <Badge variant="secondary">New</Badge>}
                      </div>
                      <CardDescription className="text-pretty leading-relaxed">{notice.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(notice)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this notice? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteNotice(notice.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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

      {/* Edit Notice Dialog */}
      {editingNotice && (
        <Dialog open={!!editingNotice} onOpenChange={() => handleCancelEdit()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Notice</DialogTitle>
              <DialogDescription>Update the notice information.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter notice title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter notice description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-author">Author</Label>
                <Input
                  id="edit-author"
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                  required
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  Update Notice
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
