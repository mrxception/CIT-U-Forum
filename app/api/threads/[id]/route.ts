import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [rows] = await pool.execute(
      `
      SELECT t.id, t.title, t.content, t.views, t.created_at, t.closed, t.pinned,
             u.username, u.avatar, u.created_at as user_joined,
             c.name as course_name, c.id as course_id,
             col.name as college_name, col.id as college_id
      FROM threads t
      JOIN users u ON t.user_id = u.id
      JOIN courses c ON t.course_id = c.id
      JOIN colleges col ON c.college_id = col.id
      WHERE t.id = ?
    `,
      [id],
    )

    const threads = rows as any[]
    if (threads.length === 0) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    return NextResponse.json(threads[0])
  } catch (error) {
    console.error("Error fetching thread:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
