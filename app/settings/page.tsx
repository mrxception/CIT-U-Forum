"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Save, User, Lock, BookOpen, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: number
  name: string
  college_name: string
  enrolled: boolean
}

interface UserData {
  id: number
  username: string
  email: string
  avatar: string
}

function SettingsContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    avatar: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 2

  useEffect(() => {
    fetchUserData()
    fetchCourses()
  }, [])

  useEffect(() => {
    if (!loading && isAuthenticated === false && user === null && retryCount >= maxRetries) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "Please log in to access settings.",
      })
      router.push("/login")
    }
  }, [loading, isAuthenticated, user, router, toast, retryCount])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })
      console.log("fetchUserData response:", {
        status: response.status,
        statusText: response.statusText,
        cookies: document.cookie, // Log client-side cookies
      })
      if (response.ok) {
        const userData = await response.json()
        console.log("fetchUserData userData:", userData)
        setUser(userData)
        setProfileForm({
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar || "",
        })
        setIsAuthenticated(true)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("fetchUserData failed:", { status: response.status, error: errorData.error || "Unknown error" })
        if (response.status === 401 && retryCount < maxRetries) {
          // Retry on 401 (e.g., transient cookie issue)
          setRetryCount((prev) => prev + 1)
          setTimeout(fetchUserData, 1000) // Retry after 1s
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    } catch (error) {
      console.error("fetchUserData error:", error)
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1)
        setTimeout(fetchUserData, 1000)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setError("Network error. Please try again.")
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Failed to fetch user data. Please try again.",
        })
      }
    }
  }

  const fetchCourses = async () => {
    try {
      const [coursesResponse, userCoursesResponse] = await Promise.all([
        fetch("/api/courses", { credentials: "include" }),
        fetch("/api/user/courses", { credentials: "include" }),
      ])

      if (coursesResponse.ok && userCoursesResponse.ok) {
        const allCourses = await coursesResponse.json()
        const userCourses = await userCoursesResponse.json()
        const userCourseIds = userCourses.map((c: any) => c.course_id)

        const coursesWithEnrollment = allCourses.map((course: any) => ({
          ...course,
          enrolled: userCourseIds.includes(course.id),
        }))

        setCourses(coursesWithEnrollment)
        setSelectedCourses(userCourseIds)
      } else {
        console.error("fetchCourses failed:", {
          coursesStatus: coursesResponse.status,
          userCoursesStatus: userCoursesResponse.status,
        })
        setError("Failed to fetch courses.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch courses.",
        })
      }
    } catch (error) {
      console.error("fetchCourses error:", error)
      setError("Network error fetching courses.")
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to fetch courses.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select an image file",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Image must be less than 5MB",
      })
      return
    }

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        setProfileForm((prev) => ({ ...prev, avatar: data.url }))
        setUser((prev) => (prev ? { ...prev, avatar: data.url } : null))
        setMessage("Avatar uploaded and updated successfully!")
        toast({
          title: "Success",
          description: "Avatar uploaded and updated successfully!",
        })

        e.target.value = ""

        setTimeout(() => {
          fetchUserData()
        }, 1000)
      } else {
        setError(data.error || "Upload failed")
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: data.error || "Upload failed",
        })
      }
    } catch (error) {
      setError("Network error during upload")
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Network error during upload",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarUpdate = async () => {
    if (!profileForm.avatar || !profileForm.avatar.trim()) {
      setError("Please enter an avatar URL")
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter an avatar URL",
      })
      return
    }

    try {
      new URL(profileForm.avatar)
    } catch {
      setError("Please enter a valid URL")
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid URL",
      })
      return
    }

    setSaving(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: profileForm.avatar }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Avatar updated successfully!")
        setUser((prev) => (prev ? { ...prev, avatar: data.avatar } : null))
        toast({
          title: "Success",
          description: "Avatar updated successfully!",
        })

        setTimeout(() => {
          fetchUserData()
        }, 1000)
      } else {
        setError(data.error || "Failed to update avatar")
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: data.error || "Failed to update avatar",
        })
      }
    } catch (error) {
      setError("Network error. Please try again.")
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Network error. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match")
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New passwords do not match",
      })
      setSaving(false)
      return
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Password updated successfully!")
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        toast({
          title: "Success",
          description: "Password updated successfully!",
        })
      } else {
        setError(data.error || "Failed to update password")
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: data.error || "Failed to update password",
        })
      }
    } catch (error) {
      setError("Network error. Please try again.")
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Network error. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCoursesUpdate = async () => {
    setSaving(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/user/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: selectedCourses }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Course enrollment updated successfully!")
        toast({
          title: "Success",
          description: "Course enrollment updated successfully!",
        })
      } else {
        setError(data.error || "Failed to update courses")
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: data.error || "Failed to update courses",
        })
      }
    } catch (error) {
      setError("Network error. Please try again.")
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Network error. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCourseToggle = (courseId: number, enrolled: boolean) => {
    setSelectedCourses((prev) => (enrolled ? [...prev, courseId] : prev.filter((id) => id !== courseId)))
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  const coursesByCollege = courses.reduce(
    (acc, course) => {
      if (!acc[course.college_name]) {
        acc[course.college_name] = []
      }
      acc[course.college_name].push(course)
      return acc
    },
    {} as Record<string, Course[]>,
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your profile, password, and course enrollments</p>
      </div>

      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileForm.avatar || "/placeholder.svg"} alt={profileForm.username} />
                    <AvatarFallback className="text-xl bg-blue-600 text-white font-bold">
                      {getInitials(profileForm.username)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="avatar">Avatar URL (Optional)</Label>
                  <Input
                    id="avatar"
                    type="url"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg or upload an image"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can upload an image using the camera button or paste a URL here
                  </p>
                  <Button onClick={handleAvatarUpdate} disabled={saving || uploading} className="mt-2">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Avatar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" value={profileForm.username} className="mt-1 bg-gray-50" readOnly />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profileForm.email} className="mt-1 bg-gray-50" readOnly />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword} // Fixed: was incorrectly using currentPassword
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Course Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Select the courses you're enrolled in to access relevant forums and discussions.
              </p>

              <div className="space-y-4 max-h-64 overflow-y-auto border rounded-lg p-4">
                {Object.entries(coursesByCollege).map(([collegeName, collegeCourses]) => (
                  <div key={collegeName}>
                    <h4 className="font-medium text-gray-900 mb-2">{collegeName}</h4>
                    <div className="grid grid-cols-2 gap-2 ml-4">
                      {collegeCourses.map((course) => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`course-${course.id}`}
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={(checked) => handleCourseToggle(course.id, checked as boolean)}
                          />
                          <Label htmlFor={`course-${course.id}`} className="text-sm cursor-pointer">
                            {course.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleCoursesUpdate} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Enrollment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-500">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  )
}