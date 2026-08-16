/**
 * @file User.js
 * @description Mongoose schema definition for users, supporting roles, profiles, event registrations, and password hashing middleware.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "member", "core", "admin"],
            default: "user",
            index: true,
        },
        bio: {
            type: String,
            default: "",
            trim: true,
        },
        github: {
            type: String,
            default: "",
            trim: true,
        },
        linkedin: {
            type: String,
            default: "",
            trim: true,
        },
        registeredEvents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event",
            },
        ],
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/**
 * Pre-save middleware to securely hash user passwords using bcrypt.
 */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method to compare an entered plaintext password with the hashed password.
 * @param {string} enteredPassword - The plaintext password to verify.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);