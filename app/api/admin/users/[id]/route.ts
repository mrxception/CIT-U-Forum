import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, getUserById } from "@/lib/auth"
import pool from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const currentUser = await getUserById(decoded.userId)
    if (!currentUser || (currentUser.role_name !== "God" && currentUser.role_name !== "Moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { action } = await request.json()
    const userId = Number.parseInt(id)

    if (action === "ban") {
      await pool.execute("UPDATE users SET banned = 1 WHERE id = ?", [userId])
    } else if (action === "unban") {
      await pool.execute("UPDATE users SET banned = 0 WHERE id = ?", [userId])
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin user action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const currentUser = await getUserById(decoded.userId)
    if (!currentUser || currentUser.role_name !== "God") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const userId = Number.parseInt(id)

    await pool.execute(
      "UPDATE users SET username = 'deleted user', email = 'deleted@deleted.com', avatar = NULL WHERE id = ?",
      [userId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin user delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
