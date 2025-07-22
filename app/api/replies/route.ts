import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/db"
import type { DatabaseResult } from "@/types"

interface CreateReplyRequest {
  threadId: number
  content: string
}

interface ThreadCheck {
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

    const { threadId, content }: CreateReplyRequest = await request.json()

    if (!threadId || !content) {
      return NextResponse.json({ error: "Thread ID and content are required" }, { status: 400 })
    }

    const [threadCheck] = await pool.execute("SELECT id FROM threads WHERE id = ?", [threadId])

    if ((threadCheck as ThreadCheck[]).length === 0) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    const [result] = await pool.execute("INSERT INTO replies (thread_id, user_id, content) VALUES (?, ?, ?)", [
      threadId,
      decoded.userId,
      content,
    ])

    const replyId = (result as DatabaseResult).insertId

    await pool.execute("UPDATE threads SET updated_at = NOW() WHERE id = ?", [threadId])

    return NextResponse.json({
      message: "Reply posted successfully",
      replyId,
    })
  } catch (error) {
    console.error("Reply creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
