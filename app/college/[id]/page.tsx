import Link from "next/link"
import { notFound } from "next/navigation"
import { MessageSquare } from "lucide-react"
import pool from "@/lib/db"

async function getCollegeData(collegeId: string) {
  try {
    const [collegeRows] = await pool.execute("SELECT id, name, description FROM colleges WHERE id = ?", [collegeId])

    if ((collegeRows as any[]).length === 0) {
      return null
    }

    const college = (collegeRows as any[])[0]

    const [courseRows] = await pool.execute(
      `
      SELECT 
        c.id, c.name, c.description,
        COUNT(DISTINCT t.id) as thread_count,
        COUNT(DISTINCT r.id) + COUNT(DISTINCT t.id) as post_count,
        MAX(COALESCE(r.created_at, t.created_at)) as last_activity,
        (SELECT u.username FROM users u 
         JOIN replies r2 ON u.id = r2.user_id 
         WHERE r2.thread_id IN (SELECT id FROM threads WHERE course_id = c.id)
         ORDER BY r2.created_at DESC LIMIT 1) as last_user,
        (SELECT t2.title FROM threads t2 
         WHERE t2.course_id = c.id
         ORDER BY t2.updated_at DESC LIMIT 1) as last_thread
      FROM courses c
      LEFT JOIN threads t ON c.id = t.course_id
      LEFT JOIN replies r ON t.id = r.thread_id
      WHERE c.college_id = ?
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name
    `,
      [collegeId],
    )

    return {
      college,
      courses: courseRows as any[],
    }
  } catch (error) {
    console.error("Error fetching college data:", error)
    return null
  }
}

export default async function CollegePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getCollegeData(id)

  if (!data) {
    notFound()
  }

  const { college, courses } = data

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
        <span className="font-medium">{college.name}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{college.name}</h1>
        <p className="text-gray-600">{college.description}</p>
      </div>

      <div className="bg-white border border-gray-300">
        <div className="bg-blue-600 text-white px-4 py-2 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Course Forums</h2>
            <div className="flex items-center space-x-8 text-sm">
              <span>Last Post</span>
              <span>Threads</span>
              <span>Posts</span>
            </div>
          </div>
        </div>

        {courses.map((course) => (
          <div key={course.id} className="border-b border-gray-300 hover:bg-gray-50">
            <div className="flex items-center p-4">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-4">
                <MessageSquare className="w-4 h-4 text-green-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Link href={`/course/${course.id}`} className="font-semibold text-blue-600 hover:underline">
                    {course.name}
                  </Link>
                </div>
                <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                <div className="text-xs text-gray-500">Course discussions and study materials</div>
              </div>

              <div className="flex items-center space-x-8 text-sm">
                <div className="w-48 text-right">
                  {course.last_activity ? (
                    <div>
                      <div className="font-medium text-blue-600">
                        {course.last_thread ? course.last_thread.substring(0, 30) + "..." : "No posts yet"}
                      </div>
                      <div className="text-xs text-gray-500">by {course.last_user || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{new Date(course.last_activity).toLocaleDateString()}</div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No posts yet</span>
                  )}
                </div>

                <div className="w-16 text-center">
                  <div className="font-semibold">{course.thread_count}</div>
                </div>

                <div className="w-16 text-center">
                  <div className="font-semibold">{course.post_count}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No courses available in this college yet.</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-300 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <strong>{college.name} Statistics:</strong> {courses.reduce((sum, c) => sum + c.thread_count, 0)} threads,{" "}
            {courses.reduce((sum, c) => sum + c.post_count, 0)} posts across {courses.length} courses
          </div>
          <div>All times are GMT +8</div>
        </div>
      </div>
    </div>
  )
}
