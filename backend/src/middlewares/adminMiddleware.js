import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const admin = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login as admin.",
      });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken?.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: decodedToken.email });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register.",
      });
    }

    // Check if user is admin
    if (existingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Attach user to request for further use
    req.user = existingUser;

    // Proceed to next middleware/controller
    next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default admin;
