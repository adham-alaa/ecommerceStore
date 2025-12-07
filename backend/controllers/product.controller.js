import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";


export const getAllProducts = async (req, res) => {
    try {
        const raw = await Product.find({}).lean();
        const products = raw.map(p => ({
            ...p,
            totalStock: Array.isArray(p.colorVariants)
                ? p.colorVariants.reduce((acc, v) => acc + (Array.isArray(v.sizes)
                    ? v.sizes.reduce((sAcc, s) => sAcc + (Number(s.stock) || 0), 0)
                    : 0), 0)
                : 0
        }));
        res.status(200).json({ products });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await Product.find({ isFeatured: true }).lean();
        featuredProducts = featuredProducts.map(p => ({
            ...p,
            totalStock: Array.isArray(p.colorVariants)
                ? p.colorVariants.reduce((acc, v) => acc + (Array.isArray(v.sizes)
                    ? v.sizes.reduce((sAcc, s) => sAcc + (Number(s.stock) || 0), 0)
                    : 0), 0)
                : 0
        }));

        if (!featuredProducts || featuredProducts.length === 0) {
            return res.status(404).json({ message: "No featured products found" });
        }
        res.status(200).json({ products: featuredProducts });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, images, category, colorVariants, sizeChart } = req.body;

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

        // Upload additional images to Cloudinary
        let uploadedImages = [];
        if (images && Array.isArray(images)) {
            for (const img of images) {
                try {
                    const imgResponse = await cloudinary.uploader.upload(img, {
                        folder: "products/gallery"
                    });
                    uploadedImages.push(imgResponse.secure_url);
                } catch (uploadError) {
                    console.error("Additional image upload failed:", uploadError.message);
                }
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
            images: uploadedImages,
            category,
            colorVariants: processedColorVariants,
            sizeChart: sizeChart || "",
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
        // Case-insensitive match for category
        const raw = await Product.find({ category: { $regex: `^${category}$`, $options: "i" } }).lean();
        const products = raw.map(p => ({
            ...p,
            totalStock: Array.isArray(p.colorVariants)
                ? p.colorVariants.reduce((acc, v) => acc + (Array.isArray(v.sizes)
                    ? v.sizes.reduce((sAcc, s) => sAcc + (Number(s.stock) || 0), 0)
                    : 0), 0)
                : 0
        }));
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

            res.status(200).json({ product: updatedProduct, message: "Product featured status toggled" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });

    }
};



