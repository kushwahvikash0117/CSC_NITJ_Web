/**
 * @file userController.js
 * @description Controller for managing user profiles, dashboards, and administrative privileges.
 */

import User from "../models/User.js";
import Blog from "../models/Blog.js";

/**
 * Fetches the authenticated user profile along with aggregated blog statistics.
 * @route GET /api/users/profile
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const [user, blogsCount, likesData] = await Promise.all([
            User.findById(userId).select("-password"),
            Blog.countDocuments({ author: userId }),
            Blog.aggregate([
                { $match: { author: userId } },
                { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
                { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
            ]),
        ]);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            bio: user.bio || "",
            github: user.github || "",
            linkedin: user.linkedin || "",
            blogsCount,
            likesCount: likesData[0]?.totalLikes || 0,
            createdAt: user.createdAt,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};

/**
 * Updates the authenticated user's personal profile information.
 * @route PUT /api/users/profile
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, bio, github, linkedin } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (github !== undefined) user.github = github;
        if (linkedin !== undefined) user.linkedin = linkedin;

        const updatedUser = await user.save();

        return res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            bio: updatedUser.bio || "",
            github: updatedUser.github || "",
            linkedin: updatedUser.linkedin || "",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Update failed",
            error: error.message,
        });
    }
};

/**
 * Fetches all registered system users (Admin access required).
 * @route GET /api/users
 */
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({
            message: "Access denied",
            error: error.message,
        });
    }
};

/**
 * Updates a user's role or account status (Admin access required).
 * @route PATCH /api/users/:id/admin
 */
export const updateUserAdmin = async (req, res) => {
    try {
        const { role, status } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();

        return res.status(200).json({ message: "User status updated successfully" });
    } catch (error) {
        return res.status(500).json({
            message: "Admin update failed",
            error: error.message,
        });
    }
};