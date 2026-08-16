/**
 * @file authMiddleware.js
 * @description Authentication and authorization middleware for
 * protecting routes and verifying user roles.
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to authenticate the current user.
 *
 * Primary authentication:
 * - HttpOnly cookie: req.cookies.token
 *
 * Temporary fallback:
 * - Authorization: Bearer <token>
 */
export const protect = async (req, res, next) => {
    try {
        console.log("\n========== AUTH DEBUG ==========");
        console.log("Request:", req.method, req.originalUrl);
        console.log("Cookies:", req.cookies);
        console.log(
            "Authorization:",
            req.headers.authorization || "NONE"
        );
        console.log(
            "JWT_SECRET exists:",
            Boolean(process.env.JWT_SECRET)
        );

        let token = null;

        // Primary authentication: HttpOnly cookie
        if (req.cookies?.token) {
            token = req.cookies.token;
            console.log("Token source: HTTPONLY COOKIE");
        }

        // Temporary backward compatibility
        if (
            !token &&
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
            console.log("Token source: BEARER HEADER");
        }

        // No credentials
        if (!token) {
            console.log("AUTH RESULT: NO TOKEN");
            console.log("================================\n");

            return res.status(401).json({
                message: "Authentication required",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("JWT decoded successfully");
        console.log("User ID:", decoded.id);

        // Fetch current user
        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {
            console.log("AUTH RESULT: USER NOT FOUND");
            console.log("================================\n");

            return res.status(401).json({
                message: "User not found",
            });
        }

        console.log("Authenticated user:", user.email);
        console.log("Role:", user.role);
        console.log("AUTH RESULT: SUCCESS");
        console.log("================================\n");

        req.user = user;

        next();
    } catch (error) {
        console.error("AUTH ERROR:", error.message);
        console.log("================================\n");

        return res.status(401).json({
            message: "Invalid or expired authentication session",
        });
    }
};

/**
 * Middleware to verify administrator privileges.
 *
 * Must run after protect().
 */
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message:
                "Access denied. Admin privileges required.",
        });
    }

    next();
};