class IProductRepository {

    async createProduct(productData) {
        throw new Error("Method not implemented")
    }

    async countDocuments(filter) {
        throw new Error("Method not implemented")
    }

    async findProducts(filter, sortOption, skip, limit, selectFields) {
        throw new Error("Method not implemented")
    }

    async getDistinctCategories(filter) {
        throw new Error("Method not implemented")
    }

    async getProductById(productId, populateOptions) {
        throw new Error("Method not implemented")
    }

    async updateProduct(productId, updates) {
        throw new Error("Method not implemented")
    }

    async deleteProduct(productId) {
        throw new Error("Method not implemented")
    }

    async aggregate(pipeline) {
        throw new Error("Method not implemented")
    }

    async updateMany(filter, update) {
        throw new Error("Method not implemented")
    }

}

export default IProductRepository
