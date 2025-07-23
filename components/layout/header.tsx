"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { User, Settings, LogOut, ChevronDown, ArrowLeft } from "lucide-react"
import { RoleBadge } from "@/components/ui/role-badge"

interface AppUser {
  id: number
  username: string
  avatar: string
  role_name: string
  banned: boolean
}

export default function Header() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    remember: false,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    fetchUser()
  }, [pathname])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchUser()
        setLoginForm({ username: "", password: "", remember: false })
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.username}!`,
        })
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.error || "Invalid credentials",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Network error. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <div className="bg-white border border-gray-300">
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {pathname !== "/" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 sm:w-auto text-xs px-1 sm:px-2"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded flex items-center justify-center">
                  <img src="/cit.png" alt="CIT Logo" />
                </div>
                <span className="font-bold text-lg text-gray-900">CIT-U Forum</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {/* Hide Avatar on mobile, show on sm and above */}
                  <div className="hidden sm:flex">
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src={
                          user.avatar && user.avatar !== "/placeholder.svg?height=40&width=40" ? user.avatar : undefined
                        }
                        alt={user.username}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="hidden sm:inline text-sm text-gray-900">
                      Welcome, <strong>{user.username}</strong>
                    </span>
                    <RoleBadge roleName={user.role_name} isBanned={user.banned} />
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/user/${user.id}`}>
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <div className="flex sm:hidden items-center space-x-2">
                  <Button
                    asChild
                    size="sm"
                    disabled={loading}
                    className="h-6 text-xs px-2"
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    className="h-6 text-xs px-2"
                  >
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
                <div className="hidden sm:flex items-center space-x-4">
                  <form onSubmit={handleLogin} className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <label className="text-sm text-gray-900">User Name:</label>
                      <Input
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                        className="w-24 h-6 text-xs"
                        placeholder="Username"
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <label className="text-sm text-gray-900">Password:</label>
                      <Input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                        className="w-24 h-6 text-xs"
                        placeholder="••••••••••••"
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox
                        id="remember"
                        checked={loginForm.remember}
                        onCheckedChange={(checked) => setLoginForm((prev) => ({ ...prev, remember: checked as boolean }))}
                      />
                      <label htmlFor="remember" className="text-xs text-gray-900">
                        Remember Me?
                      </label>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={loading}
                      className="h-6 text-xs px-2"
                    >
                      Log in
                    </Button>
                  </form>
                  <div className="border-l border-gray-300 pl-4">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      className="h-6 text-xs px-2"
                    >
                      <Link href="/register">Register</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-300 px-4 py-3">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-700">
          <p>
            CIT-U Forum is a platform dedicated to academic collaboration and student discussion. Our forum provides
            access to course-specific discussions, study resources, and a community of students and faculty.
            {!user && (
              <>
                {" "}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                  Create a free account
                </Link>{" "}
                to unlock all features and join the academic community.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}