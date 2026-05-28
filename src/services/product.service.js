import MongoProductRepository from "../repository/implemention/mongo.product.js";


class ProductService {

    constructor() {
        this.productRepository = new MongoProductRepository();
    }

    async createProduct(productData) {
        const product = await this.productRepository.createProduct(productData);
        if (!product) throw new AppError(500, "Product creation failed");
        return product;
    }

    async getAllProducts() {
        const products = await this.productRepository.getAllProducts();
        if (!products) throw new AppError(404, "No products found");
        return products;
    }

}


export default new ProductService();