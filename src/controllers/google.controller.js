import { OAuth2Client } from "google-auth-library";
import { loginService, registerService } from "../services/auth.service.js";
import { GOOGLE_CLIENT_ID } from "../config/env.config.js"
import handleError from "../utils/error.utils.js";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleAuth = handleError(async (req, res) => {

    const { idToken } = req.body;

    // verify token with google
    const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });

    const payload = ticket.getPayload();

    const { sub: googleId, name: fullName, email, picture: profileImage } = payload;
    const username = email.split("@")[0]

    const response = await registerService({ googleId, fullName, email, profileImage, username })

    if (!response) {
        let user = await loginService({ email })
        if (!user) return res.status(401).json({ success: false, message: "Invalid Credentials" })
        let token = await user.generateToken({ id: user._id })
        res.cookie("token", token)
        return res.status(200).json({ success: true, message: "LoggedIn Successfully." })
    }

    let token = await response.generateToken({ id: response._id })

    res.cookie("token", token)
    res.status(201).json({ message: "User Registered Successfully.", success: true })
})