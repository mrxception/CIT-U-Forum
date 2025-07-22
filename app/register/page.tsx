"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: number
  name: string
  college_name: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    courses: [] as number[],
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Passwords do not match",
      })
      setLoading(false)
      return
    }

    if (formData.courses.length === 0) {
      setError("Please select at least one course")
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Please select at least one course",
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          courses: formData.courses,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: `Welcome to CIT-U Forum, ${data.user.username}!`,
        })
        router.push("/")
        router.refresh()
      } else {
        setError(data.error || "Registration failed")
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.error || "Registration failed",
        })
      }
    } catch (error) {
      setError("Network error. Please try again.")
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "Network error. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCourseChange = (courseId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      courses: checked ? [...prev.courses, courseId] : prev.courses.filter((id) => id !== courseId),
    }))
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <img src="/cit.png" alt="CIT Logo" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join CIT-U Forum</CardTitle>
            <CardDescription>Connect with your fellow students and join course discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="your.email@cit.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Select Your Courses</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Choose the courses you're enrolled in to access relevant forums
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
                              checked={formData.courses.includes(course.id)}
                              onCheckedChange={(checked) => handleCourseChange(course.id, checked as boolean)}
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
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
