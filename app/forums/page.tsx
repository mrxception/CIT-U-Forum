import Link from "next/link"
import { MessageSquare, Clock } from "lucide-react"
import pool from "@/lib/db"

async function getForumData() {
  try {
    const [collegeRows] = await pool.execute(`
      SELECT 
        col.id, col.name, col.description,
        COUNT(DISTINCT c.id) as course_count,
        COUNT(DISTINCT t.id) as thread_count,
        COUNT(DISTINCT r.id) + COUNT(DISTINCT t.id) as post_count,
        MAX(COALESCE(r.created_at, t.created_at)) as last_activity,
        (SELECT u.username FROM users u 
         JOIN replies r2 ON u.id = r2.user_id 
         WHERE r2.created_at = MAX(COALESCE(r.created_at, t.created_at)) 
         LIMIT 1) as last_user,
        (SELECT t2.title FROM threads t2 
         WHERE t2.created_at = MAX(COALESCE(r.created_at, t.created_at)) OR
               t2.id = (SELECT thread_id FROM replies WHERE created_at = MAX(COALESCE(r.created_at, t.created_at)) LIMIT 1)
         LIMIT 1) as last_thread
      FROM colleges col
      LEFT JOIN courses c ON col.id = c.college_id
      LEFT JOIN threads t ON c.id = t.course_id
      LEFT JOIN replies r ON t.id = r.thread_id
      GROUP BY col.id, col.name, col.description
      ORDER BY col.name
    `)
    return collegeRows as any[]
  } catch (error) {
    console.error("Error fetching forum data:", error)
    return []
  }
}

export default async function ForumsPage() {
  const colleges = await getForumData()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forum Index</h1>
        <p className="text-gray-600">Browse all course discussions by college</p>
      </div>

      <div className="bg-white border border-gray-300">
        {colleges.map((college, index) => (
          <div key={college.id}>
            <div className="bg-blue-600 text-white px-4 py-2 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{college.name}</h2>
                <div className="flex items-center space-x-8 text-sm">
                  <span>Last Post</span>
                  <span>Threads</span>
                  <span>Posts</span>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-300">
              <div className="flex items-center p-4">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-4">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Link href={`/college/${college.id}`} className="font-semibold text-blue-600 hover:underline">
                      {college.name}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{college.description}</p>
                  <div className="text-xs text-gray-500">Sub-Forums: {college.course_count} courses</div>
                </div>

                <div className="flex items-center space-x-8 text-sm">
                  <div className="w-48 text-right">
                    {college.last_activity ? (
                      <div>
                        <div className="font-medium text-blue-600">
                          {college.last_thread ? college.last_thread.substring(0, 30) + "..." : "No posts yet"}
                        </div>
                        <div className="text-xs text-gray-500">by {college.last_user || "Unknown"}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(college.last_activity).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">No posts yet</span>
                    )}
                  </div>

                  <div className="w-16 text-center">
                    <div className="font-semibold">{college.thread_count.toLocaleString()}</div>
                  </div>

                  <div className="w-16 text-center">
                    <div className="font-semibold">{college.post_count.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-300 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <strong>Forum Statistics:</strong> {colleges.reduce((sum, c) => sum + c.thread_count, 0)} threads,{" "}
            {colleges.reduce((sum, c) => sum + c.post_count, 0)} posts
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
