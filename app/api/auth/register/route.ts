import { type NextRequest, NextResponse } from "next/server"
import { hashPassword, generateToken } from "@/lib/auth"
import pool from "@/lib/db"
import type { DatabaseResult } from "@/types"

interface RegisterRequest {
  username: string
  email: string
  password: string
  courses: number[]
}

interface ExistingUser {
  id: number
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, courses }: RegisterRequest = await request.json()

    if (!username || !email || !password || !courses || courses.length === 0) {
      return NextResponse.json({ error: "All fields are required including at least one course" }, { status: 400 })
    }

    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE username = ? OR email = ?", [
      username,
      email,
    ])

    if ((existingUsers as ExistingUser[]).length > 0) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const [result] = await pool.execute("INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)", [
      username,
      email,
      hashedPassword,
    ])

    const userId = (result as DatabaseResult).insertId

    for (const courseId of courses) {
      await pool.execute("INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)", [userId, courseId])
    }

    await pool.execute("INSERT INTO user_badges (user_id, badge_id) VALUES (?, 1)", [userId])

    const token = generateToken(userId)
    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: userId,
        username,
        email,
        avatar: "/placeholder.svg?height=40&width=40",
        role_name: "Member",
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
