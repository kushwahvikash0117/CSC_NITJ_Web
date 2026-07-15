import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// Initialize database connection
connectDB();

const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Enable CORS for allowed client origins
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://csc-nitj.vercel.app",
    ],
    credentials: true,
  })
);

// API route registrations
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/events", eventRoutes);
app.use("/uploads", express.static("uploads"));

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
