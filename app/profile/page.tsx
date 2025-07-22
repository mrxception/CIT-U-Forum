import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Award, BookOpen, Eye, Users } from "lucide-react"
import { verifyToken, getUserById } from "@/lib/auth"
import { cookies } from "next/headers"
import pool from "@/lib/db"
import Link from "next/link"
import { RoleBadge } from "@/components/ui/role-badge"

async function getUserProfile(userId: number) {
  try {
    const user = await getUserById(userId)
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

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    redirect("/login")
  }

  const profileData = await getUserProfile(decoded.userId)
  if (!profileData) {
    redirect("/login")
  }

  const { user, badges, courses, stats, recentThreads, recentReplies } = profileData

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex items-start space-x-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.username === "deleted user" ? (
                  <span className="text-gray-500 italic">Deleted User</span>
                ) : (
                  user.username
                )}
              </h1>
              <RoleBadge roleName={user.role_name} isBanned={user.banned} />
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
              {user.last_login && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Last seen {new Date(user.last_login).toLocaleDateString()}
                </div>
              )}
            </div>

            {badges.length > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-4 h-4 text-yellow-600" />
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {badge.icon} {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/settings">Edit Profile</Link>
              </Button>
              {(user.role_name === "God" || user.role_name === "Moderator") && (
                <Button variant="outline" asChild>
                  <Link href="/admin">Admin Panel</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Threads Created:</span>
                <span className="font-semibold">{stats.threads_created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Replies Made:</span>
                <span className="font-semibold">{stats.replies_made}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Views:</span>
                <span className="font-semibold">{stats.total_views || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Posts:</span>
                <span className="font-semibold">{stats.threads_created + stats.replies_made}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="space-y-2">
                  {courses.map((course, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-gray-500 text-xs">{course.college_name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No courses enrolled</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Threads</CardTitle>
            </CardHeader>
            <CardContent>
              {recentThreads.length > 0 ? (
                <div className="space-y-4">
                  {recentThreads.map((thread) => (
                    <div key={thread.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <Link
                        href={`/thread/${thread.id}`}
                        className="font-medium text-blue-600 hover:underline block mb-1"
                      >
                        {thread.title}
                      </Link>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                <p className="text-gray-500">No threads created yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Replies</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReplies.length > 0 ? (
                <div className="space-y-4">
                  {recentReplies.map((reply) => (
                    <div key={reply.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <Link
                        href={`/thread/${reply.thread_id}#reply-${reply.id}`}
                        className="font-medium text-blue-600 hover:underline block mb-1"
                      >
                        Re: {reply.thread_title}
                      </Link>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{reply.content.substring(0, 150)}...</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {reply.course_name}
                        </Badge>
                        <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No replies made yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}