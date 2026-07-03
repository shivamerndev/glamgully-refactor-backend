import IProductRepository from "../contract/product.contract.js";
import Product from "../../models/product.model.js"

class MongoProductRepository extends IProductRepository {

    async createProduct(productData) {
        const product = new Product(productData);
        const savedProduct = await product.save();
        return savedProduct;
    }

    async countDocuments(filter = {}) {
        return await Product.countDocuments(filter);
    }

    async findProducts(filter = {}, sortOption = {}, skip = 0, limit = 0) {

        const pipeline = [
            { $match: filter },
            {
                $project: {
                    title: 1,
                    price: 1,
                    ratings: 1,
                    image: { $arrayElemAt: ["$images", 0] },
                },
            },
        ];

        if (Object.keys(sortOption).length > 0) {
            pipeline.push({ $sort: sortOption });
        }

        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }

        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }

        return await Product.aggregate(pipeline);
    }

    
    async getDistinctCategories(filter = {}) {
        return await Product.distinct("category", filter);
    }

    async getProductById(productId, populateOptions = null) {
        let query = Product.findOne({ _id: productId });
        if (populateOptions) {
            query = query.populate(populateOptions);
        }
        return await query;
    }

    async updateProduct(productId, updates) {
        return await Product.findOneAndUpdate(
            { _id: productId },
            { $set: updates },
            { new: true } // Returns the modified document
        );
    }

    async deleteProduct(productId) {
        return await Product.findOneAndDelete({ _id: productId });
    }

    async aggregate(pipeline) {
        return await Product.aggregate(pipeline);
    }

    async updateMany(filter, update) {
        return await Product.updateMany(filter, update);
    }

}

export default MongoProductRepository;