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

// Database connection flag
let dbConnected = false;

// Middleware to ensure DB is connected (only for serverless/production)
app.use(async (req, res, next) => {
    if (process.env.NODE_ENV === "production" && !dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
            console.log("Database connected via middleware");
        } catch (err) {
            console.error("Database connection failed:", err);
            return res.status(500).json({ message: "Database connection failed" });
        }
    }
    next();
});

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            "https://ecommerce-store-client-liart.vercel.app",
            "http://localhost:5173",
            process.env.FRONTEND_URL
        ];

        console.log("Request from origin:", origin);
        console.log("FRONTEND_URL env:", process.env.FRONTEND_URL);

        // Allow if origin is in the list or ends with vercel.app
        if (allowedOrigins.some(allowed => allowed && origin.includes(allowed.replace(/^https?:\/\//, ''))) ||
            origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Temporarily allow all for debugging
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Root route for testing
app.get("/", (req, res) => {
    res.json({ message: "eCommerce API is running", status: "ok" });
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
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log("Server is running on port", PORT);
            console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
            dbConnected = true;
        });
    }).catch(err => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });
}

// Export for Vercel serverless
export default app;
