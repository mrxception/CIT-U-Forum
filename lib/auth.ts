import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pool from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  username: string
  email: string
  avatar: string
  role_id: number
  role_name: string
  banned: boolean
  created_at: string
  last_login: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const [rows] = await pool.execute(
      `
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `,
      [id],
    )

    const users = rows as any[]
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const [rows] = await pool.execute(
      `
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.username = ? AND u.banned = FALSE
    `,
      [username],
    )

    const users = rows as any[]
    if (users.length === 0) return null

    const user = users[0]
    const isValid = await verifyPassword(password, user.hashed_password)

    if (isValid) {
      await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id])
      return user
    }

    return null
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}
