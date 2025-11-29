import Category from "./models/category.model.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";

dotenv.config();

const defaultCategories = [
    "Jeans",
    "T-Shirts",
    "Shoes",
    "Glasses",
    "Jackets",
    "Suits",
    "Bags"
];

const seedCategories = async () => {
    try {
        await connectDB();

        console.log("Checking existing categories...");

        for (const categoryName of defaultCategories) {
            const exists = await Category.findOne({
                name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
            });

            if (!exists) {
                const category = new Category({ name: categoryName });
                await category.save();
                console.log(`✓ Created category: ${categoryName}`);
            } else {
                console.log(`- Category already exists: ${categoryName}`);
            }
        }

        console.log("\nSeeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
};

seedCategories();
