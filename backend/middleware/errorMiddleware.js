/**
 * @file errorMiddleware.js
 * @description Global Express error-handling middleware for centralized exception formatting and response delivery.
 */

/**
 * Catches unhandled errors thrown in controllers/middleware and returns a standardized JSON response.
 * @function errorHandler
 * @param {Error} err - The error object caught by Express.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    return res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};