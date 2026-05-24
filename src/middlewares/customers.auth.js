import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const customerAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token; // cookie se token nikala
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.USER_SECRET_KEY);
    const user = await Customer.findById(decoded._id).select("-password");
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
