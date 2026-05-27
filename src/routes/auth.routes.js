import { Router } from "express";
import authController from "../controllers/auth.controller.js"
import { userAuth } from "../middlewares/auth.middleware.js";

const router = Router()

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/user", userAuth, authController.getUser)
router.patch("/user", userAuth, authController.updateUser)
router.post("/logout", userAuth, authController.logout)
router.post("/refresh_token", authController.refreshAccessToken)

export default router;