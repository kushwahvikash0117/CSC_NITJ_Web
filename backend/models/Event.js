/**
 * @file Event.js
 * @description Mongoose schema definition for events, participant registrations, and media attachments.
 */

import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
    {
        salutation: {
            type: String,
            required: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: ["Internal", "External"],
            index: true
        },

        typeOfParticipant: {
            type: String,
            required: true,
            trim: true
        },

        country: {
            type: String,
            required: true,
            trim: true
        },

        designation: {
            type: String,
            required: true,
            trim: true
        },

        instituteName: {
            type: String,
            required: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
    },
    { timestamps: true }
);

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        description: {
            type: String,
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        mode: {
            type: String,
            enum: ["Online", "Offline", "Hybrid"],
            required: true,
        },

        tag: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        hasFee: {
            type: Boolean,
            default: false,
            required: true,
        },

        brochure: {
            type: String,
            default: "",
        },

        timelinePdf: {
            type: String,
            default: "",
        },

        galleryLink: {
            type: String,
            default: "",
            trim: true,
        },

        registrationLink: {
            type: String,
            default: "",
            trim: true,
        },

        registrations: [registrationSchema],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for optimized event querying and sorting
eventSchema.index({ date: 1 });
eventSchema.index({ tag: 1, date: 1 });

export default mongoose.model("Event", eventSchema);