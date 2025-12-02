import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import categoryRoutes from "./routes/category.route.js"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "https://ecommerce-store-client-liart.vercel.app"
].filter(Boolean);

console.log("Allowed origins:", allowedOrigins);

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());



// Initialize database connection
let isConnected = false;

const initDB = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }
    try {
        await connectDB();
        isConnected = true;
    } catch (error) {
        console.error("Database connection error:", error);
    }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    await initDB();
    next();
});

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/categories", categoryRoutes);

// For local development
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log("Server is running on port", PORT);
    });
}

// Export for Vercel serverless
export default app;
