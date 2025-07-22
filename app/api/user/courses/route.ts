import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/db"
import type { CourseEnrollment } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const [rows] = await pool.execute("SELECT course_id FROM user_courses WHERE user_id = ?", [decoded.userId])

    return NextResponse.json(rows as CourseEnrollment[])
  } catch (error) {
    console.error("Error fetching user courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { courses }: { courses: number[] } = await request.json()

    await pool.execute("DELETE FROM user_courses WHERE user_id = ?", [decoded.userId])

    for (const courseId of courses) {
      await pool.execute("INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)", [decoded.userId, courseId])
    }

    return NextResponse.json({ message: "Course enrollment updated successfully" })
  } catch (error) {
    console.error("Error updating user courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
