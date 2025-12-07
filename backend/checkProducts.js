import { connectDB } from "./lib/db.js";
import Product from "./models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

async function checkProducts() {
    try {
        await connectDB();
        const allProducts = await Product.find({});
        console.log('\n=== ALL PRODUCTS ===');
        console.log('Total products:', allProducts.length);
        allProducts.forEach(p => {
            console.log(`- ${p.name}: isFeatured=${p.isFeatured}, category=${p.category}`);
        });

        const featured = await Product.find({ isFeatured: true });
        console.log('\n=== FEATURED PRODUCTS ===');
        console.log('Total featured:', featured.length);
        featured.forEach(p => {
            console.log(`- ${p.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProducts();
