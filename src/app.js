import express from "express";
import authRouter from  "./routes/auth.routes.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import morgan from "morgan"
dotenv.config() 

const app = express();

// --- Middlewares ---
app.use(cors({
  origin: ["https://glamgully.vercel.app", "http://localhost:5173"],
  credentials: true,
}));

app.use(morgan("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/auth/v1",authRouter)

export default app