import IUserRepository from "../contract/user.contract.js";
import User from "../../models/customer.model.js";
import { AppError, asyncHandler } from "../../utils/error.utils.js";

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

}

export default MongoUserRepository;