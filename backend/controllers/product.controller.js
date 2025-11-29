import Product from "../models/product.model.js";
import redis from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";


export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ products });


    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });

    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            console.log("Serving from cache");
            return res.status(200).json({ products: JSON.parse(featuredProducts) });
        }
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }
        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.status(200).json({ products: featuredProducts });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category, colorVariants } = req.body;

        let cloudinaryResponse = null;
        if (image) {
            try {
                cloudinaryResponse = await cloudinary.uploader.upload(image, {
                    folder: "products"
                });
                console.log("Cloudinary upload successful:", cloudinaryResponse.secure_url);
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError.message);
                return res.status(400).json({ message: "Image upload failed", error: uploadError.message });
            }
        }

        // Upload color variant images to Cloudinary
        let processedColorVariants = [];
        if (colorVariants && Array.isArray(colorVariants)) {
            for (const variant of colorVariants) {
                try {
                    const colorImageResponse = await cloudinary.uploader.upload(variant.image, {
                        folder: "products/colors"
                    });
                    processedColorVariants.push({
                        color: variant.color,
                        image: colorImageResponse.secure_url,
                        sizes: variant.sizes // Keep the sizes array with stock
                    });
                } catch (uploadError) {
                    console.error("Color image upload failed:", uploadError.message);
                }
            }
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse ? cloudinaryResponse.secure_url : "",
            category,
            colorVariants: processedColorVariants,
        });
        console.log("Product created with image:", product.image);
        res.status(201).json({ product, message: "Product created successfully" });
    }
    catch (error) {
        console.log("Error creating product:", error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the ID format
        if (!id || id === "undefined") {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("Image deleted from Cloudinary");

            } catch (error) {
                console.log("Error deleting image from Cloudinary:", error.message);
            }
        }
        await Product.findByIdAndDelete(id);

        // Update the featured products cache
        await updateFeaturedProductsCache();
        console.log("Featured products cache updated after deletion");

        res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 10 } // Get more products initially
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                    category: 1,
                    colorVariants: 1,
                    stock: 1,
                    // Calculate total stock from colorVariants
                    totalStock: {
                        $cond: {
                            if: { $gt: [{ $size: { $ifNull: ["$colorVariants", []] } }, 0] },
                            then: {
                                $sum: {
                                    $map: {
                                        input: "$colorVariants",
                                        as: "variant",
                                        in: {
                                            $sum: {
                                                $map: {
                                                    input: "$$variant.sizes",
                                                    as: "size",
                                                    in: "$$size.stock"
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            else: { $ifNull: ["$stock", 0] }
                        }
                    }
                }
            },
            {
                // Filter out products with no stock
                $match: {
                    totalStock: { $gt: 0 }
                }
            },
            {
                $limit: 3 // Get only 3 products with stock
            }
        ]);
        res.status(200).json({ products });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });

    }
}

export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.status(200).json({ products });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();

            await updateFeaturedProductsCache();
            res.status(200).json({ product: updatedProduct, message: "Product featured status toggled" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });

    }
};


export const updateFeaturedProductsCache = async () => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error updating featured products cache:", error.message);
    }
}

export const clearFeaturedCache = async (req, res) => {
    try {
        await redis.del("featured_products");
        console.log("Featured products cache cleared");
        res.status(200).json({ message: "Cache cleared successfully" });
    } catch (error) {
        console.log("Error clearing cache:", error.message);
        res.status(500).json({ message: "Failed to clear cache", error: error.message });
    }
}
