import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

export const createCashOrder = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Products array is required" });
        }

        let totalAmount = 0;
        products.forEach(product => {
            totalAmount += product.price * product.quantity;
        });

        // Apply coupon discount if provided
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
            if (coupon) {
                if (coupon.expirationDate < new Date()) {
                    coupon.isActive = false;
                    await coupon.save();
                    return res.status(400).json({ message: "Coupon has expired" });
                }
                totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
            } else {
                return res.status(404).json({ message: "Coupon not found" });
            }
        }

        // Create order with cash payment method
        const newOrder = new Order({
            user: req.user._id,
            products: products.map(product => ({
                product: product._id,
                quantity: product.quantity,
                price: product.price
            })),
            totalAmount: totalAmount,
            paymentMethod: "cash",
            paymentStatus: "pending",
        });

        await newOrder.save();

        // Deactivate coupon after use
        if (coupon) {
            coupon.isActive = false;
            await coupon.save();
        }

        // Clear user's cart
        req.user.cartItems = [];
        await req.user.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully. Please pay in cash upon delivery.",
            orderId: newOrder._id,
            totalAmount: totalAmount,
            currency: "EGP",
            paymentMethod: "cash",
            paymentStatus: "pending"
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate("products.product", "name price image")
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
    } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error", error: error.message });

};
}
