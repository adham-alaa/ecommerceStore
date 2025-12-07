import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};


export const Signup = async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const userData = { email, password, name };
        if (phone) userData.phone = phone;
        if (address) userData.address = address;

        const user = await User.create(userData);

        const { accessToken, refreshToken } = generateToken(user._id,)

        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
            },
            accessToken,
            message: "User created successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }


};


export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && await user.comparePassword(password)) {
            const { accessToken, refreshToken } = generateToken(user._id);
            setCookies(res, accessToken, refreshToken);
            res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address
                },
                accessToken,
                message: "Login successful"
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });

    }
};


export const Logout = async (req, res) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });

    }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ message: "token refreshed", accessToken });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone,
            address: req.user.address
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { phone, address } = req.body;

        const updateData = {};
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            address: updatedUser.address,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, error: error.message });
    }
};