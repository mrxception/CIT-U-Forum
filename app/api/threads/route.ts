import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/db"
import type { DatabaseResult } from "@/types"

interface CreateThreadRequest {
  courseId: number
  title: string
  content: string
}

interface CourseCheck {
  id: number
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { courseId, title, content }: CreateThreadRequest = await request.json()

    if (!courseId || !title || !content) {
      return NextResponse.json({ error: "Course ID, title, and content are required" }, { status: 400 })
    }

    const [courseCheck] = await pool.execute("SELECT id FROM courses WHERE id = ?", [courseId])

    if ((courseCheck as CourseCheck[]).length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const [result] = await pool.execute(
      "INSERT INTO threads (course_id, user_id, title, content) VALUES (?, ?, ?, ?)",
      [courseId, decoded.userId, title, content],
    )

    const threadId = (result as DatabaseResult).insertId

    return NextResponse.json({
      message: "Thread created successfully",
      threadId,
    })
  } catch (error) {
    console.error("Thread creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
