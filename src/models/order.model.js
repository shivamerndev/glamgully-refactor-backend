import mongoose from 'mongoose'

const orderSchema = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId, ref: "Address",
        required: true
    },
    totalAmount: Number,
    status: { type: String, default: "pending" }
}, { timestamps: true });

const orderModel = mongoose.model("orders", orderSchema)

export default orderModel;