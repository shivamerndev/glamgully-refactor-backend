import IProductRepository from "../contract/product.contract";
import Product from "../../models/product.model.js"

class MongoProductRepository extends IProductRepository {

    async createProduct(productData) {
        const product = new Product(productData);
        const savedProduct = await product.save();
        return savedProduct;
    }

    async getAllProducts() {
        return await Product.find();
    }

}

export default MongoProductRepository