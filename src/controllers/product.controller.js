import { productValidator } from "../validator/product.validator.js"
import { getCloudinaryResponse, uploadMultipleImages } from "../utils/cloudinary.js"
import { asyncHandler } from "../utils/error.utils.js";
import productService from "../services/product.service.js";


class ProductController {

    createProduct = asyncHandler(async (req, res) => {

        const productimages = req.files;

        const { error } = productValidator(req.body)
        if (error) throw new AppError(400, error.details[0].message)

        if (!productimages) throw new AppError(400, "Product image is required")
        const imageurls = await uploadMultipleImages(productimages)

        req.body.images = imageurls;

        await productService.createProduct(req.body);

        res.success(201, "Product created successfully");
    })



    getAllProducts = asyncHandler(async (req, res) => {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const sort = req.query.sort || "a-z";
        const skip = (page - 1) * limit;
        const { category, avail, min, max, rating } = req.query;


        let filter = { isActive: { $ne: false } };
        // Add category filter only if category is provided and not 'all'
        if (category) {
            filter.category = category;
        }
        if (avail) {
            filter.quantity = avail === 'instock' ? { $gt: 0 } : { $lte: 0 }
        }
        if (min && max) {
            filter.price = { $gte: min, $lte: max };
        }
        if (rating) {
            filter.ratings = { $exists: true, $gte: Number(rating) };
        }
        const total = await productModel.countDocuments(filter);
        const instock = await productModel.countDocuments({ ...filter, quantity: { $gt: 0 } });
        const outstock = await productModel.countDocuments({ ...filter, quantity: { $lte: 0 } });

        // sort products
        let sortOption = {};
        switch (sort) {
            case "a-z": sortOption = { title: 1 }; break;         // A-Z
            case "z-a": sortOption = { title: -1 }; break;        // Z-A
            case "low-high": sortOption = { price: 1 }; break;        // Low to High
            case "high-low": sortOption = { price: -1 }; break;       // High to Low
            case "oldest": sortOption = { createdAt: 1 }; break;    // Old to New
            case "newest": sortOption = { createdAt: -1 }; break;   // New to Old
        }

        // Paged products
        const products = await productModel.find(filter).sort(sortOption).skip(skip).limit(limit);
        const categories = await productModel.distinct("category", { isActive: true })
        res.status(200).json({ products, categories, totalPages: Math.ceil(total / limit), productsLength: { total, instock, outstock } });
    })




    bestSellingProducts = async (req, res) => {
        try {
            const products = await productModel
                .find({ isActive: { $ne: false }, price: { $gt: 300 } })
                .sort({ title: -1, price: -1 }) // Sort by price descending, then title ascending
                .limit(10);
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };


    getAllProductsAdmin = async (req, res) => {
        const limit = parseInt(req.query.limit) || 10;    // products per page
        const page = parseInt(req.query.page) || 1;       // current page
        const skip = (page - 1) * limit;   // how many to skip
        const { category, availability, price, status } = req.query;
        try {
            let filter = {};
            // Add category filter only if category is provided and not 'all'
            if (category) {
                filter.category = category;
            }
            if (availability) {
                filter.quantity = availability === 'instock' ? { $gt: 0 } : { $lte: 0 }
            }
            if (price && price === '1000+') {
                filter.price = { $gte: "1000", $lte: "20000" };
            } else if (price) {
                // const [min, max] = price.split('-').map(num=> parseInt(num));
                const [min, max] = price.split('-').map(Number); // convert to numbers
                filter.price = { $gte: min, $lte: max };
            }
            if (status) {
                filter.isActive = { $eq: status === 'active' ? true : false };
            }

            const lowStocks = await productModel.countDocuments({ quantity: { $lte: 10 } });
            const total = await productModel.countDocuments(filter);
            const products = await productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
            const categories = await productModel.distinct("category")
            res.status(200).json({ products, categories, totalPages: Math.ceil(total / limit), totalProducts: total, lowStocks });
        } catch (error) {
            res.send(error.message)
        }
    }



    getSingleProduct = async (req, res) => {
        try {
            const { productId } = req.params;
            const product = await productModel.findOne({ _id: productId }).populate({
                path: "reviews",
                options: { sort: { createdAt: -1 } } // latest review first
            });
            res.send(product)
        } catch (error) {
            res.send(error.message)
        }
    }


    editProduct = async (req, res) => {
        try {
            const newObj = req.body;
            let product = await productModel.findOne({ _id: newObj._id });
            if (!product) return res.status(404).send("Product not found");

            // Update product fields with newObj values
            Object.keys(newObj).forEach(key => {
                if (key !== "_id") {
                    product[key] = newObj[key];
                }
            });
            await product.save();
            res.status(200).send(product);
        } catch (error) {
            res.send(error.message)
        }
    }


    deleteProduct = async (req, res) => {
        try {
            const { productId } = req.params;
            await productModel.findOneAndDelete({ _id: productId });
            res.status(200).send({ message: "Product deleted successfully" });
        } catch (error) {
            res.send(error.message)
        }
    }


    searchProduct = async (req, res) => {
        try {
            const { search } = req.body;
            if (!search || typeof search !== "string" || !search.trim()) {
                return res.status(400).json({ message: "Search term is required" });
            }
            // Use case-insensitive partial match for better search experience
            const products = await productModel.find({
                title: { $regex: search, $options: "i" },
                isActive: { $ne: false }
            }).select('_id title');
            res.status(200).json(products);
        } catch (error) {
            res.send(error.message)
        }
    }


    searchProductForAdmin = async (req, res) => {
        try {
            const { search } = req.body;
            if (!search || typeof search !== "string" || !search.trim()) {
                return res.status(400).json({ message: "Search term is required" });
            }
            // Use case-insensitive partial match for better search experience
            const products = await productModel.find({
                title: { $regex: search, $options: "i" }
            });
            res.status(200).json(products);
        } catch (error) {
            res.send(error.message)
        }
    }


    productCategory = async (req, res) => {
        try {
            const categories = await productModel.aggregate([
                {
                    $group: {
                        _id: "$category",
                        image: { $first: { $arrayElemAt: ["$productimage", 0] } } // category ka ek product image lelo
                    }
                },
                {
                    $project: {
                        name: "$_id",
                        image: 1,
                        _id: 0
                    }
                }
            ])
            const activecategory = await productModel.distinct("category", { isActive: false })
            res.status(200).json({ categories, activecategory });
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }


    productCategorypublic = async (req, res) => {
        try {
            const categories = await productModel.aggregate([
                {
                    $match: { isActive: true } // ✅ sirf active products
                },
                {
                    $group: {
                        _id: "$category",
                        image: { $first: { $arrayElemAt: ["$productimage", 0] } } // category ka ek product image lelo
                    }
                },
                {
                    $project: {
                        name: "$_id",
                        image: 1,
                        _id: 0
                    }
                }
            ])
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }


    productCategoryArchieve = async (req, res) => {
        const { category, event } = req.body;
        try {
            const result = await productModel.updateMany(
                { category: category },
                { $set: { isActive: !event } }
            );
            res.json({ message: "Query Successfully Resolved.", result });
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }


    TrendingProducts = async (req, res) => {
        try {
            let products = await productModel.find().limit(8).sort({ reviewsCount: -1 })
            res.status(200).send(products);
        } catch (error) {
            res.status(500).send(error.message);
        }
    };

}

export default new ProductController();