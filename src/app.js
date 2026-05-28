import express from "express";
import authRouter from "./routes/auth.routes.js"
import productRouter from "./routes/product.route.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan"
import errorMiddleware from "./middlewares/error.middleware.js";
import responseMiddleware from "./middlewares/response.middleware.js";

const app = express();


app.use(cors());

app.use(morgan("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(responseMiddleware)
app.use("/api/auth/v1", authRouter)
app.use("/api/product/v1", productRouter)


app.use(errorMiddleware)

export default app