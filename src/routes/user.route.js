import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js"

const router = Router()

router.post("/address",userAuth,userController.createAddress)
router.post("/wishlist", userAuth, userController.addToWishlist)
router.delete("/wishlist", userAuth, userController.removeFromWishlist)


export default router;