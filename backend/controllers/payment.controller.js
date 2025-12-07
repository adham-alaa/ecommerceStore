import Coupon from "../models/coupon.model.js";
import Order, { generateOrderNumber } from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const createCashOrder = async (req, res) => {
    try {
        const { products, couponCode, customerInfo } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Products array is required" });
        }

        // Validate customer info
        if (!customerInfo) {
            return res.status(400).json({ message: "Customer information is required" });
        }
        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            return res.status(400).json({ message: "Customer name, email, and phone are required" });
        }
        if (!customerInfo.address || !customerInfo.address.street || !customerInfo.address.city ||
            !customerInfo.address.governorate || !customerInfo.address.postalCode) {
            return res.status(400).json({ message: "Complete address is required" });
        }

        let totalAmount = 0;
        const orderProducts = [];

        // Process products and validate they have required fields
        for (const product of products) {
            const productId = product._id || product.id;
            const quantity = product.quantity || 1;
            const price = product.price;
            const size = product.size;
            const color = product.color;

            if (!productId) {
                return res.status(400).json({ message: "Product ID is required for all items" });
            }
            if (!price) {
                return res.status(400).json({ message: "Price is required for all items" });
            }

            totalAmount += price * quantity;
            const orderProduct = {
                product: productId,
                quantity,
                price
            };
            if (size) orderProduct.size = size;
            if (color) orderProduct.color = color;

            orderProducts.push(orderProduct);
        }

        // Apply coupon discount if provided
        let coupon = null;
        if (couponCode && couponCode.trim()) {
            coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (!coupon) {
                return res.status(404).json({ message: "Coupon not found or expired" });
            }
            if (coupon.expirationDate < new Date()) {
                coupon.isActive = false;
                await coupon.save();
                return res.status(400).json({ message: "Coupon has expired" });
            }
            if (coupon.currentUses >= coupon.maxUses) {
                coupon.isActive = false;
                await coupon.save();
                return res.status(400).json({ message: "Coupon has reached maximum uses" });
            }
            totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
        }

        // Generate unique order number
        const orderNumber = await generateOrderNumber();

        // Create order with cash payment method and customer info
        const newOrder = new Order({
            orderNumber,
            user: req.user._id,
            customerInfo: {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: {
                    street: customerInfo.address.street,
                    apartment: customerInfo.address.apartment || "",
                    city: customerInfo.address.city,
                    governorate: customerInfo.address.governorate,
                    postalCode: customerInfo.address.postalCode,
                    country: customerInfo.address.country || "Egypt",
                },
            },
            products: orderProducts,
            totalAmount: totalAmount,
            paymentMethod: "cash",
            paymentStatus: "pending",
        });

        await newOrder.save();

        // Decrement stock for each product
        for (const orderProduct of orderProducts) {
            const product = await Product.findById(orderProduct.product);
            if (product) {
                if (product.colorVariants && product.colorVariants.length > 0) {
                    // Product uses new colorVariants structure
                    if (orderProduct.color && orderProduct.size) {
                        // Find the specific color variant
                        const variantIndex = product.colorVariants.findIndex(
                            v => v.color === orderProduct.color
                        );
                        if (variantIndex !== -1) {
                            // Find the specific size within that color
                            const sizeIndex = product.colorVariants[variantIndex].sizes.findIndex(
                                s => s.size === orderProduct.size
                            );
                            if (sizeIndex !== -1) {
                                // Decrement the stock for this specific color-size combination
                                const currentStock = product.colorVariants[variantIndex].sizes[sizeIndex].stock;
                                product.colorVariants[variantIndex].sizes[sizeIndex].stock =
                                    Math.max(0, currentStock - orderProduct.quantity);
                                await product.save();
                            }
                        }
                    }
                } else if (product.stock !== undefined) {
                    // Product uses old stock structure (backward compatibility)
                    product.stock = Math.max(0, product.stock - orderProduct.quantity);
                    await product.save();
                }
            }
        }

        // Increment coupon usage and deactivate if maxUses reached
        if (coupon) {
            coupon.currentUses += 1;
            if (coupon.currentUses >= coupon.maxUses) {
                coupon.isActive = false;
            }
            await coupon.save();
        }

        // Clear user's cart
        req.user.cartItems = [];
        await req.user.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully. Please pay in cash upon delivery.",
            orderId: newOrder._id,
            orderNumber: newOrder.orderNumber,
            totalAmount: totalAmount,
            currency: "EGP",
            paymentMethod: "cash",
            paymentStatus: "pending"
        });

    } catch (error) {
        console.log("Error creating order:", error);
        res.status(500).json({
            message: error.message,
            error: error.message || JSON.stringify(error)
        });
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
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("products.product", "name price image")
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus } = req.body;

        const validStatuses = ["pending", "paid", "cancelled"];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({ message: "Invalid payment status" });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { paymentStatus },
            { new: true }
        ).populate("products.product", "name price image");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate("products.product");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Restore stock for cancelled orders if the order was pending or paid
        if (order.paymentStatus !== "cancelled") {
            for (const orderProduct of order.products) {
                const product = await Product.findById(orderProduct.product);
                if (product) {
                    if (product.colorVariants && product.colorVariants.length > 0) {
                        // Product uses new colorVariants structure
                        if (orderProduct.color && orderProduct.size) {
                            const variantIndex = product.colorVariants.findIndex(
                                v => v.color === orderProduct.color
                            );
                            if (variantIndex !== -1) {
                                const sizeIndex = product.colorVariants[variantIndex].sizes.findIndex(
                                    s => s.size === orderProduct.size
                                );
                                if (sizeIndex !== -1) {
                                    // Restore the stock for this specific color-size combination
                                    product.colorVariants[variantIndex].sizes[sizeIndex].stock += orderProduct.quantity;
                                    await product.save();
                                }
                            }
                        }
                    } else if (product.stock !== undefined) {
                        // Product uses old stock structure (backward compatibility)
                        product.stock += orderProduct.quantity;
                        await product.save();
                    }
                }
            }
        }

        // Delete the order
        await Order.findByIdAndDelete(orderId);

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}