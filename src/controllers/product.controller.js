import { asyncHandler } from "../utils/error.utils.js";
import productService from "../services/product.service.js";

class ProductController {

    createProduct = asyncHandler(async (req, res) => {
        const productimages = req.files;
        await productService.createProduct(req.body, productimages);
        res.success(201, "Product created successfully");
    })

    getAllProducts = asyncHandler(async (req, res) => {
        const result = await productService.getAllProducts(req.query);
        res.success(200, "Products fetched successfully", result);
    })

    bestSellingProducts = asyncHandler(async (req, res) => {
        const products = await productService.bestSellingProducts();
        res.success(200, "Best selling products fetched successfully", products);
    })

    getAllProductsAdmin = asyncHandler(async (req, res) => {
        const result = await productService.getAllProductsAdmin(req.query);
        res.success(200, "Admin products fetched successfully", result);
    })

    getSingleProduct = asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const product = await productService.getSingleProduct(productId);
        res.success(200, "Product fetched successfully", product);
    })

    editProduct = asyncHandler(async (req, res) => {
        const { _id, ...updates } = req.body;
        const product = await productService.editProduct(_id, updates);
        res.success(200, "Product updated successfully", product);
    })

    deleteProduct = asyncHandler(async (req, res) => {
        const { productId } = req.params;
        await productService.deleteProduct(productId);
        res.success(200, "Product deleted successfully");
    })

    searchProduct = asyncHandler(async (req, res) => {
        const { search } = req.body;
        const products = await productService.searchProduct(search);
        res.success(200, "Products searched successfully", products);
    })

    searchProductForAdmin = asyncHandler(async (req, res) => {
        const { search } = req.body;
        const products = await productService.searchProductForAdmin(search);
        res.success(200, "Admin products searched successfully", products);
    })

    productCategory = asyncHandler(async (req, res) => {
        const result = await productService.productCategory();
        res.success(200, "Product categories fetched successfully", result);
    })

    productCategorypublic = asyncHandler(async (req, res) => {
        const categories = await productService.productCategorypublic();
        res.success(200, "Public product categories fetched successfully", categories);
    })

    productCategoryArchieve = asyncHandler(async (req, res) => {
        const { category, event } = req.body;
        const result = await productService.productCategoryArchieve(category, event);
        res.success(200, "Query Successfully Resolved.", result);
    })

    TrendingProducts = asyncHandler(async (req, res) => {
        const products = await productService.TrendingProducts();
        res.success(200, "Trending products fetched successfully", products);
    })

}

export default new ProductController();