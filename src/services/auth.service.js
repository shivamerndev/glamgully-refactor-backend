import MongoUserRepository from "../repository/implemention/mongo.user.js";
import { AppError } from "../utils/error.utils.js";
import { createHttpOnlyTokenCookie, generateAccessToken, generateRefreshToken } from "../utils/token.utils.js"

class AuthService {

    constructor() {
        this.userRepository = new MongoUserRepository();
    }

    async register(userData) {

        const existingUser = await this.userRepository.findUserByEmail(userData.email);
        if (existingUser) throw new AppError(400, "Email already registered");

        const existingPhone = await this.userRepository.findUserByPhone(userData.phone);
        if (existingPhone) throw new AppError(400, "Phone Number already exist")

        let newUser = await this.userRepository.createUser(userData)
        if (!newUser) throw new AppError(500, "Registration Failed.")

        const accessToken = generateAccessToken(newUser._id)
        const refreshToken = generateRefreshToken(newUser._id)
        const httpOnly = createHttpOnlyTokenCookie()

        return { accessToken, refreshToken, httpOnly }
    }

    async login(userData) {

        const user = await this.userRepository.findUser(userData.emailOrphone)
        if (!user) throw new AppError(400, "Invalid Credentials.");

        const isMatch = await user.comparePassword(userData.password);
        if (!isMatch) throw new AppError(400, "Invalid Credentials.");

        const accessToken = generateAccessToken(user._id)
        const refreshToken = generateRefreshToken(user._id)
        const httpOnly = createHttpOnlyTokenCookie()

        return { accessToken, refreshToken, httpOnly }
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

        const updatedUser = await this.userRepository.updateUser(userId, user)
        if (!updatedUser) throw new AppError(500, "Update Failed")
        return updatedUser;
    }

    async logout(refreshToken) {

        const blackListedToken = await this.userRepository.findBlackListToken(refreshToken);
        if (blackListedToken) throw new AppError(500, "Bad Request")

        const newBlackList = await this.userRepository.blackListToken(refreshToken);

        return newBlackList;
    }

    async refresh_token(refreshToken, userId) {

        const blackListedToken = await this.userRepository.findBlackListToken(refreshToken);
        if (blackListedToken) throw new AppError(500, "Please sign in again.")

        const newAccessToken = generateAccessToken(userId)
        const newRefreshToken = generateRefreshToken(userId)
        const httpOnly = createHttpOnlyTokenCookie()

        return { newAccessToken, newRefreshToken, httpOnly }
    }

}

export default new AuthService();