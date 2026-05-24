import IUserRepository from "../contract/user.contract.js";
import User from "../../models/customer.model.js";
import { AppError } from "../../utils/error.utils.js";

class MongoUserRepository extends IUserRepository {

    async createUser(userData) {
        try {
            const user = new User(userData);
            const savedUser = await user.save();
            return savedUser;
        } catch (error) {
            console.error("Error creating user:", error);
            throw new AppError(`Failed to create user: ${error.message}`, 500, error);
        }
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
        try {
            return await User.findByIdAndUpdate(userId, updateObj, { new: true });
        } catch (error) {
            throw new AppError("Failed to update user", 500, error);
        }
    }

}

export default MongoUserRepository;