import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Authentication cookie missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired authentication cookie",
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Admin privileges required.",
  });
};