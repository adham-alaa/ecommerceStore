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

// Log to verify environment variable
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "https://ecommerce-store-client-liart.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(allowed => origin?.includes(allowed))) {
            callback(null, true);
        } else {
            console.log("Blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());



app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/categories", categoryRoutes);

app.listen(PORT, () => {
    console.log("server is running");

    connectDB();

});
