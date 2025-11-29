import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function dropOldIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Get the orders collection
        const db = mongoose.connection.db;
        const ordersCollection = db.collection("orders");

        // Drop the stripeSessionId index if it exists
        try {
            await ordersCollection.dropIndex("stripeSessionId_1");
            console.log("Dropped old stripeSessionId index");
        } catch (err) {
            if (err.message.includes("index not found")) {
                console.log("Index doesn't exist, nothing to drop");
            } else {
                throw err;
            }
        }

        // Also try the full index name
        try {
            const indexes = await ordersCollection.listIndexes().toArray();
            console.log("Current indexes:", indexes);
        } catch (err) {
            console.log("Could not list indexes:", err.message);
        }

        console.log("Done!");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

dropOldIndex();
