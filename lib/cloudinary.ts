import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

export async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping()
    return { success: true, result }
  } catch (error) {
    return { success: false, error }
  }
}
