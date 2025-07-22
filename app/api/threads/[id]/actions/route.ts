import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"
import pool from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { action } = await request.json()

    const [threadRows] = await pool.execute("SELECT user_id, closed, pinned FROM threads WHERE id = ?", [id])
    const thread = (threadRows as any[])[0]

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    const isAdmin = user.role_name === "God" || user.role_name === "Moderator"
    const isOwner = user.id === thread.user_id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    switch (action) {
      case "delete":
        if (!isAdmin && !isOwner) {
          return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
        }
        await pool.execute("DELETE FROM threads WHERE id = ?", [id])
        return NextResponse.json({ message: "Thread deleted successfully" })

      case "pin":
        if (!isAdmin) {
          return NextResponse.json({ error: "Only moderators can pin threads" }, { status: 403 })
        }
        await pool.execute("UPDATE threads SET pinned = TRUE WHERE id = ?", [id])
        return NextResponse.json({ message: "Thread pinned successfully" })

      case "unpin":
        if (!isAdmin) {
          return NextResponse.json({ error: "Only moderators can unpin threads" }, { status: 403 })
        }
        await pool.execute("UPDATE threads SET pinned = FALSE WHERE id = ?", [id])
        return NextResponse.json({ message: "Thread unpinned successfully" })

      case "close":
        if (!isAdmin) {
          return NextResponse.json({ error: "Only moderators can close threads" }, { status: 403 })
        }
        await pool.execute("UPDATE threads SET closed = TRUE WHERE id = ?", [id])
        return NextResponse.json({ message: "Thread closed successfully" })

      case "open":
        if (!isAdmin) {
          return NextResponse.json({ error: "Only moderators can open threads" }, { status: 403 })
        }
        await pool.execute("UPDATE threads SET closed = FALSE WHERE id = ?", [id])
        return NextResponse.json({ message: "Thread opened successfully" })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Thread action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
