import { NextResponse } from "next/server"
import pool from "@/lib/db"
import type { Course } from "@/types"

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT c.id, c.name, col.name as college_name
      FROM courses c
      JOIN colleges col ON c.college_id = col.id
      ORDER BY col.name, c.name
    `)

    return NextResponse.json(rows as Course[])
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
