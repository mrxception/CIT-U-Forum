import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters long" }, { status: 400 })
  }

  try {
    const [threadRows] = await pool.execute(
      `
      SELECT t.id, t.title, t.views, t.created_at,
             c.name as course_name, c.id as course_id,
             col.name as college_name, col.id as college_id,
             u.username, u.role_id, u.banned,
             r.name as role_name,
             (SELECT COUNT(*) FROM replies WHERE thread_id = t.id) as reply_count
      FROM threads t
      JOIN courses c ON t.course_id = c.id
      JOIN colleges col ON c.college_id = col.id
      JOIN users u ON t.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE t.title LIKE ? OR t.content LIKE ?
      ORDER BY t.created_at DESC
      LIMIT 10
    `,
      [`%${query}%`, `%${query}%`],
    )

    const [userRows] = await pool.execute(
      `
      SELECT u.id, u.username, u.created_at, u.role_id, u.banned,
             r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.username LIKE ? AND u.username != 'deleted user'
      ORDER BY u.created_at DESC
      LIMIT 10
    `,
      [`%${query}%`],
    )

    return NextResponse.json({
      threads: threadRows,
      users: userRows,
    })
  } catch (error) {
    console.error("Error searching data:", error)
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 })
  }
}