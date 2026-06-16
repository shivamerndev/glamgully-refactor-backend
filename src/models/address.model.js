import { Schema, model } from "mongoose";

const addressSchema = new Schema({

    customerId: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
    },
    street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true
    },
    postalCode: {
        type: String,
        required: [true, "Postal code is required"],
        match: [/^[0-9]{6}$/, "Please enter a valid 6-digit postal code"] // India specific
    },
    country: {
        type: String,
        default: "India", // most e-com apps default country
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }
);

export default model("Address", addressSchema);