/**
 * @file server.js
 * @description Main entry point for the Cyber Security Club NITJ backend application.
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

/*
 * Connect to MongoDB
 */
connectDB();

const app = express();

/*
 * Allowed frontend origins
 */
const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL,
    "https://csc-nitj.vercel.app",
].filter(Boolean);

/*
 * CORS
 *
 * credentials: true is required for HttpOnly
 * authentication cookies.
 */
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Origin not allowed by CORS")
            );
        },
        credentials: true,
    })
);

/*
 * Request body parsing
 */
app.use(express.json());

/*
 * IMPORTANT:
 * Parse cookies before authentication routes.
 *
 * This creates:
 * req.cookies
 */
app.use(cookieParser());

/*
 * API routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/events", eventRoutes);

/*
 * Static uploaded files
 */
app.use(
    "/uploads",
    express.static("uploads")
);

/*
 * Global error handler
 */
app.use(errorHandler);

/*
 * Start server
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `[Server] Running on port ${PORT}`
    );
});