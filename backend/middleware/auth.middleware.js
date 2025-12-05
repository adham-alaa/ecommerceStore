import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";
dotenv.config();



export const protectRoute = async (req, res, next) => {
    try {
        // Try to get token from cookies first, then from Authorization header
        let accessToken = req.cookies.accessToken;

        if (!accessToken) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                accessToken = authHeader.substring(7);
            }
        }

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized: No access token provided" });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
            const user = await User.findById(decoded.userId).select("-password");
            if (!user) {
                return res.status(401).json({ message: "Unauthorized: User not found" });
            }
            req.user = user;
            next();

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized: Access token expired" });
            }
            throw error;

        }
    }
    catch (error) {
        console.log(error.message);
        res.status(401).json({ message: "Unauthorized: Invalid access token", error: error.message });

    }
}

export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Admins only" });
    }
};