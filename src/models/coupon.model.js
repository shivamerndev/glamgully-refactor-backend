import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: String }],
    minOrderValue: { type: Number, default: 200 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Coupon", couponSchema);