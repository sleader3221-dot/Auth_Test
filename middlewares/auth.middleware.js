const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const BlacklistedToken = require("../models/blacklistToken.model");

const authToken = async (req, res, next) => {
  try {
    // 1. Get token from cookies or Authorization Bearer header
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token missing. Please login to continue.",
      });
    }

    // 2. Check if token was blacklisted (logged out)
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Session terminated: You have logged out. Please re-login to continue.",
      });
    }

    // 3. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find user in database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register or re-login.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired: Your token has expired. Please re-login to continue.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token: Authentication failed. Please re-login.",
    });
  }
};

module.exports = { authToken };
