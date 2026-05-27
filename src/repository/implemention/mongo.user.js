import IUserRepository from "../contract/user.contract.js";
import User from "../../models/customer.model.js";
import Token from "../../models/token.model.js"


class MongoUserRepository extends IUserRepository {

    async createUser(userData) {
        const user = new User(userData);
        const savedUser = await user.save();
        return savedUser;
    }

    async findUser(emailOrphone) {
        return await User.findOne({
            $or: [
                { email: emailOrphone },
                { phone: emailOrphone }
            ]
        }).select("+password")
    }

    async findUserByEmail(email) {
        return await User.findOne({ email })
    }

    async findUserById(id) {
        return await User.findById(id)
    }

    async findUserByPhone(phone) {
        return await User.findOne({ phone })
    }

    async updateUser(userId, updateObj) {
        return await User.findByIdAndUpdate(userId, updateObj, { new: true });
    }

    async blackListToken(token) {
        return await Token.create({ token });
    }

    async findBlackListToken(token) {
        return await Token.findOne({ token });
    }

}

export default MongoUserRepository;