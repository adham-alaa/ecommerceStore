import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCashOrder, getOrderHistory } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protectRoute, createCashOrder);
router.get("/orders", protectRoute, getOrderHistory);

export default router;





export default router;