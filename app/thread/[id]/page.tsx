import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Reply, Share, Lock } from "lucide-react"
import pool from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken, getUserById } from "@/lib/auth"
import ReplyForm from "./reply-form"
import QuoteButton from "./qoute-button" // Fixed typo from "qoute-button"
import ThreadTools from "./thread-tools"
import QuoteDisplay from "./qoute-display"
import ViewFirstUnreadButton from "./view-first-unread-button"
import { RoleBadge } from "@/components/ui/role-badge"

async function getThreadData(threadId: string) {
  try {
    const [threadRows] = await pool.execute(
      `
      SELECT t.id, t.title, t.content, t.views, t.created_at, t.closed, t.pinned,
             t.user_id, u.username, u.avatar, u.created_at as user_joined, u.role_id, u.banned,
             c.name as course_name, c.id as course_id,
             col.name as college_name, col.id as college_id,
             r.name as role_name
      FROM threads t
      JOIN users u ON t.user_id = u.id
      JOIN courses c ON t.course_id = c.id
      JOIN colleges col ON c.college_id = col.id
      JOIN roles r ON u.role_id = r.id
      WHERE t.id = ?
    `,
      [threadId],
    )

    if ((threadRows as any[]).length === 0) {
      return null
    }

    const thread = (threadRows as any[])[0]

    const [starterStatsRows] = await pool.execute(
      `
      SELECT 
        (SELECT COUNT(*) FROM threads WHERE user_id = ?) as thread_count,
        (SELECT COUNT(*) FROM replies WHERE user_id = ?) as reply_count
    `,
      [thread.user_id, thread.user_id],
    )

    const starterStats = (starterStatsRows as any[])[0]

    const [replyRows] = await pool.execute(
      `
      SELECT r.id, r.content, r.created_at,
             u.id as user_id, u.username, u.avatar, u.created_at as user_joined, u.role_id, u.banned,
             role.name as role_name,
             (SELECT COUNT(*) FROM threads WHERE user_id = u.id) as user_thread_count,
             (SELECT COUNT(*) FROM replies WHERE user_id = u.id) as user_reply_count
      FROM replies r
      JOIN users u ON r.user_id = u.id
      JOIN roles role ON u.role_id = role.id
      WHERE r.thread_id = ?
      ORDER BY r.created_at ASC
    `,
      [threadId],
    )

    await pool.execute("UPDATE threads SET views = views + 1 WHERE id = ?", [threadId])

    return {
      thread: { ...thread, ...starterStats },
      replies: replyRows as any[],
    }
  } catch (error) {
    console.error("Error fetching thread data:", error)
    return null
  }
}

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  return await getUserById(decoded.userId)
}

