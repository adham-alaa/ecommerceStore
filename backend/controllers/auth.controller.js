import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../lib/redis.js";

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

const storerefreshToken = async (userId, refreshToken) => {
    await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
};


const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};


export const Signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ email, password, name });

        const { accessToken, refreshToken } = generateToken(user._id,)
        await storerefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);


        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }, message: "User created successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }


};


export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && await user.comparePassword(password)) {
            const { accessToken, refreshToken } = generateToken(user._id);
            await storerefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);
            res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }, message: "Login successful"
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error", error: error.message });

    }
};


export const Logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            await redis.del(`refreshToken:${decoded.userId}`);
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error", error: error.message });

    }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const storedToken = await redis.get(`refreshToken:${decoded.userId}`);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ message: "token refreshed", accessToken });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// implement get profile controller later
// export const getProfile = async (req, res) => {}