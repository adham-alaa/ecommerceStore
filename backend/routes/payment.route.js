import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { createCashOrder, getOrderHistory, getAllOrders, updateOrderStatus } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protectRoute, createCashOrder);
router.get("/orders", protectRoute, getOrderHistory);
router.get("/orders/all", protectRoute, adminRoute, getAllOrders);
router.patch("/orders/:orderId/status", protectRoute, adminRoute, updateOrderStatus);

export default router;
