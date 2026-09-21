const Joi = require("joi");

const registerValidation = Joi.object({
  username: Joi.string().trim().min(3).max(30).required().messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
    "string.min": "Username must be at least 3 characters",
  }),
  email: Joi.string().trim().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please enter a valid email address",
  }),
  fullName: Joi.string().trim().allow("", null),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

const loginValidation = Joi.object({
  username: Joi.string().trim(),
  email: Joi.string().trim().email(),
  usernameOrEmail: Joi.string().trim(),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
}).or("username", "email", "usernameOrEmail").messages({
  "object.missing": "Please provide username or email to login",
});

const forgotPasswordValidation = Joi.object({
  email: Joi.string().trim().email(),
  username: Joi.string().trim(),
  usernameOrEmail: Joi.string().trim(),
}).or("email", "username", "usernameOrEmail").messages({
  "object.missing": "Please provide email or username",
});

const verifyOtpValidation = Joi.object({
  email: Joi.string().trim().email(),
  username: Joi.string().trim(),
  usernameOrEmail: Joi.string().trim(),
  otp: Joi.alternatives().try(Joi.string(), Joi.number()).required().messages({
    "any.required": "OTP is required",
  }),
}).or("email", "username", "usernameOrEmail");

const resetPasswordValidation = Joi.object({
  email: Joi.string().trim().email(),
  username: Joi.string().trim(),
  usernameOrEmail: Joi.string().trim(),
  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  confirmPassword: Joi.string(),
}).or("email", "username", "usernameOrEmail");

const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  confirmPassword: Joi.string(),
});

// Helper function to validate schema
const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => d.message).join(", "), value: null };
  }
  return { error: null, value };
};

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
  changePasswordValidation,
  validate,
};
