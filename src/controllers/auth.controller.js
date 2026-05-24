import userValidator from "../validator/user.validator.js"
import userService from "../services/user.service.js";

class AuthController {

    async register(req, res) {

        const userData = req.body;

        try {
            const { error } = userValidator(userData)

            if (error) return res.status(400).json({
                success: false,
                message: error.details[0].message
            })

            await userService.register(req.body)

            res.status(201).json({
                success: true,
                message: "Registered Successfully."
            })

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    };






    loginCustomer = async (req, res) => {
        try {
            const { emailorphone, password } = req.body;
            if (!emailorphone || !password) return res.status(400).json({ message: "Email/Phone and password are required." });
            // find user with password
            const user = await Customer.findOne({ $or: [{ email: emailorphone }, { phone: emailorphone }] }).select("+password")
            if (!user) return res.status(400).json({ message: "Invalid email/phone or password" });
            // compare password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) return res.status(400).json({ message: "Invalid email/phone or password" });
            // generate token 
            const token = user.generateToken();
            // send token in cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });
            res.json({
                message: "Login successful",
                user: { _id: user._id, fullname: user.fullname, email: user.email },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    };
    logoutCustomer = async (req, res) => {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            res.json({ message: "Logged out successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    };
    updateCustomer = async (req, res) => {
        try {
            const userId = req.user._id;
            const updates = req.body;
            // agar password change ho raha hai to hashing pre("save") se hoga
            const user = await Customer.findById(userId).select("+password");
            if (!user) return res.status(404).json({ message: "User not found" });
            Object.assign(user, updates); // merge updates
            await user.save();

            res.json({
                message: "User updated successfully",
                user: { _id: user._id, fullname: user.fullname, email: user.email },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    };
    getCustomerProfile = async (req, res) => {
        try {
            const customer = await Customer.findById(req.user._id)
            if (!customer) return res.status(404).json({ message: "Customer not found" });
            res.status(200).json(customer);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    };
    updatePassword = async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: "Current and new password are required." });
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