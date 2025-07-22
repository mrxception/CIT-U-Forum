"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: number
  name: string
  college_name: string
  college_id: number
}

export default function NewThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const [courseId, setCourseId] = useState<string>("")
  const [course, setCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const getCourseId = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
      fetchCourse(resolvedParams.id)
    }
    getCourseId()
  }, [params])

  const fetchCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`)
      if (response.ok) {
        const courseData = await response.json()
        setCourse(courseData)
      } else {
        setError("Course not found")
      }
    } catch (error) {
      setError("Error loading course")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required")
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: Number.parseInt(courseId),
          title: formData.title.trim(),
          content: formData.content.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Thread Created",
          description: "Your thread has been created successfully!",
        })
        router.replace(`/thread/${data.threadId}`)
      } else {
        if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please log in to create a thread.",
          })
          router.push("/login")
        } else {
          setError(data.error || "Failed to create thread")
        }
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Course not found or you don't have access to it.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        {" > "}
        <Link href="/forums" className="hover:text-blue-600">
          Forums
        </Link>
        {" > "}
        <Link href={`/college/${course.college_id}`} className="hover:text-blue-600">
          {course.college_name}
        </Link>
        {" > "}
        <Link href={`/course/${course.id}`} className="hover:text-blue-600">
          {course.name}
        </Link>
        {" > "}
        <span className="font-medium">New Thread</span>
      </div>

      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/course/${courseId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {course.name}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Thread in {course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="title">Thread Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1"
                placeholder="Enter a descriptive title for your thread"
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/255 characters</p>
            </div>

            <div>
              <Label htmlFor="content">Thread Content</Label>
              <Textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                className="mt-1 min-h-[200px]"
                placeholder="Write your thread content here. Be descriptive and provide context for other students."
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Use clear formatting and provide relevant details to help other students understand your topic.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Course:</strong> {course.name}
                </p>
                <p>
                  <strong>College:</strong> {course.college_name}
                </p>
              </div>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/course/${courseId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Thread"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Thread Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="space-y-2">
            <li>• Use a clear, descriptive title that summarizes your topic</li>
            <li>• Provide enough context so other students can understand and help</li>
            <li>• Search existing threads before creating a new one</li>
            <li>• Be respectful and follow academic integrity guidelines</li>
            <li>• Include relevant course materials or references when helpful</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
