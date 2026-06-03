import "dotenv/config"
import { AppError } from "../utils/error.utils.js"

export const {
  PORT,
  MONGO_URI,
  NODE_ENV,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
} = process.env

const checkVariables = { 
  PORT,
  MONGO_URI,
  NODE_ENV,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
}

Object.entries(checkVariables).forEach(([key, value]) => {
  if (!value) {
    console.log(`Missing Environment Variable: ${key}`)
    throw new AppError(400, `Missing Environment Variable : ${key}`)
  }
})