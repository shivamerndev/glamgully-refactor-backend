import userValidator from "../validator/user.validator.js"
import authService from "../services/auth.service.js";
import { AppError, asyncHandler } from "../utils/error.utils.js"
import { verifyRefreshToken } from "../utils/token.utils.js";


class AuthController {

    register = asyncHandler(async (req, res) => {

        const userData = req.body;
        const { error } = userValidator(userData)

        if (error) throw new AppError(400, error.details[0].message)

        let { accessToken, refreshToken, httpOnly } = await userService.register(req.body)

        res.cookie("refresh_token", refreshToken, httpOnly)
        res.success(201, "Registered Successfully.", { token: accessToken })
    })

    login = asyncHandler(async (req, res) => {

        const { emailOrphone, password } = req.body;

        if (!emailOrphone || !password) throw new AppError(400, "Email/Phone and password are required.");

        let { accessToken, refreshToken, httpOnly } = await userService.login(req.body)

        res.cookie("refresh_token", refreshToken, httpOnly)
        res.success(200, "LoggedIn Successfully.", { token: accessToken })
    })

    getUser = asyncHandler(async (req, res) => {

        let user = await userService.getUser(req.user.id)

        res.success(200, "User Fetched Successfully", user)
    })

    updateUser = asyncHandler(async (req, res) => {

        const userId = req.user.id;
        const updates = req.body;

        let user = await userService.updateUser(userId, updates)

        res.success(200, "Updated Successfully", user)
    })

    logout = asyncHandler(async (req, res) => {

        const userId = req.user.id;
        const refresh_token = req.cookies.refresh_token;

        if (!userId) throw new AppError(400, "Bad Request.")
        if (!refresh_token) throw new AppError(400, "No refresh token found.")

        await userService.logout(refresh_token);

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

        const { newAccessToken, newRefreshToken, httpOnly } = await userService.refresh_token(refresh_token, decoded.id)

        res.cookie(newRefreshToken, httpOnly)

        res.success(200, "Token Refreshed Successfully.", { token: newAccessToken })
    })

}

export default new AuthController();