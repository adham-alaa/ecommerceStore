import redis from "../lib/redis.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function clearFeaturedCache() {
    try {
        console.log("Connecting to Redis...");
        await redis.del("featured_products");
        console.log("✅ Featured products cache cleared successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error clearing cache:", error);
        process.exit(1);
    }
}

clearFeaturedCache();
