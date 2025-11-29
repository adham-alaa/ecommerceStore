import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
    try {
        // Get all active coupons (not user-specific anymore)
        const coupons = await Coupon.find({ isActive: true });
        res.json(coupons);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Check if coupon has expired
        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({ message: "Coupon has expired" });
        }

        // Check if coupon has reached max uses
        if (coupon.currentUses >= coupon.maxUses) {
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({ message: "Coupon has reached maximum uses" });
        }

        res.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, expirationDays, maxUses } = req.body;

        // Validate input
        if (!code || !discountPercentage || !expirationDays || !maxUses) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({ message: "Discount percentage must be between 0 and 100" });
        }

        if (maxUses < 1) {
            return res.status(400).json({ message: "Max uses must be at least 1" });
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        // Calculate expiration date
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + parseInt(expirationDays));

        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            discountPercentage,
            expirationDate,
            maxUses,
            currentUses: 0,
            isActive: true,
        });

        await newCoupon.save();

        res.status(201).json({
            message: "Coupon created successfully",
            coupon: newCoupon,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}

export const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
            coupon,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
}