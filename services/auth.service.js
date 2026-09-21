const User = require("../models/user.model");
const { sendEmail } = require("../utils/sendEmail");

// Standard helper for service response
const respond = (statusCode, body, cookies = []) => ({
  statusCode,
  body,
  cookies,
});

// Helper to find user by username or email
const findUser = async (identifier, selectPassword = false) => {
  if (!identifier) return null;
  const clean = identifier.toString().trim().toLowerCase();
  let query = User.findOne({
    $or: [{ username: clean }, { email: clean }],
  });
  if (selectPassword) {
    query = query.select("+password");
  }
  return await query;
};

// 1. Register Service
const registerService = async ({ username, email, fullName, password }) => {
  try {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing username
    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });

    if (existingUser) {
      const message =
        existingUser.username === cleanUsername
          ? "Username is already taken"
          : "Email is already registered";
      return respond(400, { success: false, message });
    }

    // Create user
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      fullName: fullName || "",
      password,
    });

    const token = user.generateToken();

    return respond(201, {
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return respond(500, { success: false, message: "Failed to register user", error: error.message });
  }
};

// 2. Login Service
const loginService = async ({ identifier, password }) => {
  try {
    const user = await findUser(identifier, true);

    if (!user) {
      return respond(404, { success: false, message: "Invalid username or email" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return respond(401, { success: false, message: "Invalid password" });
    }

    const token = user.generateToken();

    return respond(200, {
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return respond(500, { success: false, message: "Failed to login", error: error.message });
  }
};

// 3. Get Profile Service
const getProfileService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return respond(404, { success: false, message: "User not found" });
    }

    return respond(200, {
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return respond(500, { success: false, message: "Server error", error: error.message });
  }
};

// 4. Update Profile Service
const updateProfileService = async (userId, updateData) => {
  try {
    const allowedUpdates = {};
    if (updateData.fullName !== undefined) allowedUpdates.fullName = updateData.fullName;

    const user = await User.findByIdAndUpdate(userId, allowedUpdates, { new: true });
    if (!user) {
      return respond(404, { success: false, message: "User not found" });
    }

    return respond(200, {
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return respond(500, { success: false, message: "Failed to update profile", error: error.message });
  }
};

// 5. Forgot Password Service (Generates 6-digit OTP & sends email)
const forgotPasswordService = async (identifier) => {
  try {
    const user = await findUser(identifier);
    if (!user) {
      return respond(404, { success: false, message: "User not found" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    await user.save();

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP - DukaanSE",
      html: `<h3>Your Password Reset OTP is: <b>${otp}</b></h3><p>Valid for 5 minutes.</p>`,
      text: `Your OTP is: ${otp}`,
    });

    console.log(`🔑 [OTP for ${user.email} / ${user.username}]: ${otp}`);

    return respond(200, {
      success: true,
      message: "Password reset OTP sent to your email",
      email: user.email,
      otp, // included for seamless testing
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return respond(500, { success: false, message: "Failed to process forgot password", error: error.message });
  }
};

// 6. Verify OTP Service
const verifyOtpService = async (identifier, otp) => {
  try {
    const user = await findUser(identifier);
    if (!user) {
      return respond(404, { success: false, message: "User not found" });
    }

    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return respond(400, { success: false, message: "OTP has expired. Please request a new one" });
    }

    if (user.otp !== otp.toString()) {
      return respond(400, { success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return respond(200, {
      success: true,
      message: "OTP verified successfully. You can now reset your password",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return respond(500, { success: false, message: "Failed to verify OTP", error: error.message });
  }
};

// 7. Reset Password Service
const resetPasswordService = async (identifier, newPassword) => {
  try {
    const user = await findUser(identifier);
    if (!user) {
      return respond(404, { success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return respond(400, { success: false, message: "OTP not verified. Reset password not allowed" });
    }

    user.password = newPassword;
    user.isVerified = false;
    await user.save();

    return respond(200, {
      success: true,
      message: "Password reset successful! You can now login with your new password",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return respond(500, { success: false, message: "Failed to reset password", error: error.message });
  }
};

// 8. Change Password Service (Authenticated)
const changePasswordService = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return respond(404, { success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return respond(400, { success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return respond(200, {
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return respond(500, { success: false, message: "Failed to change password", error: error.message });
  }
};

module.exports = {
  registerService,
  loginService,
  getProfileService,
  updateProfileService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
  changePasswordService,
};
