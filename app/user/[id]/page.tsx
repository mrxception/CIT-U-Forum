import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Calendar, Award, BookOpen, Eye, Users } from "lucide-react"
import { getUserById, verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"
import pool from "@/lib/db"
import Link from "next/link"
import { RoleBadge } from "@/components/ui/role-badge"
import AdminControls from "./admin-controls"

interface User {
  id: number
  username: string
  role_id: number
  role_name: string
  avatar?: string
  created_at: string
  last_login?: string
  banned: boolean
}

async function getUserProfile(userId: string) {
  try {
    const user = await getUserById(Number.parseInt(userId))
    if (!user) return null

    const [badgeRows] = await pool.execute(
      `
      SELECT b.name, b.icon, b.description
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
    `,
      [userId],
    )

    const [courseRows] = await pool.execute(
      `
      SELECT c.name, col.name as college_name
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      JOIN colleges col ON c.college_id = col.id
      WHERE uc.user_id = ?
    `,
      [userId],
    )

    const [statsRows] = await pool.execute(
      `
      SELECT 
        (SELECT COUNT(*) FROM threads WHERE user_id = ?) as threads_created,
        (SELECT COUNT(*) FROM replies WHERE user_id = ?) as replies_made,
        (SELECT SUM(views) FROM threads WHERE user_id = ?) as total_views
    `,
      [userId, userId, userId],
    )

    const [recentThreads] = await pool.execute(
      `
      SELECT t.id, t.title, t.views, t.created_at,
             c.name as course_name,
             (SELECT COUNT(*) FROM replies WHERE thread_id = t.id) as reply_count
      FROM threads t
      JOIN courses c ON t.course_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT 5
    `,
      [userId],
    )

    const [recentReplies] = await pool.execute(
      `
      SELECT r.id, r.content, r.created_at,
             t.title as thread_title, t.id as thread_id,
             c.name as course_name
      FROM replies r
      JOIN threads t ON r.thread_id = t.id
      JOIN courses c ON t.course_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 5
    `,
      [userId],
    )

    return {
      user,
      badges: badgeRows as any[],
      courses: courseRows as any[],
      stats: (statsRows as any[])[0],
      recentThreads: recentThreads as any[],
      recentReplies: recentReplies as any[],
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  return await getUserById(decoded.userId) as User | null
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [profileData, currentUser] = await Promise.all([getUserProfile(id), getCurrentUser()])

  if (!profileData) {
    notFound()
  }

  const { user, badges, courses, stats, recentThreads, recentReplies } = profileData

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  const isAdmin = currentUser && (currentUser.role_name === "God" || currentUser.role_name === "Moderator")
  const canDelete = currentUser && currentUser.role_name === "God"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
            <AvatarImage
              src={user.avatar && user.avatar !== "/placeholder.svg?height=40&width=40" ? user.avatar : undefined}
              alt={user.username}
            />
            <AvatarFallback className="bg-blue-600 text-white font-bold text-xl sm:text-2xl">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {user.username === "deleted user" ? (
                  <span className="text-gray-500 italic">Deleted User</span>
                ) : (
                  user.username
                )}
              </h1>
              <RoleBadge roleName={user.role_name} isBanned={user.banned} />
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
              {user.last_login && (
                <div className="flex items-center">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Last seen {new Date(user.last_login).toLocaleDateString()}
                </div>
              )}
            </div>

            {badges.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-x-0 sm:space-x-2 mb-4">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 mb-2 sm:mb-0" />
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {badge.icon} {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && user.username !== "deleted user" && currentUser.id !== user.id && (
              <AdminControls
                userId={user.id}
                isBanned={user.banned}
                canDelete={!!canDelete}
                username={user.username}
                roleId={user.role_id}
                currentUserRole={currentUser.role_id} // Pass currentUserRole
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="md:col-span-1 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Threads Created:</span>
                <span className="font-semibold">{stats.threads_created || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Replies Made:</span>
                <span className="font-semibold">{stats.replies_made || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Views:</span>
                <span className="font-semibold">{stats.total_views || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Posts:</span>
                <span className="font-semibold">{(stats.threads_created + stats.replies_made) || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="space-y-2">
                  {courses.map((course, index) => (
                    <div key={index} className="text-xs sm:text-sm">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-gray-500 text-xs">{course.college_name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-xs sm:text-sm">No courses enrolled</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Threads</CardTitle>
            </CardHeader>
            <CardContent>
              {recentThreads.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentThreads.map((thread) => (
                    <div key={thread.id} className="border-b border-gray-200 pb-3 sm:pb-4 last:border-b-0">
                      <Link
                        href={`/thread/${thread.id}`}
                        className="font-medium text-blue-600 hover:underline block mb-1 text-sm sm:text-base"
                      >
                        {thread.title}
                      </Link>
                      <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {thread.course_name}
                        </Badge>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {thread.views} views
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {thread.reply_count} replies
                        </span>
                        <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-xs sm:text-sm">No threads created yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Replies</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReplies.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentReplies.map((reply) => (
                    <div key={reply.id} className="border-b border-gray-200 pb-3 sm:pb-4 last:border-b-0">
                      <Link
                        href={`/thread/${reply.thread_id}#reply-${reply.id}`}
                        className="font-medium text-blue-600 hover:underline block mb-1 text-sm sm:text-base"
                      >
                        Re: {reply.thread_title}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-2">{reply.content.substring(0, 150)}...</p>
                      <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {reply.course_name}
                        </Badge>
                        <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-xs sm:text-sm">No replies made yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}