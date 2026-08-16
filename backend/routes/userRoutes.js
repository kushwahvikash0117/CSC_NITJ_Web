/**
 * @file userRoutes.js
 * @description Express router for managing user profile endpoints, self-updates, and administrative controls.
 */

import express from "express";
import { 
    getProfile, 
    updateProfile, 
    getUsers, 
    updateUserAdmin 
} from "../controllers/userController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Fetch authenticated user profile with statistics
 * @access  Private
 */
router.get("/profile", protect, getProfile);

/**
 * @route   PUT /api/users/update
 * @desc    Update authenticated user profile information
 * @access  Private
 */
router.put("/update", protect, updateProfile);

/**
 * @route   GET /api/users
 * @desc    Fetch all system users
 * @access  Private/Admin
 */
router.get("/", protect, isAdmin, getUsers);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user role or account status
 * @access  Private/Admin
 */
router.put("/:id", protect, isAdmin, updateUserAdmin);

export default router;