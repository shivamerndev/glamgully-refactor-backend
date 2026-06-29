import authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/error.utils.js"

class AuthController {

    googleAuth = asyncHandler(async (req, res) => {
        const { idToken } = req.body;

        let { accessToken, refreshToken, httpOnly } = await authService.googleService(idToken)
        res.cookie("refresh_token", refreshToken, httpOnly)

        res.success(200, "Authentication Successfully.", { token: accessToken })
    })


    register = asyncHandler(async (req, res) => {
        let { accessToken, refreshToken, httpOnly } = await authService.register(req.body)

        res.cookie("refresh_token", refreshToken, httpOnly)
        res.success(201, "Registered Successfully.", { token: accessToken })
    })


    login = asyncHandler(async (req, res) => {
        let { accessToken, refreshToken, httpOnly } = await authService.login(req.body)

        res.cookie("refresh_token", refreshToken, httpOnly)
        res.success(200, "LoggedIn Successfully.", { token: accessToken })
    })


    getUser = asyncHandler(async (req, res) => {
        const userId = req.user.id || req.user._id;
        let user = await authService.getUser(userId)

        res.success(200, "User Fetched Successfully", user)
    })


    updateUser = asyncHandler(async (req, res) => {
        const userId = req.user.id || req.user._id;
        const updates = req.body;

        let user = await authService.updateUser(userId, updates)

        res.success(200, "Updated Successfully", user)
    })


    logout = asyncHandler(async (req, res) => {
        const userId = req.user.id || req.user._id;
        const refresh_token = req.cookies.refresh_token;

        await authService.logout(userId, refresh_token);

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        })

        res.success(200, "Logged Out Successfully.")
    });
    

    refreshAccessToken = asyncHandler(async (req, res) => {
        const refresh_token = req.cookies.refresh_token

        const { accessToken, refreshToken, httpOnly } = await authService.refreshAccessToken(refresh_token)

        res.cookie("refresh_token", refreshToken, httpOnly)

        res.success(200, "Token Refreshed Successfully.", { token: accessToken })
    })

}

export default new AuthController();