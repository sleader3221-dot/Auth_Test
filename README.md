# DukaanSE - User Authentication Backend

A clean, professional, and lightweight User Authentication Backend built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**, following the architecture and coding conventions of DukaanSE.

---

## 📁 Project Structure

```text
DukaanSE-UserAuth-Backend/
├── config/
│   └── db.js                   # MongoDB connection
├── controllers/
│   └── auth.controller.js      # Auth controllers (Register, Login, Profile, etc.)
├── middlewares/
│   └── auth.middleware.js      # JWT token authentication middleware
├── models/
│   ├── user.model.js           # User Mongoose schema & methods
│   └── blacklistToken.model.js # Blacklisted token schema with TTL auto-expiry
├── routes/
│   └── auth.routes.js          # Authentication route definitions
├── services/
│   └── auth.service.js         # Business logic for authentication
├── utils/
│   └── sendEmail.js            # Nodemailer email sender
├── validations/
│   └── auth.validation.js      # Joi request body validation
├── app.js                      # Express app configuration
├── index.js                    # Server entry point
├── package.json                # Project dependencies and scripts
├── .env                        # Environment configuration
├── .env.example                # Example environment variables template
├── postman_collection.json     # Ready-to-import Postman Collection
├── postman_environment.json    # Ready-to-import Postman Environment
└── test.js                     # Automated test script
```

---

## ⚡ Features

- **User Registration**: With username, email, and password (hashed with bcrypt).
- **User Login**: Supports login with username or email + password; returns JWT token.
- **Protected Profile**: View and update profile using JWT Bearer token.
- **Forgot Password Flow**:
  - Generates a 6-digit OTP (valid for 5 minutes).
  - Sends email via Nodemailer.
  - Verifies OTP and allows resetting the password.
- **Change Password**: Authenticated password change with current password verification.
- **Logout**: Cleans up token.

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
# OR for development with auto-reload:
npm run dev
```
The server will start on: `http://localhost:5000`

### 3. Run Automated Tests
With the server running (or in a separate terminal):
```bash
npm test
```
All 10 endpoints will be verified automatically.

---

## 📮 Testing with Postman

1. Open **Postman** and click **Import**.
2. Select `postman_collection.json` from the project directory.
3. The collection is named: **`DukaanSE - User Authentication API`**.
4. Run requests in numerical order (`1. Health Check`, `2. Register`, `3. Login`, etc.).
5. Postman test scripts will automatically save the `token` and `otp` into variables for subsequent requests.

---

## 📋 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check | No |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login with username/email & password | No |
| `GET` | `/api/auth/profile` | Get current user profile | Yes (Bearer Token) |
| `PUT` | `/api/auth/profile` | Update profile info | Yes (Bearer Token) |
| `POST` | `/api/auth/forgot-password` | Generate & send reset OTP | No |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP | No |
| `POST` | `/api/auth/reset-password` | Set new password | No |
| `PUT` | `/api/auth/change-password` | Change current password | Yes (Bearer Token) |
| `POST` | `/api/auth/logout` | Logout user | Yes (Bearer Token) |
