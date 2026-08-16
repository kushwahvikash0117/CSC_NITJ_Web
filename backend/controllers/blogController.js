/**
 * @file blogController.js
 * @description Controller for managing blog posts, moderation, likes, and comments.
 */

import Blog from "../models/Blog.js";

/**
 * Creates a new blog post.
 * @route POST /api/blogs
 */
export const createBlog = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({
                message: "Title, content, and category are required",
            });
        }

        const imagePath = req.file ? `/uploads/csc/blogs/${req.file.filename}` : "";

        const blog = await Blog.create({
            title,
            content,
            category,
            author: req.user._id,
            image: imagePath,
            status: "pending",
        });

        const populatedBlog = await Blog.findById(blog._id).populate(
            "author",
            "name email"
        );

        return res.status(201).json(populatedBlog);
    } catch (error) {
        console.error("[Blog Error] Creation failed:", error);
        return res.status(500).json({
            message: "Blog creation failed",
            error: error.message,
        });
    }
};

/**
 * Fetches all approved blogs.
 * @route GET /api/blogs
 */
export const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: "approved" })
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json(blogs);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch blogs",
            error: error.message,
        });
    }
};

/**
 * Fetches blogs created by the currently authenticated user.
 * @route GET /api/blogs/my-blogs
 */
export const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({
            author: req.user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json(blogs);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch user blogs",
            error: error.message,
        });
    }
};

/**
 * Fetches approved blogs for a specific user ID.
 * @route GET /api/blogs/user/:id
 */
export const getUserBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({
            author: req.params.id,
            status: "approved",
        }).sort({ createdAt: -1 });

        return res.status(200).json(blogs);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch blogs",
            error: error.message,
        });
    }
};

/**
 * Fetches pending blogs awaiting moderation.
 * @route GET /api/blogs/pending
 */
export const getPendingBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: "pending" })
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json(blogs);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch pending blogs",
            error: error.message,
        });
    }
};

/**
 * Moderates a blog's status (e.g., approve or reject).
 * @route PATCH /api/blogs/:id/moderate
 */
export const moderateBlog = async (req, res) => {
    try {
        const { status } = req.body;
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("author", "name email");

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        return res.status(200).json(blog);
    } catch (error) {
        return res.status(500).json({
            message: "Moderation failed",
            error: error.message,
        });
    }
};

/**
 * Fetches a single approved blog by ID with populated comments.
 * @route GET /api/blogs/:id
 */
export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("author", "name email")
            .populate("comments.user", "name email");

        if (!blog || blog.status !== "approved") {
            return res.status(404).json({ message: "Blog not found" });
        }

        return res.status(200).json(blog);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch blog",
            error: error.message,
        });
    }
};

/**
 * Toggles a like on a blog post for the authenticated user.
 * @route POST /api/blogs/:id/like
 */
export const likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const userId = req.user._id.toString();
        const hasLiked = blog.likes.some((id) => id.toString() === userId);

        blog.likes = hasLiked
            ? blog.likes.filter((id) => id.toString() !== userId)
            : [...blog.likes, req.user._id];

        await blog.save();
        return res.status(200).json(blog);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to process like action",
            error: error.message,
        });
    }
};

/**
 * Adds a comment to a blog post.
 * @route POST /api/blogs/:id/comment
 */
export const commentBlog = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text cannot be empty" });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        blog.comments.push({
            user: req.user._id,
            text,
        });

        await blog.save();
        
        const updatedBlog = await Blog.findById(req.params.id)
            .populate("author", "name email")
            .populate("comments.user", "name email");

        return res.status(200).json(updatedBlog);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to add comment",
            error: error.message,
        });
    }
};

/**
 * Deletes a specific comment from a blog post.
 * @route DELETE /api/blogs/:blogId/comment/:commentId
 */
export const deleteComment = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user._id.toString();

        const blog = await Blog.findById(blogId)
            .populate("author", "name email")
            .populate("comments.user", "name email");

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = blog.comments.id(commentId) || blog.comments.find((c) => c._id.toString() === commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const isCommentOwner = comment.user._id.toString() === userId;
        const isBlogOwner = blog.author._id.toString() === userId;

        if (!isCommentOwner && !isBlogOwner) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        blog.comments = blog.comments.filter((c) => c._id.toString() !== commentId);

        await blog.save();
        return res.status(200).json(blog);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete comment",
            error: error.message,
        });
    }
};