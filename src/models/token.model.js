import { Schema, model } from "mongoose";

const tokenSchema = new Schema({
    token: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '24h'
    }
})

const Token = model("Token", tokenSchema);

export default Token;