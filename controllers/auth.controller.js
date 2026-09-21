const {
  registerService,
  loginService,
  getProfileService,
  updateProfileService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
  changePasswordService,
} = require("../services/auth.service");

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
  changePasswordValidation,
  validate,
} = require("../validations/auth.validation");
const BlacklistedToken = require("../models/blacklistToken.model");

// 1. Register
const register = async (req, res) => {
  try {
    const { error, value } = validate(registerValidation, req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const { statusCode, body } = await registerService(value);
    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Register Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// 2. Login
const login = async (req, res) => {
  try {
    const { error, value } = validate(loginValidation, req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const identifier = value.username || value.email || value.usernameOrEmail;
    const { statusCode, body } = await loginService({
      identifier,
      password: value.password,
    });

    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// 3. Get Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { statusCode, body } = await getProfileService(userId);
    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Get Profile Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// 4. Update Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { statusCode, body } = await updateProfileService(userId, req.body);
    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Update Profile Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// 5. Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { error, value } = validate(forgotPasswordValidation, req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const identifier = value.email || value.username || value.usernameOrEmail;
    const { statusCode, body } = await forgotPasswordService(identifier);
    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Forgot Password Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// 6. Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { error, value } = validate(verifyOtpValidation, req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const identifier = value.email || value.username || value.usernameOrEmail;
    const { statusCode, body } = await verifyOtpService(identifier, value.otp);
    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Verify OTP Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// 7. Reset Password
const resetPassword = async (req, res) => {
  try {
    const { error, value } = validate(resetPasswordValidation, req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const identifier = value.email || value.username || value.usernameOrEmail;
    const { statusCode, body } = await resetPasswordService(identifier, value.newPassword);
    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Reset Password Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// 8. Change Password
const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { error, value } = validate(changePasswordValidation, req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const { statusCode, body } = await changePasswordService(
      userId,
      value.currentPassword,
      value.newPassword
    );
    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Change Password Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// 9. Logout
const logout = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (token) {
      await BlacklistedToken.create({
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully. Please re-login to access your account.",
    });
  } catch (error) {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully. Please re-login to access your account.",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  logout,
};
