import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        customerInfo: {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            address: {
                street: {
                    type: String,
                    required: true,
                },
                apartment: String,
                city: {
                    type: String,
                    required: true,
                },
                governorate: {
                    type: String,
                    required: true,
                },
                postalCode: {
                    type: String,
                    required: true,
                },
                country: {
                    type: String,
                    default: "Egypt",
                },
            },
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                size: {
                    type: String,
                    enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
                    uppercase: true
                },
                color: {
                    type: String,
                    trim: true
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: ["cash"],
            default: "cash",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "cancelled"],
            default: "pending",
        },
        currency: {
            type: String,
            enum: ["EGP"],
            default: "EGP",
        },
    },
    { timestamps: true }
);

// Function to generate unique order number (3-5 digits)
const generateOrderNumber = async () => {
    let orderNumber;
    let exists = true;

    while (exists) {
        // Generate random number between 100 (3 digits) and 99999 (5 digits)
        orderNumber = Math.floor(Math.random() * (99999 - 100 + 1)) + 100;
        orderNumber = orderNumber.toString();

        // Check if order number already exists
        const existingOrder = await Order.findOne({ orderNumber });
        exists = !!existingOrder;
    }

    return orderNumber;
};

const Order = mongoose.model("Order", orderSchema);

export { generateOrderNumber };
export default Order;