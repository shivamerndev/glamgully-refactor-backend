import Address from "../models/address.model.js";
import { AppError, asyncHandler } from "../utils/error.utils.js";
import userService from "../services/user.service.js";
import MongoUserRepository from "../repository/implemention/mongo.user.js";
import { createAddressValidator } from "../validator/address.validator.js";


class UserController {

    constructor() {
        this.userRepo = new MongoUserRepository()
    }

    createAddress = asyncHandler(async (req, res) => {
        try {

            const { error } = createAddressValidator.validate(req.body)

            if (error) throw new AppError(400, error.details[0].message)

            const newAddress = new Address(req.body);
            await newAddress.save();

            const customer = await this.userRepo.findUserById(req.user.id);
            customer.address.push(newAddress._id);
            await customer.save(); 

            res.status(201).json(newAddress);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    getAddresses = asyncHandler(async (req, res) => {
        try {
            const customer = await this.userRepo.findUserById(req.user._id).populate("address");
            if (!customer) return res.status(404).json({ message: "Customer not found" });
            res.status(200).json(customer.address);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    updateAddress = asyncHandler(async (req, res) => {
        try {
            const { isDefault } = req.body;
            const { addressId } = req.params;
            if (isDefault) {
                await Address.findOneAndUpdate({ isDefault: true }, { isDefault: false }, { new: true })
            }
            const updatedAddress = await Address.findByIdAndUpdate(addressId, req.body, { new: true });
            if (!updatedAddress) return res.status(404).json({ message: "Address not found" });
            res.status(200).json(updatedAddress);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    removeAddress = asyncHandler(async (req, res) => {
        try {
            const { addressId } = req.params;
            await Address.findByIdAndDelete(addressId);

            const customer = await this.userRepo.findUserById(req.user.id);
            customer.address = customer.address.filter(id => id.toString() !== addressId);
            await customer.save();

            res.status(200).json({ message: "Address removed" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    addToWishlist = asyncHandler(async (req, res) => {
        try {
            const { productId } = req.body;
            const customer = await this.userRepo.findUserById(req.user.id);
            if (!customer.wishlist.includes(productId)) {
                customer.wishlist.push(productId);
                await customer.save();
            }
            res.status(200).json(customer.wishlist);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    getWishlists = asyncHandler(async (req, res) => {
        try {
            const customer = await this.userRepo.findUserById(req.user._id).populate("wishlist");
            if (!customer) return res.status(404).json({ message: "Customer not found" });
            res.status(200).json(customer.wishlist);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    removeFromWishlist = asyncHandler(async (req, res) => {
        try {
            const { productId } = req.body;
            const customer = await this.userRepo.findUserById(req.user.id);
            customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
            await customer.save();
            res.status(200).json(customer.wishlist);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
}

export default new UserController()