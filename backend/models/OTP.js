/**
 * @file OTP.js
 * @description Mongoose schema definition for One-Time Passwords (OTP) featuring automatic TTL expiration.
 */

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            // Automatically deletes the document from MongoDB after 3600 seconds (1 hour)
            expires: 3600,
        },
    },
    { timestamps: true }
);

export default mongoose.model("OTP", otpSchema);