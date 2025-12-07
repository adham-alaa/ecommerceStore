import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        min: [0, "Price cannot be negative"],
        required: [true, "Product price is required"]
        // Price in Egyptian Pounds (EGP)
    },
    image: {
        type: String,
        required: [true, "Product image is required"]
    },
    images: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        required: [true, "Product category is required"]
    },
    colorVariants: [{
        color: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            required: true
        },
        sizes: [{
            size: {
                type: String,
                enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
                uppercase: true,
                required: true
            },
            stock: {
                type: Number,
                min: [0, "Stock cannot be negative"],
                default: 0,
                required: true
            }
        }]
    }],
    sizeChart: {
        type: String,
        default: ""
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;