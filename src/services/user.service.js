import MongoUserRepository from "../repository/implemention/mongo.user.js";
import { AppError } from "../utils/error.utils.js";
import Address from "../models/address.model.js";
import { createAddressValidator } from "../validator/address.validator.js";

class UserService {

    constructor() {
        this.userRepository = new MongoUserRepository();
    }

    async createAddress(userId, addressData) {
        const { error } = createAddressValidator.validate(addressData);
        if (error) throw new AppError(400, error.details[0].message);

        const newAddress = new Address({ ...addressData, userId });
        await newAddress.save();

        const customer = await this.userRepository.findUserById(userId);
        if (!customer) throw new AppError(404, "Customer not found");

        customer.address.push(newAddress._id);
        await customer.save();

        return newAddress;
    }

    async getAddresses(userId) {
        const customer = await this.userRepository.findUserById(userId);
        if (!customer) throw new AppError(404, "Customer not found");
        
        await customer.populate("address");
        return customer.address;
    }

    async updateAddress(addressId, addressData) {
        const { isDefault } = addressData;
        if (isDefault) {
            await Address.findOneAndUpdate({ isDefault: true }, { isDefault: false }, { new: true });
        }
        const updatedAddress = await Address.findByIdAndUpdate(addressId, addressData, { new: true });
        if (!updatedAddress) throw new AppError(404, "Address not found");
        return updatedAddress;
    }

    async removeAddress(userId, addressId) {
        await Address.findByIdAndDelete(addressId);

        const customer = await this.userRepository.findUserById(userId);
        if (!customer) throw new AppError(404, "Customer not found");

        customer.address = customer.address.filter(id => id.toString() !== addressId);
        await customer.save();
    }

    async addToWishlist(userId, productId) {
        const customer = await this.userRepository.findUserById(userId);
        if (!customer) throw new AppError(404, "Customer not found");

        if (!customer.wishlist.includes(productId)) {
            customer.wishlist.push(productId);
            await customer.save();
        }
        return customer.wishlist;
    }

    async getWishlist(userId) {
        const customer = await this.userRepository.findUserById(userId);
        if (!customer) throw new AppError(404, "Customer not found");

        await customer.populate("wishlist");
        return customer.wishlist;
    }

    async removeFromWishlist(userId, productId) {
        const customer = await this.userRepository.findUserById(userId);
        if (!customer) throw new AppError(404, "Customer not found");

        customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
        await customer.save();
        return customer.wishlist;
    }
}

export default new UserService();