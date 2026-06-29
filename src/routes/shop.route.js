import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import shopController from "../controllers/shop.controller.js"

const router = Router()

/**
 * @routes /api/v1/shop
 * @description All Shop Routes
 */

router.post("/cart", userAuth, shopController.addToCart)
router.get("/cart", userAuth, shopController.getCart)
router.delete("/cart/:itemId", userAuth, shopController.removeFromCart)
router.put("/cart/:itemId", userAuth, shopController.updateCartItem)
router.post("/cart/sync", userAuth, shopController.syncCartItems)
router.post("/order", userAuth, shopController.placeOrder)
router.post("/order/same", userAuth, shopController.sameOrderPlaced)
router.post("/coupon/use", userAuth, shopController.useCoupon)


export default router;