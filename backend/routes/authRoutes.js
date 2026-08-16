/**
 * @file authRoutes.js
 * @description Express router for authentication endpoints,
 * including OTP verification, registration, login,
 * current-user session, and logout.
 */

import express from "express";

import {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send verification OTP to user email
 * @access  Public
 */
router.post("/send-otp", sendOtp);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify email OTP code
 * @access  Public
 */
router.post("/verify-otp", verifyOtp);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account following OTP validation
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate existing user and create HttpOnly session cookie
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user
 * @access  Private
 */
router.get("/me", protect, getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear authentication cookie
 * @access  Public
 */
router.post("/logout", logoutUser);

export default router;