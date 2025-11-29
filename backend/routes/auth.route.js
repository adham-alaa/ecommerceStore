import express from "express"
import { Signup, Login, Logout, refreshToken, getProfile, updateProfile } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/signup", Signup);

router.post("/login", Login);

router.post("/logout", Logout);

router.post("/refresh-token", refreshToken);

router.get("/profile", protectRoute, getProfile);

router.put("/profile", protectRoute, updateProfile);


export default router