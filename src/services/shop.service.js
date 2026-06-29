import Customer from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import { AppError } from "../utils/error.utils.js";


class ShopService {


    async getCart(userId) {
        const customer = await Customer.findById(userId).populate("cart.product");
        if (!customer) throw new AppError(404, "Customer not found");
        return customer.cart;
    }


    async addToCart(userId, productId, quantity) {
        const customer = await Customer.findById(userId);
        if (!customer) throw new AppError(404, "Customer not found");
        const qty = quantity || 1;
        const existingItem = customer.cart.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += qty;
        } else {
            customer.cart.push({ product: productId, quantity: qty });
        }
        await customer.save();
        return customer.cart;
    }


    async updateCartItem(userId, productId, quantity) {
        const customer = await Customer.findById(userId);
        if (!customer) throw new AppError(404, "Customer not found");
        const item = customer.cart.find(i => i.product.toString() === productId);
        if (!item) throw new AppError(404, "Product not in cart");
        item.quantity = quantity;
        await customer.save();
        return customer.cart;
    }


    async removeFromCart(userId, productId) {
        const customer = await Customer.findById(userId);
        if (!customer) throw new AppError(404, "Customer not found");
        customer.cart = customer.cart.filter(item => item.product.toString() !== productId);
        await customer.save();
        return customer.cart;
    }


    async placeOrderWithCart(userId, shippingAddress, totalAmount) {
        if (!shippingAddress || !totalAmount) {
            throw new AppError(400, "Address or TotalAmount Required.");
        }
        const customer = await Customer.findById(userId).populate("cart.product");
        if (!customer) throw new AppError(401, "Not Authorized.");
        if (customer.cart.length === 0) {
            throw new AppError(404, "Your Cart May Be Empty");
        }
        // Create order
        const order = new Order({
            customer: customer._id,
            items: customer.cart.map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
            })),
            totalAmount,
            shippingAddress
        });
        await order.save();
        // Decrease stock
        for (const item of customer.cart) {
            await Product.updateOne(
                { _id: item.product._id },
                [
                    {
                        $set: {
                            quantity: { $toString: { $subtract: [{ $toInt: "$quantity" }, item.quantity] } }
                        }
                    }
                ]
            );
        }
        // Update customer
        customer.ordersHistory.push(order._id);
        customer.cart = [];
        await customer.save();
        return order;
    }


    async placeOrder(userId, shippingAddress, totalAmount, buyquantity, products) {
        if (!shippingAddress || !totalAmount || !products || !buyquantity) {
            throw new AppError(400, "Some Required Data Missing..");
        }
        const customer = await Customer.findById(userId);
        if (!customer) throw new AppError(401, "Not Authorized.");
        // Create order
        const order = new Order({
            customer: customer._id,
            items: [{
                product: products._id,
                quantity: buyquantity,
                price: products.price,
            }],
            totalAmount,
            shippingAddress
        });
        await Product.findOneAndUpdate(
            { _id: products._id },
            [
                {
                    $set: {
                        quantity: { $toString: { $subtract: [{ $toInt: "$quantity" }, { $toInt: buyquantity }] } }
                    }
                }
            ],
            { new: true }
        );
        await order.save();
        // Update customer
        customer.ordersHistory.push(order._id);
        await customer.save();
        return order;
    }


    async getOrdersHistory(userId) {
        const customer = await Customer.findById(userId).populate("ordersHistory").sort({ createdAt: -1 });
        if (!customer) throw new AppError(404, "Customer not found");
        return customer.ordersHistory;
    }


    async getSingleOrderDetails(orderId) {
        const order = await Order.findById(orderId).populate([
            { path: "shippingAddress" },
            { path: "items.product" }
        ]);
        if (!order) throw new AppError(404, "Order not found");
        return order;
    }


    async syncCartItems(userId, items) {
        if (!Array.isArray(items)) {
            throw new AppError(400, "Invalid cart data");
        }
        const customer = await Customer.findById(userId);
        if (!customer) {
            throw new AppError(404, "User not found");
        }
        const updatedCart = [...customer.cart];
        items.forEach(newItem => {
            const existing = updatedCart.find(
                item => item.product.toString() === newItem._id
            );
            if (existing) {
                existing.quantity += newItem.quantity;
            } else {
                updatedCart.push({
                    product: newItem._id,
                    quantity: newItem.quantity,
                });
            }
        });
        customer.cart = updatedCart;
        await customer.save();
        return customer.cart;
    }


    async sameOrderPlaced(userId, orderId) {
        const user = await Customer.findById(userId);
        if (!user) throw new AppError(401, "Not Authorized.");
        const completed = await Order.findById(orderId);
        if (!completed) throw new AppError(404, "Original order not found.");
        if (completed.customer.toString() !== user._id.toString()) {
            throw new AppError(400, "Something went Wrong. May be bug.");
        }
        const { shippingAddress, totalAmount, items, customer } = completed;
        // Create order
        const order = new Order({
            customer,
            items,
            totalAmount,
            shippingAddress
        });
        await order.save();
        // Decrease stock
        for (const item of completed.items) {
            await Product.updateOne(
                { _id: item.product._id },
                [
                    {
                        $set: {
                            quantity: { $toString: { $subtract: [{ $toInt: "$quantity" }, item.quantity] } }
                        }
                    }
                ]
            );
        }
        // Update user
        user.ordersHistory.push(order._id);
        await user.save();
        return order;
    }


    async useCoupon(code, ordervalue, category) {
        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            throw new AppError(404, "Coupon not found.");
        }
        if (!coupon.isActive) {
            throw new AppError(400, "Coupon is not active.");
        }
        if (!coupon.applicableCategories.includes("all") && !coupon.applicableCategories.includes(category)) {
            throw new AppError(400, `Coupon is not applicable for this category.`);
        }
        if (coupon.minOrderValue > ordervalue) {
            throw new AppError(400, `Minimum order value should be ${coupon.minOrderValue} to apply this coupon.`);
        }
        // Check if coupon is expired
        if (new Date() > coupon.expirationDate) {
            throw new AppError(400, "Coupon has expired.");
        }
        // Check usage limit
        if (coupon.usedCount >= coupon.usageLimit) {
            throw new AppError(400, "Coupon usage limit reached.");
        }
        const discounted = (ordervalue * coupon.discountPercentage) / 100;
        // Increment used count
        coupon.usedCount += 1;
        await coupon.save();
        return discounted;
    }
}
export default new ShopService();