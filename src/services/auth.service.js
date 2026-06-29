import MongoUserRepository from "../repository/implemention/mongo.user.js";
import { AppError } from "../utils/error.utils.js";
import { createHttpOnlyTokenCookie, generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.utils.js"
import { GOOGLE_CLIENT_ID } from "../config/env.config.js"
import { OAuth2Client } from "google-auth-library"
import { registerSchema } from "../validator/auth.validator.js";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

class AuthService {

    constructor() {
        this.userRepository = new MongoUserRepository();

        this.getTokens = (userId) => {
            const accessToken = generateAccessToken(userId)
            const refreshToken = generateRefreshToken(userId)
            const httpOnly = createHttpOnlyTokenCookie()

            return { accessToken, refreshToken, httpOnly }
        }
    }

    async googleService(idToken) {

        if (!idToken) throw new AppError(400, "Id Token Must be Provided.")

        const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });

        const payload = ticket.getPayload();

        const { name: fullName, email, sub: googleId } = payload;

        let user = await this.userRepository.findUserByEmail(email);

        if (!user) {
            user = await this.userRepository.createUser({ fullName, email, googleId });
        }

        const tokens = this.getTokens(user._id)

        return tokens
    }


    async register(userData) {

        const { error } = registerSchema.validate(userData);
        if (error) throw new AppError(400, error.details[0].message);

        const existingUser = await this.userRepository.findUserByEmail(userData.email);
        if (existingUser) throw new AppError(400, "Email already registered");

        const existingPhone = await this.userRepository.findUserByPhone(userData.phone);
        if (existingPhone) throw new AppError(400, "Phone Number already exist")

        let newUser = await this.userRepository.createUser(userData)
        if (!newUser) throw new AppError(500, "Registration Failed.")

       const tokens = this.getTokens(newUser._id)

        return tokens
    }


    async login(userData) {

        if (!userData.emailOrphone || !userData.password) {
            throw new AppError(400, "Email/Phone and password are required.");
        }

        const user = await this.userRepository.findUser(userData.emailOrphone)
        if (!user) throw new AppError(400, "Invalid Credentials.");

        const isMatch = await user.comparePassword(userData.password);
        if (!isMatch) throw new AppError(400, "Invalid Credentials.");

        const tokens = this.getTokens(user._id)

        return tokens
    }


    async getUser(userId) {
        const user = await this.userRepository.findUserById(userId)
        if (!user) throw new AppError(404, "user not found.")

        return user;
    }


    async updateUser(userId, updates) {

        const user = await this.userRepository.findUserById(userId)
        if (!user) throw new AppError(404, "user not found.")

        if (updates.email) {
            const existingUser = await this.userRepository.findUserByEmail(updates.email);
            if (existingUser) throw new AppError(400, "Email already registered");
        }

        if (updates.phone) {
            const existingPhone = await this.userRepository.findUserByPhone(updates.phone);
            if (existingPhone) throw new AppError(400, "Phone Number already exist")
        }

        const updatedUser = await this.userRepository.updateUser(userId, updates)
        if (!updatedUser) throw new AppError(500, "Update Failed")
        return updatedUser;
    }


    async logout(userId, refreshToken) {

        if (!userId) throw new AppError(400, "Bad Request.")
        if (!refreshToken) throw new AppError(400, "No refresh token found.")

        const blackListedToken = await this.userRepository.findBlackListToken(refreshToken);
        if (blackListedToken) throw new AppError(500, "Bad Request")

        const newBlackList = await this.userRepository.blackListToken(refreshToken);

        return newBlackList;
    }
    

    async refresh_token(refreshToken, userId) {

        const blackListedToken = await this.userRepository.findBlackListToken(refreshToken);
        if (blackListedToken) throw new AppError(500, "Please sign in again.")

       const tokens = this.getTokens(userId)

        return tokens
    }

    async refreshAccessToken(refreshToken) {
        if (!refreshToken) throw new AppError(400, "Refresh Token Must be Provided.");
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || !decoded.id) throw new AppError(401, "Invalid Refresh Token");
        return await this.refresh_token(refreshToken, decoded.id);
    }

}

export default new AuthService();