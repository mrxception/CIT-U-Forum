import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, FileText, MessageSquare, Users, Eye, Clock } from "lucide-react"
import pool from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

async function getForumStats() {
  try {
    const [statsRows] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE banned = FALSE) as total_users,
        (SELECT COUNT(*) FROM threads) as total_threads,
        (SELECT COUNT(*) FROM replies) as total_replies
    `)
    return (statsRows as any[])[0]
  } catch (error) {
    console.error("Error fetching forum stats:", error)
    return { total_users: 0, total_threads: 0, total_replies: 0 }
  }
}

async function getHottestThreads() {
  try {
    const [rows] = await pool.execute(`
      SELECT t.id, t.title, t.views, t.created_at,
             u.username, u.avatar,
             c.name as course_name,
             (SELECT COUNT(*) FROM replies WHERE thread_id = t.id) as reply_count
      FROM threads t
      JOIN users u ON t.user_id = u.id
      JOIN courses c ON t.course_id = c.id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY (t.views + (SELECT COUNT(*) FROM replies WHERE thread_id = t.id) * 2) DESC
      LIMIT 5
    `)
    return rows as any[]
  } catch (error) {
    console.error("Error fetching hottest threads:", error)
    return []
  }
}

async function getLatestPosts() {
  try {
    const [rows] = await pool.execute(`
      (SELECT 'reply' as type, r.id, r.content as content, r.created_at,
             u.username, u.avatar,
             t.title as thread_title, t.id as thread_id,
             c.name as course_name
      FROM replies r
      JOIN users u ON r.user_id = u.id
      JOIN threads t ON r.thread_id = t.id
      JOIN courses c ON t.course_id = c.id)
      UNION ALL
      (SELECT 'thread' as type, t.id, t.content as content, t.created_at,
             u.username, u.avatar,
             t.title as thread_title, t.id as thread_id,
             c.name as course_name
      FROM threads t
      JOIN users u ON t.user_id = u.id
      JOIN courses c ON t.course_id = c.id)
      ORDER BY created_at DESC
      LIMIT 5
    `)
    return rows as any[]
  } catch (error) {
    console.error("Error fetching latest posts:", error)
    return []
  }
}

async function getForumCategories() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        col.id, col.name, col.description,
        COUNT(DISTINCT c.id) as course_count,
        COUNT(DISTINCT t.id) as thread_count,
        COUNT(DISTINCT r.id) as post_count,
        MAX(COALESCE(r.created_at, t.created_at)) as last_activity,
        (SELECT username FROM users WHERE id = 
          (SELECT user_id FROM replies WHERE created_at = MAX(COALESCE(r.created_at, t.created_at)) LIMIT 1)
        ) as last_user
      FROM colleges col
      LEFT JOIN courses c ON col.id = c.college_id
      LEFT JOIN threads t ON c.id = t.course_id
      LEFT JOIN replies r ON t.id = r.thread_id
      GROUP BY col.id, col.name, col.description
      ORDER BY col.name
    `)
    return rows as any[]
  } catch (error) {
    console.error("Error fetching forum categories:", error)
    return []
  }
}

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const decoded = verifyToken(token)
  return decoded ? { userId: decoded.userId } : null
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: number
  icon: any
  description: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  )
}

export default async function HomePage() {
  const [stats, hottestThreads, latestPosts, categories, currentUser] = await Promise.all([
    getForumStats(),
    getHottestThreads(),
    getLatestPosts(),
    getForumCategories(),
    getCurrentUser(),
  ])

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <div className="bg-gray-50">
      <div className="bg-black text-white text-center py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">CIT-U STUDENT FORUM</h1>
          <p className="text-lg">Academic Discussion Platform for Cebu Institute of Technology - University</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to CIT-U Forum</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with fellow students, share knowledge, and collaborate on academic projects. Join the conversation
            in your course-specific forums.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatsCard title="Total Members" value={stats.total_users} icon={Users} description="Registered students" />
          <StatsCard
            title="Discussions"
            value={stats.total_threads}
            icon={MessageSquare}
            description="Active threads"
          />
          <StatsCard title="Posts" value={stats.total_replies} icon={FileText} description="Total replies" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
                Hottest Threads (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hottestThreads.length > 0 ? (
                hottestThreads.map((thread) => (
                  <div key={thread.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          thread.avatar && thread.avatar !== "/placeholder.svg?height=40&width=40"
                            ? thread.avatar
                            : undefined
                        }
                        alt={thread.username}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                        {getInitials(thread.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/thread/${thread.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                      >
                        {thread.title}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {thread.course_name}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {thread.views}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {thread.reply_count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No threads yet. Be the first to start a discussion!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                Latest Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <div key={`${post.type}-${post.id}`} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          post.avatar && post.avatar !== "/placeholder.svg?height=40&width=40" ? post.avatar : undefined
                        }
                        alt={post.username}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                        {getInitials(post.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={
                          post.type === "reply"
                            ? `/thread/${post.thread_id}#reply-${post.id}`
                            : `/thread/${post.thread_id}`
                        }
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                      >
                        {post.type === "reply" ? `Re: ${post.thread_title}` : post.thread_title}
                      </Link>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{post.content.substring(0, 100)}...</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {post.course_name}
                        </Badge>
                        <span className="text-xs text-gray-500">by {post.username}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No posts yet. Join the conversation!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/forums"
                className="block w-full p-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Forums
              </Link>
              <Link
                href="/search"
                className="block w-full p-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Search Discussions
              </Link>
              {!currentUser && (
                <Link
                  href="/register"
                  className="block w-full p-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Join Community
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forum Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <Link
                        href={`/college/${category.id}`}
                        className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {category.name}
                      </Link>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{category.description}</p>
                      <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mt-2">
                        <span className="text-xs sm:text-sm text-gray-500">{category.course_count} courses</span>
                        <span className="text-xs sm:text-sm text-gray-500">{category.thread_count} threads</span>
                        <span className="text-xs sm:text-sm text-gray-500">{category.post_count} posts</span>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 sm:text-right">
                      {category.last_activity && (
                        <>
                          <div className="text-gray-500">Last activity: {new Date(category.last_activity).toLocaleDateString()}</div>
                          {category.last_user && <div>by {category.last_user}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
