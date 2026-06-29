import MongoProductRepository from "../repository/implemention/mongo.product.js";
import { AppError } from "../utils/error.utils.js";
import { productValidator } from "../validator/product.validator.js";
import { uploadMultipleImages } from "../services/cloudinary.service.js";

class ProductService {

    constructor() {
        this.productRepository = new MongoProductRepository();
    }

    async createProduct(productData, files) {
        const { error } = productValidator(productData);
        if (error) throw new AppError(400, error.details[0].message);

        if (!files || files.length === 0) throw new AppError(400, "Product image is required");
        const imageurls = await uploadMultipleImages(files);

        productData.images = imageurls;
        const product = await this.productRepository.createProduct(productData);
        if (!product) throw new AppError(500, "Product creation failed");
        return product;
    }

    async getAllProducts(query) {

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 8;
        const sort = query.sort || "a-z";
        const skip = (page - 1) * limit;

        const { category, avail, min, max, rating } = query;

        let filter = { isActive: { $ne: false } };

        if (category) filter.category = category;
        if (avail) filter.quantity = avail === 'instock' ? { $gt: 0 } : { $lte: 0 };
        if (min && max) filter.price = { $gte: Number(min), $lte: Number(max) };
        if (rating) filter.ratings = { $exists: true, $gte: Number(rating) };

        const total = await this.productRepository.countDocuments(filter);
        const instock = await this.productRepository.countDocuments({ ...filter, quantity: { $gt: 0 } });
        const outstock = await this.productRepository.countDocuments({ ...filter, quantity: { $lte: 0 } });

        let sortOption = {};
        switch (sort) {
            case "a-z": sortOption = { title: 1 }; break;
            case "z-a": sortOption = { title: -1 }; break;
            case "low-high": sortOption = { price: 1 }; break;
            case "high-low": sortOption = { price: -1 }; break;
            case "oldest": sortOption = { createdAt: 1 }; break;
            case "newest": sortOption = { createdAt: -1 }; break;
        }

        const products = await this.productRepository.findProducts(filter, sortOption, skip, limit);
        const categories = await this.productRepository.getDistinctCategories({ isActive: true });

        return {
            products,
            categories,
            totalPages: Math.ceil(total / limit),
            productsLength: { total, instock, outstock }
        };
    }

    async bestSellingProducts() {
        const filter = { isActive: { $ne: false }, price: { $gt: 300 } };
        const sortOption = { title: -1, price: -1 };
        return await this.productRepository.findProducts(filter, sortOption, 0, 10);
    }

    async getAllProductsAdmin(query) {
        const limit = parseInt(query.limit) || 10;
        const page = parseInt(query.page) || 1;
        const skip = (page - 1) * limit;
        const { category, availability, price, status } = query;

        let filter = {};
        if (category) filter.category = category;
        if (availability) filter.quantity = availability === 'instock' ? { $gt: 0 } : { $lte: 0 };

        if (price && price === '1000+') {
            filter.price = { $gte: 1000, $lte: 20000 };
        } else if (price) {
            const [min, max] = price.split('-').map(Number);
            filter.price = { $gte: min, $lte: max };
        }

        if (status) filter.isActive = status === 'active';

        const lowStocks = await this.productRepository.countDocuments({ quantity: { $lte: 10 } });
        const total = await this.productRepository.countDocuments(filter);
        const products = await this.productRepository.findProducts(filter, { createdAt: -1 }, skip, limit);
        const categories = await this.productRepository.getDistinctCategories({});

        return {
            products,
            categories,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            lowStocks
        };
    }

    async getSingleProduct(productId) {
        const populateOptions = { path: "reviews", options: { sort: { createdAt: -1 } } };
        const product = await this.productRepository.getProductById(productId, populateOptions);
        if (!product) throw new AppError(404, "Product not found");
        return product;
    }

    async editProduct(productId, updates) {
        if (!productId) throw new AppError(400, "Product ID is required");
        const updateData = { ...updates };
        delete updateData._id;

        const product = await this.productRepository.updateProduct(productId, updateData);
        if (!product) throw new AppError(404, "Product not found");
        return product;
    }

    async deleteProduct(productId) {
        const product = await this.productRepository.deleteProduct(productId);
        if (!product) throw new AppError(404, "Product not found");
        return product;
    }

    async searchProduct(search) {
        if (!search || typeof search !== "string" || !search.trim()) {
            throw new AppError(400, "Search term is required");
        }
        const filter = { title: { $regex: search, $options: "i" }, isActive: { $ne: false } };
        return await this.productRepository.findProducts(filter, {}, 0, 0, '_id title');
    }

    async searchProductForAdmin(search) {
        if (!search || typeof search !== "string" || !search.trim()) {
            throw new AppError(400, "Search term is required");
        }
        const filter = { title: { $regex: search, $options: "i" } };
        return await this.productRepository.findProducts(filter);
    }

    async productCategory() {
        const pipeline = [
            {
                $group: {
                    _id: "$category",
                    image: { $first: { $arrayElemAt: ["$productimage", 0] } }
                }
            },
            {
                $project: {
                    name: "$_id",
                    image: 1,
                    _id: 0
                }
            }
        ];
        const categories = await this.productRepository.aggregate(pipeline);
        const activecategory = await this.productRepository.getDistinctCategories({ isActive: false });
        return { categories, activecategory };
    }

    async productCategorypublic() {
        const pipeline = [
            { $match: { isActive: true } },
            {
                $group: {
                    _id: "$category",
                    image: { $first: { $arrayElemAt: ["$productimage", 0] } }
                }
            },
            {
                $project: {
                    name: "$_id",
                    image: 1,
                    _id: 0
                }
            }
        ];
        return await this.productRepository.aggregate(pipeline);
    }

    async productCategoryArchieve(category, event) {
        const result = await this.productRepository.updateMany(
            { category: category },
            { $set: { isActive: !event } }
        );
        return result;
    }

    async TrendingProducts() {
        return await this.productRepository.findProducts({}, { reviewsCount: -1 }, 0, 8);
    }

}

export default new ProductService();