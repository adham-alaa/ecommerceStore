import Category from "../models/category.model.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({ categories });
    } catch (error) {
        console.log("Error getting categories:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = new Category({ name: name.trim() });
        await category.save();

        res.status(201).json({ category });
    } catch (error) {
        console.log("Error creating category:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.log("Error deleting category:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Check if another category with same name exists
        const existingCategory = await Category.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({ message: "Category with this name already exists" });
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { name: name.trim() },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ category });
    } catch (error) {
        console.log("Error updating category:", error.message);
        res.status(500).json({ message: error.message });
    }
};
