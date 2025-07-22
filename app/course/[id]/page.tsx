import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Plus, Lock, Pin, Clock } from "lucide-react"
import pool from "@/lib/db"

async function getCourseData(courseId: string) {
  try {
    const [courseRows] = await pool.execute(
      `
      SELECT c.id, c.name, c.description, col.name as college_name, col.id as college_id
      FROM courses c
      JOIN colleges col ON c.college_id = col.id
      WHERE c.id = ?
    `,
      [courseId],
    )

    if ((courseRows as any[]).length === 0) {
      return null
    }

    const course = (courseRows as any[])[0]

    const [threadRows] = await pool.execute(
      `
      SELECT 
        t.id, t.title, t.views, t.closed, t.pinned, t.created_at, t.updated_at,
        u.username, u.avatar,
        COUNT(r.id) as reply_count,
        (SELECT u2.username FROM users u2 
         JOIN replies r2 ON u2.id = r2.user_id 
         WHERE r2.thread_id = t.id 
         ORDER BY r2.created_at DESC LIMIT 1) as last_reply_user,
        (SELECT r3.created_at FROM replies r3 
         WHERE r3.thread_id = t.id 
         ORDER BY r3.created_at DESC LIMIT 1) as last_reply_time
      FROM threads t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN replies r ON t.id = r.thread_id
      WHERE t.course_id = ?
      GROUP BY t.id, t.title, t.views, t.closed, t.pinned, t.created_at, t.updated_at, u.username, u.avatar
      ORDER BY t.pinned DESC, COALESCE(last_reply_time, t.created_at) DESC
    `,
      [courseId],
    )

    return {
      course,
      threads: threadRows as any[],
    }
  } catch (error) {
    console.error("Error fetching course data:", error)
    return null
  }
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getCourseData(id)

  if (!data) {
    notFound()
  }

  const { course, threads } = data

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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
        <span className="font-medium">{course.name}</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h1>
            <p className="text-gray-600">{course.description}</p>
          </div>
          <Button asChild>
            <Link href={`/course/${course.id}/new-thread`}>
              <Plus className="w-4 h-4 mr-2" />
              New Thread
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-300">
        <div className="bg-blue-600 text-white px-4 py-2 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Threads</h2>
            <div className="hidden sm:flex sm:items-center sm:space-x-8 text-sm">
              <span className="w-48 text-right">Last Post</span>
              <span className="w-16 text-center">Replies</span>
              <span className="w-16 text-center">Views</span>
            </div>
          </div>
        </div>

        {threads.map((thread) => (
          <div key={thread.id} className="border-b border-gray-300">
            <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4 sm:gap-0">
              <div className="flex items-center flex-1">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-4">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Link href={`/thread/${thread.id}`} className="font-semibold text-blue-600 hover:underline">
                      {thread.title}
                    </Link>
                    <div className="flex items-center space-x-1">
                      {thread.pinned != 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Pinned
                        </span>
                      )}
                      {thread.closed != 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Avatar className="w-4 h-4">
                      <AvatarImage
                        src={
                          thread.avatar && thread.avatar !== "/placeholder.svg?height=40&width=40"
                            ? thread.avatar
                            : undefined
                        }
                        alt={thread.username}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                        {thread.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>by {thread.username}</span>
                    <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 text-sm gap-2 sm:gap-0">
                <div className="w-full sm:w-48 sm:text-right">
                  {thread.last_reply_time ? (
                    <div>
                      <div className="font-medium text-blue-600">
                        {new Date(thread.last_reply_time).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">by {thread.last_reply_user}</div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No replies yet</span>
                  )}
                </div>
                <div className="flex items-center sm:w-16 sm:text-center">
                  <span className="font-semibold sm:hidden mr-2">Replies:</span>
                  <span className="font-semibold">{thread.reply_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center sm:w-16 sm:text-center">
                  <span className="font-semibold sm:hidden mr-2">Views:</span>
                  <span className="font-semibold">{thread.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {threads.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-4">No threads in this course yet.</p>
            <Button asChild>
              <Link href={`/course/${course.id}/new-thread`}>
                <Plus className="w-4 h-4 mr-2" />
                Start the first discussion
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-300 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <strong>{course.name} Statistics:</strong> {threads.length} threads,{" "}
            {threads.reduce((sum, t) => sum + t.reply_count, 0)} replies
          </div>
          <div>
            <Clock className="w-4 h-4 inline mr-1" />
            All times are GMT +8
          </div>
        </div>
      </div>
    </div>
  )
}