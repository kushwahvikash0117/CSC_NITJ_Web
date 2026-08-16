/**
 * @file blogRoutes.js
 * @description Express router for managing blog endpoints, covering public viewing, authenticated user actions, and admin moderation.
 */

import express from "express";
import {
    createBlog,
    getBlogs,
    getBlogById,
    likeBlog,
    commentBlog,
    getPendingBlogs,
    moderateBlog,
    deleteComment,
    getMyBlogs,
    getUserBlogs,
} from "../controllers/blogController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

/**
 * @route   GET /api/blogs
 * @desc    Fetch all approved blog posts
 * @access  Public
 */
router.get("/", getBlogs);

/**
 * @route   GET /api/blogs/user/:id
 * @desc    Fetch approved blog posts by specific author ID
 * @access  Public
 */
router.get("/user/:id", getUserBlogs);

/**
 * @route   GET /api/blogs/user
 * @desc    Fetch current authenticated user's blog posts
 * @access  Private
 */
router.get("/user", protect, getMyBlogs);

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog post with optional image upload
 * @access  Private
 */
router.post("/", protect, upload.single("image"), createBlog);

/**
 * @route   POST /api/blogs/:id/like
 * @desc    Toggle like status on a blog post
 * @access  Private
 */
router.post("/:id/like", protect, likeBlog);

/**
 * @route   POST /api/blogs/:id/comment
 * @desc    Add a comment to a blog post
 * @access  Private
 */
router.post("/:id/comment", protect, commentBlog);

/**
 * @route   DELETE /api/blogs/:blogId/comment/:commentId
 * @desc    Delete a comment from a blog post (comment owner or blog owner)
 * @access  Private
 */
router.delete("/:blogId/comment/:commentId", protect, deleteComment);

/**
 * @route   GET /api/blogs/pending
 * @desc    Fetch all pending blog posts awaiting moderation
 * @access  Private/Admin
 */
router.get("/pending", protect, isAdmin, getPendingBlogs);

/**
 * @route   PUT /api/blogs/moderate/:id
 * @desc    Moderate a blog post's status (approve/reject)
 * @access  Private/Admin
 */
router.put("/moderate/:id", protect, isAdmin, moderateBlog);

/**
 * @route   GET /api/blogs/:id
 * @desc    Fetch a single approved blog post by unique ID
 * @access  Public (Validated in controller)
 * @note    Kept last to prevent URL slug/route parameter conflicts with static routes like /pending or /user
 */
router.get("/:id", getBlogById);

export default router;