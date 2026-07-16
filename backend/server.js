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

connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
  "https://csc-nitj.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Basic Origin check for cookie-authenticated state-changing requests.
app.use((req, res, next) => {
  const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];
  const origin = req.get("origin");

  if (
    unsafeMethods.includes(req.method) &&
    origin &&
    !allowedOrigins.includes(origin)
  ) {
    return res.status(403).json({ message: "Untrusted request origin" });
  }

  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/events", eventRoutes);
app.use("/uploads", express.static("uploads"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});