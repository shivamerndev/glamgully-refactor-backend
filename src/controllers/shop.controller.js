import { asyncHandler } from "../utils/error.utils.js";
import shopService from "../services/shop.service.js";

class ShopController { 

    getCart = asyncHandler(async (req, res) => {
        try {
            const cart = await shopService.getCart(req.user.id);
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

    addToCart = asyncHandler(async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const cart = await shopService.addToCart(req.user.id, productId, quantity);
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

    updateCartItem = asyncHandler(async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const itemId = req.params.itemId;
            const cart = await shopService.updateCartItem(req.user.id, productId || itemId, quantity);
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

    removeFromCart = asyncHandler(async (req, res) => {
        try {
            const { productId } = req.body;
            const itemId = req.params.itemId;
            const cart = await shopService.removeFromCart(req.user.id, productId || itemId);
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

    placeOrderWithCart = asyncHandler(async (req, res) => {
        const { shippingAddress, totalAmount } = req.body;
        try {
            const order = await shopService.placeOrderWithCart(req.user.id, shippingAddress, totalAmount);
            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    })

    placeOrder = asyncHandler(async (req, res) => {
        const { shippingAddress, totalAmount, buyquantity, products } = req.body;
        try {
            const order = await shopService.placeOrder(req.user.id, shippingAddress, totalAmount, buyquantity, products);
            res.status(201).json(order);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
    })

    getOrdersHistory = asyncHandler(async (req, res) => {
        try {
            const orders = await shopService.getOrdersHistory(req.user.id);
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

    getSingleOrderDetails = asyncHandler(async (req, res) => {
        const { orderId } = req.params;
        try {
            const order = await shopService.getSingleOrderDetails(orderId);
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

    syncCartItems = asyncHandler(async (req, res) => {
        try {
            const userId = req.user._id;
            const { items } = req.body;
            const cart = await shopService.syncCartItems(userId, items);
            res.status(200).json({
                message: "Cart synced successfully",
                cart: cart,
            });
        } catch (err) {
            console.error("Cart sync error:", err);
            res.status(500).json({ message: "Server error, try again later" });
        }
    })

    sameOrderPlaced = asyncHandler(async (req, res) => {
        const { orderId } = req.body;
        try {
            const order = await shopService.sameOrderPlaced(req.user.id, orderId);
            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    })

    useCoupon = asyncHandler(async (req, res) => {
        const { code, ordervalue, category } = req.body;
        try {
            const discounted = await shopService.useCoupon(code, ordervalue, category);
            res.status(200).json({ message: "Coupon applied successfully.", discounted });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
}

export default new ShopController();