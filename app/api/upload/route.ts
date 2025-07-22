import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    try {
      const { v2: cloudinary } = await import("cloudinary")

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "defkzzqcs",
        api_key: process.env.CLOUDINARY_API_KEY || "127675349181961",
        api_secret: process.env.CLOUDINARY_API_SECRET || "vIr4KBfcQa1iaQ7vMlfPAtMg03A",
      })

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

      const result = await cloudinary.uploader.upload(base64, {
        folder: "citu-forum/avatars",
        public_id: `user-${decoded.userId}-${Date.now()}`,
        transformation: [
          { width: 200, height: 200, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
        overwrite: true,
        invalidate: true,
      })

      await pool.execute("UPDATE users SET avatar = ? WHERE id = ?", [result.secure_url, decoded.userId])

      return NextResponse.json({
        url: result.secure_url,
        public_id: result.public_id,
        message: "Avatar uploaded and saved successfully",
      })
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError)

      if (cloudinaryError instanceof Error) {
        if (cloudinaryError.message.includes("Invalid API key")) {
          return NextResponse.json({ error: "Cloudinary configuration error" }, { status: 500 })
        }
        if (cloudinaryError.message.includes("network")) {
          return NextResponse.json({ error: "Network error during upload" }, { status: 503 })
        }
      }

      return NextResponse.json({ error: "Image upload failed. Please try again later." }, { status: 500 })
    }
  } catch (error) {
    console.error("Upload route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
