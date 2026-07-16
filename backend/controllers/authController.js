import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const COOKIE_NAME = "accessToken";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite:
      process.env.COOKIE_SAME_SITE ||
      (isProduction ? "none" : "lax"),
    path: "/",
  };
};

const setAuthCookie = (res, userId) => {
  res.cookie(COOKIE_NAME, generateToken(userId), {
    ...cookieOptions(),
    maxAge: SEVEN_DAYS,
  });
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    // Registration does not expose or store a JWT.
    // The existing UI sends the user to the login page.
    return res.status(201).json({
      message: "Registration successful",
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    setAuthCookie(res, user._id);

    // Return user information only. Never return the JWT.
    return res.status(200).json(publicUser(user));
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json(publicUser(req.user));
};

export const logoutUser = async (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  return res.status(200).json({ message: "Logged out successfully" });
};