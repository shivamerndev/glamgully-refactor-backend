import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            minlength: [3, "Full name must be at least 3 characters long"],
            required: [true, "Full name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: function () {
                return !this.googleId;
            },
            minlength: [10, "phone must be 10 digits."],
            maxlength: 10,
            unique: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [function () {
                return !this.googleId;
            }, "Password is required"],
            minlength: [8, "Password must be at least 6 characters long"],
            select: false, // default queries me password nahi aayega
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // null values ko ignore karega unique constraint me kyunki multiple users ke paas googleId nahi hoga but unique = true hai.
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default:"male",
            required: true,
        },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product", }],
        ordersHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
        cart: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: { type: Number, default: 1, min: 1 } }],
        address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }]
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // agar password change nahi hua to skip
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);