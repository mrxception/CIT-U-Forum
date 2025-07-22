import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ count: 0 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ count: 0 })
    }

    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = FALSE",
      [decoded.userId],
    )

    const count = (rows as any[])[0].count
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching notification count:", error)
    return NextResponse.json({ count: 0 })
  }
}
