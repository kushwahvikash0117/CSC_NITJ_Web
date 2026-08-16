/**
 * @file Blog.js
 * @description Mongoose schema definition for blog posts, supporting categories, likes, comments, and moderation status.
 */

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["Cybersecurity", "Awareness", "Ethical Hacking", "AI & Tech"],
            required: true,
            index: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [commentSchema],
        image: {
            type: String,
            default: "",
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for optimized query performance on common filters
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ author: 1, status: 1 });

export default mongoose.model("Blog", blogSchema);