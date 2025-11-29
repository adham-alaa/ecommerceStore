import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon, createCoupon, getAllCoupons, deleteCoupon, toggleCouponStatus } from "../controllers/coupon.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);
router.get("/all", protectRoute, adminRoute, getAllCoupons);
router.post("/", protectRoute, adminRoute, createCoupon);
router.delete("/:id", protectRoute, adminRoute, deleteCoupon);
router.patch("/:id/toggle", protectRoute, adminRoute, toggleCouponStatus);

export default router;