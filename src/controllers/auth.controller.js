import { registerSchema } from "../validator/auth.validator.js"
import authService from "../services/auth.service.js";
import { AppError, asyncHandler } from "../utils/error.utils.js"
import { verifyRefreshToken } from "../utils/token.utils.js";
import { GOOGLE_CLIENT_ID } from "../config/env.config.js"



const client = new OAuth2Client(GOOGLE_CLIENT_ID);


class AuthController {


    googleAuth = asyncHandler(async (req, res) => {

        const { idToken } = req.body;

        let { accessToken, refreshToken, httpOnly } = await authService.googleService(idToken)
        res.cookie("refresh_token", refreshToken, httpOnly)

        res.success(200, "Authentication Successfully.", {token : accessToken })
    })

    register = asyncHandler(async (req, res) => {

        const userData = req.body;
        const { error } = registerSchema.validate(userData)

        if (error) throw new AppError(400, error.details[0].message)

        let { accessToken, refreshToken, httpOnly } = await authService.register(req.body)

        res.cookie("refresh_token", refreshToken, httpOnly)
        res.success(201, "Registered Successfully.", { token: accessToken })
    })

    login = asyncHandler(async (req, res) => {

        const { emailOrphone, password } = req.body;

        if (!emailOrphone || !password) throw new AppError(400, "Email/Phone and password are required.");

        let { accessToken, refreshToken, httpOnly } = await authService.login(req.body)

        res.cookie("refresh_token", refreshToken, httpOnly)
        res.success(200, "LoggedIn Successfully.", { token: accessToken })
    })

    getUser = asyncHandler(async (req, res) => {

        let user = await authService.getUser(req.user.id)

        res.success(200, "User Fetched Successfully", user)
    })

    updateUser = asyncHandler(async (req, res) => {

        const userId = req.user.id;
        const updates = req.body;

        let user = await authService.updateUser(userId, updates)

        res.success(200, "Updated Successfully", user)
    })

    logout = asyncHandler(async (req, res) => {

        const userId = req.user.id;
        const refresh_token = req.cookies.refresh_token;

        if (!userId) throw new AppError(400, "Bad Request.")
        if (!refresh_token) throw new AppError(400, "No refresh token found.")

        await authService.logout(refresh_token);

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        })

        res.success(200, "Logged Out Successfully.")
    });

    refreshAccessToken = asyncHandler(async (req, res) => {

        const refresh_token = req.cookies.refresh_token
        if (!refresh_token) throw new AppError(400, "Refresh Token Must be Provided.")

        const decoded = verifyRefreshToken(refresh_token)

        const { newAccessToken, newRefreshToken, httpOnly } = await authService.refresh_token(refresh_token, decoded.id)

        res.cookie(newRefreshToken, httpOnly)

        res.success(200, "Token Refreshed Successfully.", { token: newAccessToken })
    })

}

export default new AuthController();