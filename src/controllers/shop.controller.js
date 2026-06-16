import Customer from "../models/user.model.js";
import Product from "../models/product.model.js";
import orderModel from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import { asyncHandler } from "../utils/error.utils.js";


class ShopController { 

    getCart = asyncHandler(async (req, res) => {
        try {
            const customer = await Customer.findById(req.user._id).populate("cart.product");
            if (!customer) return res.status(404).json({ message: "Customer not found" });
            res.status(200).json(customer.cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    addToCart = asyncHandler(async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const customer = await Customer.findById(req.user.id);
            const existingItem = customer.cart.find(item => item.product.toString() === productId);

            if (existingItem) {
                existingItem.quantity += quantity || 1;
            } else {
                customer.cart.push({ product: productId, quantity: quantity || 1 });
            }

            await customer.save();
            res.status(200).json(customer.cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    updateCartItem = asyncHandler(async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const customer = await Customer.findById(req.user.id);
            const item = customer.cart.find(i => i.product.toString() === productId);
            if (item) {
                item.quantity = quantity;
                await customer.save();
                res.status(200).json(customer.cart);
            } else {
                res.status(404).json({ message: "Product not in cart" });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    removeFromCart = asyncHandler(async (req, res) => {
        try {
            const { productId } = req.body;
            const customer = await Customer.findById(req.user.id);
            customer.cart = customer?.cart?.filter(item => item.product.toString() !== productId);
            await customer.save();
            res.status(200).json(customer.cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    placeOrderWithCart = asyncHandler(async (req, res) => {
        const { shippingAddress, totalAmount } = req.body;
        try {
            if (!shippingAddress || !totalAmount) return res.status(400).send("Address or TotalAmount Required.")
            const customer = await Customer.findById(req.user.id).populate("cart.product")
            if (!customer) return res.status(401).send("Not Authorized.")
            if (customer.cart.length === 0) return res.status(404).send("Your Cart May Be Empty")
            // ✅ Create order
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
            await order.save()

            // ✅ Decrease stock using Aggregation Pipeline update
            for (const item of customer.cart) {
                await Product.updateOne({ _id: item.product._id },
                    [{
                        $set: {
                            // convert string->int, subtract quantity, convert back to string
                            quantity: { $toString: { $subtract: [{ $toInt: "$quantity" }, item.quantity] } }
                        }
                    }]);
            }
            // ✅ Update customer
            customer.ordersHistory.push(order._id);
            customer.cart = [];
            await customer.save();

            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    })


    placeOrder = asyncHandler(async (req, res) => {
        const { shippingAddress, totalAmount, buyquantity, products } = req.body;
        try {
            if (!shippingAddress || !totalAmount || !products || !buyquantity) return res.status(400).send("Some Required Data Missing..")
            const customer = await Customer.findById(req.user.id)
            if (!customer) return res.status(401).send("Not Authorized.")
            // ✅ Create order
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
            await Product.findOneAndUpdate({ _id: products._id }, [{ $set: { quantity: { $toString: { $subtract: [{ $toInt: "$quantity" }, { $toInt: buyquantity }] } } } }], { new: true });
            await order.save()
            // ✅ Update customer
            customer.ordersHistory.push(order._id);
            await customer.save();
            res.status(201).json(order);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
    })


    getOrdersHistory = asyncHandler(async (req, res) => {
        try {
            const customer = await Customer.findById(req.user.id).populate("ordersHistory").sort({ createdAt: -1 });
            res.status(200).json(customer.ordersHistory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    getSingleOrderDetails = asyncHandler(async (req, res) => {
        const { orderId } = req.params;
        try {
            const order = await orderModel.findById(orderId).populate([
                { path: "shippingAddress" },
                { path: "items.product" }
            ]);
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


    syncCartItems = asyncHandler(async (req, res) => {
        try {
            const userId = req.user._id; // middleware se aata hai
            const { items } = req.body;  // [{ product, quantity }]

            if (!Array.isArray(items)) {
                return res.status(400).json({ message: "Invalid cart data" });
            }

            const customer = await Customer.findById(userId);
            if (!customer) {
                return res.status(404).json({ message: "User not found" });
            }

            // Merge logic → agar product already cart me hai to quantity update karen
            const updatedCart = [...customer.cart];
            items.forEach(newItem => {
                const existing = updatedCart.find(
                    item => item.product.toString() === newItem._id
                );
                if (existing) {
                    // Increase quantity (ya overwrite kar sakte ho)
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

            res.status(200).json({
                message: "Cart synced successfully",
                cart: customer.cart,
            });
        } catch (err) {
            console.error("Cart sync error:", err);
            res.status(500).json({ message: "Server error, try again later" });
        }
    })


    sameOrderPlaced = asyncHandler(async (req, res) => {
        const { orderId } = req.body
        try {
            const user = await Customer.findById(req.user.id)
            if (!user) return res.status(401).send("Not Authorized.")
            const completed = await Order.findById(orderId)
            if (completed.customer.toString() !== user._id.toString()) return res.status(400).send("Something went Wrong. May be bug.")
            const { shippingAddress, totalAmount, items, customer } = completed;
            // ✅ Create order
            const order = new Order({
                customer,
                items,
                totalAmount,
                shippingAddress
            });
            await order.save()
            // ✅ Decrease stock using Aggregation Pipeline update
            for (const item of completed.items) {
                await Product.updateOne({ _id: item.product._id },
                    [{
                        $set: {
                            // convert string->int, subtract quantity, convert back to string
                            quantity: { $toString: { $subtract: [{ $toInt: "$quantity" }, item.quantity] } }
                        }
                    }]);
            }
            // ✅ Update user
            user.ordersHistory.push(order._id);
            await user.save();
            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    })


    useCoupon = asyncHandler(async (req, res) => {
        const { code, ordervalue, category } = req.body;
        try {
            const coupon = await Coupon.findOne({ code: code });
            if (!coupon) {
                return res.status(404).json({ message: "Coupon not found." });
            }
            if (!coupon.isActive) {
                return res.status(400).json({ message: "Coupon is not active." });
            }
            if (coupon.applicableCategories.includes("all")) {
                console.log(coupon.applicableCategories);
            }
            else if (!coupon.applicableCategories.includes(category)) {
                return res.status(400).json({ message: `Coupon is not applicable for this category.` });
            }
            if (coupon.minOrderValue > ordervalue) {
                return res.status(400).json({ message: `Minimum order value should be ${coupon.minOrderValue} to apply this coupon.` });
            }
            // Check if coupon is expired
            if (new Date() > coupon.expirationDate) {
                return res.status(400).json({ message: "Coupon has expired." });
            }
            // Check usage limit
            if (coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ message: "Coupon usage limit reached." });
            }
            const discounted = (ordervalue * coupon.discountPercentage) / 100;
            // Increment used count
            coupon.usedCount += 1;
            await coupon.save();
            res.status(200).json({ message: "Coupon applied successfully.", discounted });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

}


export default new ShopController()