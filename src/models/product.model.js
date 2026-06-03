import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    images: {
        type: [String],
        default: [
            "https://cdn3.vectorstock.com/i/1000x1000/35/52/placeholder-rgb-color-icon-vector-32173552.jpg"
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: String,
        required: true
    },
    discount: {
        type: String
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        index: true
    },
    quantity: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentProduct',
        default: [],

    }],
    ratings: {
        type: Number,
        default: 0
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
}, { timestamps: true })

export default mongoose.model('Product', productSchema)