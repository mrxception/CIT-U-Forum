import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { avatar } = body

    if (avatar === undefined) {
      return NextResponse.json({ error: "Avatar URL is required" }, { status: 400 })
    }

    const avatarValue = avatar && avatar.trim() ? avatar.trim() : "/placeholder.svg?height=40&width=40"

    await pool.execute("UPDATE users SET avatar = ? WHERE id = ?", [avatarValue, decoded.userId])

    return NextResponse.json({
      message: "Avatar updated successfully",
      avatar: avatarValue,
    })
  } catch (error) {
    console.error("Avatar update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
