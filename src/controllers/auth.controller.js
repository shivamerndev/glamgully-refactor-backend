import userValidator from "../validator/user.validator.js"
import userService from "../services/user.service.js";
import { AppError, asyncHandler } from "../utils/error.utils.js"


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

        const refresh_token = req.cookies.refresh_token
        if (!refresh_token) throw new AppError(400, "No refresh token found.")

            let blackList = userService.

        res.clearCookie("refresh_token")
        res.success(200, "Logged Out Successfully.")
    });






    refreshAccessToken() {

    }

    resetPassword = async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new AppError(400, "Current and new password are required.");
            }
            const user = await Customer.findById("68bebdf0119ae77d142e3197").select("+password");
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({ message: "Current password is incorrect." });
            }
            user.password = newPassword;
            await user.save();
            return res.status(200).json({ message: "Password updated successfully." });
        } catch (error) {
            console.error("Update password error:", error);
            res.status(500).json({ message: "Server error. Please try again later." });
        }
    };

}

export default new AuthController();