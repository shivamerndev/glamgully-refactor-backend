import { asyncHandler } from "../utils/error.utils.js";
import userService from "../services/user.service.js";

class UserController {

    createAddress = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const newAddress = await userService.createAddress(userId, req.body);
        return res.success(201, "Address created successfully", newAddress);
    })

    getAddresses = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const addresses = await userService.getAddresses(userId);
        return res.success(200, "Addresses fetched successfully", addresses);
    })

    updateAddress = asyncHandler(async (req, res) => {
        const { addressId } = req.params;
        const updatedAddress = await userService.updateAddress(addressId, req.body);
        return res.success(200, "Address updated successfully", updatedAddress);
    })

    removeAddress = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { addressId } = req.params;
        await userService.removeAddress(userId, addressId);
        return res.success(200, "Address removed successfully");
    })

    addToWishlist = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { productId } = req.body;
        const wishlist = await userService.addToWishlist(userId, productId);
        return res.success(200, "Wishlist updated successfully", wishlist);
    })

    getWishlists = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const wishlist = await userService.getWishlist(userId);
        return res.success(200, "Wishlists fetched successfully", wishlist);
    })

    removeFromWishlist = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { productId } = req.body;
        const wishlist = await userService.removeFromWishlist(userId, productId);
        return res.success(200, "Wishlist removed successfully", wishlist);
    })
}

export default new UserController();