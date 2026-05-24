import MongoUserRepository from "../repository/implemention/mongo.user.js";


class UserService {

    constructor() {
        this.userRepository = new MongoUserRepository();
    }

    async register(userData) {

        const existingUser = await this.userRepository.findUserByEmail(userData.email);

        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        const existingPhone = await this.userRepository.findUserByPhone(phone);

        if (existingPhone) return res.status(400).json({ message: "Phone Number already exist" });

        await this.userRepository.createUser(userData)

        // generate token
        const token = user.generateToken();

        // send token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        });
    }

}

export default new UserService();