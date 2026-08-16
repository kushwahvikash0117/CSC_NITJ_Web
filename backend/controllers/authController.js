/**
 * @file authController.js
 * @description Authentication controller for OTP generation, verification,
 * user registration, login, current-session retrieval, and logout.
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOtpEmail } from "../utils/otpService.js";

/**
 * Generates a JSON Web Token for the authenticated user.
 * @private
 * @param {string} userId - The unique MongoDB user ID.
 * @returns {string} Signed JWT token valid for 1 hour.
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );
};

/**
 * Authentication cookie configuration.
 *
 * httpOnly:
 * Prevents JavaScript from reading the JWT.
 *
 * secure:
 * Requires HTTPS in production.
 *
 * sameSite:
 * Allows local development while providing CSRF protection
 * for the normal same-site setup.
 */
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
};

/**
 * Sends a 6-digit verification OTP to the user's email address.
 * @route POST /api/auth/send-otp
 */
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists with this email",
            });
        }

        // Generate 6-digit OTP.
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Remove old OTPs, create new OTP, and send email.
        await Promise.all([
            OTP.deleteMany({ email }),
            OTP.create({ email, otp }),
            sendOtpEmail(email, otp),
        ]);

        return res.status(200).json({
            message: "OTP sent successfully to your email",
        });
    } catch (error) {
        console.error("OTP send error:", error);

        return res.status(500).json({
            message: "Failed to send OTP",
            error: error.message,
        });
    }
};

/**
 * Validates the provided OTP code against the database record.
 * @route POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }

        const validOtp = await OTP.findOne({
            email,
            otp,
        });

        if (!validOtp) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }

        return res.status(200).json({
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error("OTP verification error:", error);

        return res.status(500).json({
            message: "OTP verification failed",
            error: error.message,
        });
    }
};

/**
 * Registers a new user account following successful email OTP confirmation.
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            otp,
        } = req.body;

        if (!name || !email || !password || !otp) {
            return res.status(400).json({
                message:
                    "All fields including OTP are required",
            });
        }

        const [validOtp, userExists] = await Promise.all([
            OTP.findOne({ email, otp }),
            User.findOne({ email }),
        ]);

        if (!validOtp) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        /*
         * IMPORTANT:
         * Do not accept role from req.body.
         *
         * The User schema assigns:
         * role = "user"
         *
         * Admin roles must be assigned server-side.
         */
        const user = await User.create({
            name,
            email,
            password,
        });

        // Consume the OTP after successful registration.
        await OTP.deleteMany({ email });

        /*
         * Registration does NOT automatically create a session.
         *
         * The user is redirected to Login.jsx after registration,
         * where the authentication cookie will be created.
         */
        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: "Registration successful",
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Registration failed",
            error: error.message,
        });
    }
};

/**
 * Authenticates an existing user.
 *
 * The JWT is stored in an HttpOnly cookie instead of being
 * returned to JavaScript/localStorage.
 *
 * @route POST /api/auth/login
 */
export const loginUser = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // Generate JWT.
        const token = generateToken(user._id);

        /*
         * Store JWT in HttpOnly cookie.
         *
         * JavaScript cannot access this token.
         */
        res.cookie(
            "token",
            token,
            cookieOptions
        );

        /*
         * IMPORTANT:
         * Do NOT return the JWT here.
         */
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    }
};

/**
 * Returns the currently authenticated user.
 *
 * Authentication is handled by the protect middleware,
 * which attaches the authenticated user to req.user.
 *
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            bio: req.user.bio || "",
            github: req.user.github || "",
            linkedin: req.user.linkedin || "",
        });
    } catch (error) {
        console.error(
            "Get current user error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch current user",
        });
    }
};

/**
 * Logs the current user out.
 *
 * Clears the authentication cookie.
 *
 * @route POST /api/auth/logout
 * @access Public
 */
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure:
                process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Logout failed",
        });
    }
};