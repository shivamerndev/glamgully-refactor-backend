import { Router } from "express";
import ProductController from "../controllers/product.controller.js";
import upload from "../config/multer.config.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import Product from "../models/product.model.js";

const router = Router()

/**
 * @routes /api/v1/product
 * @description All Product Routes
 */

router.post("/create", upload.array("productimage", 5), ProductController.createProduct)
router.get("/all", ProductController.getAllProducts)
router.get("/:productId", ProductController.getSingleProduct)

// router.get("/getproduct", ProductController.getAllProducts)
router.get("/best/products", ProductController.bestSellingProducts)
router.get("/getadminproduct", userAuth, ProductController.getAllProductsAdmin)
router.post("/editproduct", ProductController.editProduct)
router.post("/deleteproduct/:productId", ProductController.deleteProduct)
router.post("/search", ProductController.searchProduct)
router.post("/admin/search", userAuth, ProductController.searchProductForAdmin)
router.get("/highest/price", async (req, res) => {
    try {
        const highest = await Product.findOne({ isActive: true }).sort({ price: -1 }).select("price");
        res.status(200).send(highest.price)
    } catch (error) {
        res.status(400).send(error.message)
    }
})
router.get("/category", ProductController.productCategory)
// router.get("/category/public", ProductController.productCategorypublic)
router.post("/archive-category", ProductController.productCategoryArchieve)
router.get("/trending", ProductController.TrendingProducts)

export default router;