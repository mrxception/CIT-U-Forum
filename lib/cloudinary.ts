import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: "defkzzqcs",
  api_key: "127675349181961",
  api_secret:"vIr4KBfcQa1iaQ7vMlfPAtMg03A",
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
