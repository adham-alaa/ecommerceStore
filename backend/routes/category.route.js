import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllCategories, createCategory, deleteCategory, updateCategory } from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", protectRoute, adminRoute, createCategory);
router.delete("/:id", protectRoute, adminRoute, deleteCategory);
router.put("/:id", protectRoute, adminRoute, updateCategory);

export default router;
