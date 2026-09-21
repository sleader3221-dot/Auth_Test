const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  logout,
} = require("../controllers/auth.controller");

const { authToken } = require("../middlewares/auth.middleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Password reset flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Protected routes (Require JWT token)
router.get("/profile", authToken, getProfile);
router.put("/profile", authToken, updateProfile);
router.put("/change-password", authToken, changePassword);
router.post("/logout", authToken, logout);

module.exports = router;