function UserProfile({ user, stats, isOP = false }: { user: any; stats: any; isOP?: boolean }) {
  const totalPosts = (stats.thread_count || 0) + (stats.reply_count || 0)
  const joinDate = new Date(user.user_joined || user.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <div className="w-full sm:w-32 md:w-48 bg-gray-50 border-r border-gray-300 p-2 sm:p-3 text-xs">
      <div className="text-center mb-2 sm:mb-3">
        <Link href={`/user/${user.user_id || user.id}`} className="text-blue-600 hover:underline font-bold">
          {user.username === "deleted user" ? (
            <span className="text-gray-500 italic">Deleted User</span>
          ) : (
            user.username
          )}
        </Link>
        <div className="mt-1">
          <RoleBadge roleName={user.role_name} isBanned={user.banned} />
        </div>
        {isOP && <div className="text-green-600 font-semibold mt-1">Thread Starter</div>}
      </div>

      <div className="mb-2 sm:mb-3">
        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto">
          <AvatarImage
            src={user.avatar && user.avatar !== "/placeholder.svg?height=40&width=40" ? user.avatar : undefined}
            alt={user.username}
          />
          <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
            {getInitials(user.username)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-1 text-gray-700">
        <div className="border-b border-gray-300 pb-1">
          <strong>Join Date:</strong> {joinDate}
        </div>
        <div className="border-b border-gray-300 pb-1">
          <strong>Posts:</strong> {totalPosts}
        </div>
        <div className="border-b border-gray-300 pb-1">
          <strong>Threads:</strong> {stats.user_thread_count || stats.thread_count || 0}
        </div>
        <div className="border-b border-gray-300 pb-1">
          <strong>Replies:</strong> {stats.user_reply_count || stats.reply_count || 0}
        </div>

        <div className="mt-2">
          <div className="text-gray-600 mb-1">Activity: {Math.min(100, Math.floor(totalPosts / 10) * 10)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, (totalPosts / 100) * 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-gray-600">
            Points: {totalPosts * 10}, Level: {Math.floor(totalPosts / 10) + 1}
          </div>
          <div className="text-xs text-gray-500">
            Level {Math.floor(totalPosts / 10) + 1}: {((totalPosts % 10) / 10) * 100}% complete
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${((totalPosts % 10) / 10) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [data, currentUser] = await Promise.all([getThreadData(id), getCurrentUser()])

  if (!data) {
    notFound()
  }

  const { thread, replies } = data
  const canReply = currentUser && !thread.closed && !currentUser.banned

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="bg-white border border-gray-300 mb-4">
        <div className="bg-blue-600 text-white px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {canReply ? (
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800 w-full sm:w-auto">
                <a href="#reply-form" className="flex items-center">
                  <Reply className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Post Reply
                </a>
              </Button>
            ) : thread.closed ? (
              <Button size="sm" className="bg-gray-600 cursor-not-allowed w-full sm:w-auto" disabled>
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Thread Closed
              </Button>
            ) : (
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800 w-full sm:w-auto" asChild>
                <Link href="/login" className="flex items-center">
                  <Reply className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Post Reply
                </Link>
              </Button>
            )}
            <div className="flex flex-wrap items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Share className="w-3 h-3 sm:w-4 sm:h-4" />
              <a
                href={`https://reddit.com/submit?url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_BASE_URL || "https://cit-forum-orpin.vercel.app"}/thread/${id}`,
                )}&title=${encodeURIComponent(thread.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Reddit
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_BASE_URL || "https://cit-forum-orpin.vercel.app"}/thread/${id}`,
                )}&text=${encodeURIComponent(thread.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Twitter
              </a>
              <a
                href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_BASE_URL || "https://cit-forum-orpin.vercel.app"}/thread/${id}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Facebook
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
            <ViewFirstUnreadButton />
            <ThreadTools
              threadId={id}
              currentUser={currentUser}
              threadUserId={thread.user_id}
              isClosed={thread.closed}
              isPinned={thread.pinned}
            />
          </div>
        </div>

        <div className="px-2 sm:px-4 py-2 bg-gray-100 border-b border-gray-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900">{thread.title}</h1>
              {thread.closed != 0 && <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-0">
              {thread.views} views • {replies.length} replies
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2 sm:mb-4 text-xs sm:text-sm text-gray-600 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span>&gt;</span>
        <Link href="/forums" className="hover:text-blue-600">
          Forums
        </Link>
        <span>&gt;</span>
        <Link href={`/college/${thread.college_id}`} className="hover:text-blue-600">
          {thread.college_name}
        </Link>
        <span>&gt;</span>
        <Link href={`/course/${thread.course_id}`} className="hover:text-blue-600">
          {thread.course_name}
        </Link>
        <span>&gt;</span>
        <span className="font-medium">{thread.title}</span>
      </div>

      <div className="space-y-0">
        <div className="bg-white border border-gray-300">
          <div className="flex flex-col sm:flex-row">
            <UserProfile
              user={thread}
              stats={{ thread_count: thread.thread_count, reply_count: thread.reply_count }}
              isOP={true}
            />
            <div className="flex-1 p-2 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    {new Date(thread.created_at).toLocaleDateString()},{" "}
                    {new Date(thread.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-600">#1</div>
              </div>

              <div className="prose max-w-none text-sm sm:text-base">
                <QuoteDisplay content={thread.content} />
              </div>

              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                  {canReply ? (
                    <QuoteButton username={thread.username} content={thread.content} />
                  ) : !currentUser ? (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">Quote</Link>
                    </Button>
                  ) : null}
                  {canReply ? (
                    <Button variant="ghost" size="sm" asChild>
                      <a href="#reply-form">Reply</a>
                    </Button>
                  ) : !currentUser ? (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">Reply</Link>
                    </Button>
                  ) : null}
                </div>
                <div className="text-xs text-gray-500">{thread.username} is online now</div>
              </div>
            </div>
          </div>
        </div>

        {replies.map((reply, index) => (
          <div
            key={reply.id}
            className="bg-white border border-gray-300 border-t-0"
            id={`reply-${reply.id}`}
            data-unread={index === 0 ? "true" : undefined}
          >
            <div className="flex flex-col sm:flex-row">
              <UserProfile
                user={reply}
                stats={{ thread_count: reply.user_thread_count, reply_count: reply.user_reply_count }}
              />
              <div className="flex-1 p-2 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>
                      {new Date(reply.created_at).toLocaleDateString()},{" "}
                      {new Date(reply.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gray-600">#{index + 2}</div>
                </div>

                <div className="prose max-w-none text-sm sm:text-base">
                  <QuoteDisplay content={reply.content} />
                </div>

                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                    {canReply ? (
                      <QuoteButton username={reply.username} content={reply.content} />
                    ) : !currentUser ? (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">Quote</Link>
                      </Button>
                    ) : null}
                    {canReply ? (
                      <Button variant="ghost" size="sm" asChild>
                        <a href="#reply-form">Reply</a>
                      </Button>
                    ) : !currentUser ? (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">Reply</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {canReply && <ReplyForm threadId={id} currentUser={currentUser} />}

      {thread.closed != 0 && (
        <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-4">
          <div className="flex items-center">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 font-medium text-sm sm:text-base">
              This thread has been closed. No new replies can be posted.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}