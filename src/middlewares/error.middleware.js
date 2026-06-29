import { NODE_ENV } from "../config/env.config.js";

export default (err, req, res, next) => {

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        ...(NODE_ENV === "development" && { stack: err.stack }),
    });
}