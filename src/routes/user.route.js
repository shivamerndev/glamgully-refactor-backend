import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js"

const router = Router()

/**
 * @routes /api/v1/user
 * @description All User Routes
 */

router.post("/address", userAuth, userController.createAddress)
router.get("/address", userAuth, userController.getAddresses)
router.put("/address/:addressId", userAuth, userController.updateAddress)
router.delete("/address/:addressId", userAuth, userController.removeAddress)

router.post("/wishlist", userAuth, userController.addToWishlist)
router.delete("/wishlist", userAuth, userController.removeFromWishlist)
router.get("/wishlist", userAuth, userController.getWishlists)


export default router;