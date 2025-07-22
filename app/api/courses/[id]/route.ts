import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [rows] = await pool.execute(
      `
      SELECT c.id, c.name, c.description, col.name as college_name, col.id as college_id
      FROM courses c
      JOIN colleges col ON c.college_id = col.id
      WHERE c.id = ?
    `,
      [id],
    )

    const courses = rows as any[]
    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(courses[0])
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
