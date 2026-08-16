/**
 * @file db.js
 * @description Establishes and manages the connection to the MongoDB database using Mongoose.
 */

import mongoose from "mongoose";

/**
 * Connects to MongoDB asynchronously. Exits the process on failure.
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`[Database] MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    } catch (error) {
        console.error(`[Database Error] Connection failed: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;