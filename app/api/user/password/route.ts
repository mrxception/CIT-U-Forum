import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, hashPassword, verifyPassword } from "@/lib/auth"
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

    const { currentPassword, newPassword } = await request.json()

    const [userRows] = await pool.execute("SELECT hashed_password FROM users WHERE id = ?", [decoded.userId])

    const user = (userRows as any[])[0]
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.hashed_password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashedNewPassword = await hashPassword(newPassword)
    await pool.execute("UPDATE users SET hashed_password = ? WHERE id = ?", [hashedNewPassword, decoded.userId])

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
