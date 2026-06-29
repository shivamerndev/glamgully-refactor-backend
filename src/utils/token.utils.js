import jwt from "jsonwebtoken"
import { JWT_SECRET, JWT_REFRESH_SECRET, NODE_ENV } from "../config/env.config.js"


const generateAccessToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: NODE_ENV === "development" ? "5h" : "5m" })
}

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: "7d" })
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET)
}

const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET)
}

const createHttpOnlyTokenCookie = () => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, createHttpOnlyTokenCookie }