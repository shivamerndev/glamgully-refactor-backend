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

    async findProducts(filter = {}, sortOption = {}, skip = 0, limit = 0, selectFields = null) {
        let query = Product.find(filter);
        if (Object.keys(sortOption).length > 0) query = query.sort(sortOption);
        if (skip > 0) query = query.skip(skip);
        if (limit > 0) query = query.limit(limit);
        if (selectFields) query = query.select(selectFields);
        return await query;
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