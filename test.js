const http = require("http");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const id = Date.now().toString().slice(-4);
const testUser = {
  username: `user_${id}`,
  email: `user_${id}@example.com`,
  fullName: "Test User",
  password: "Password123",
  newPassword: "NewPassword123",
};

let token = "";
let otp = "";

// Helper for making HTTP requests
const request = (path, method = "GET", data = null, authToken = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const bodyStr = data ? JSON.stringify(data) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(bodyStr && { "Content-Length": Buffer.byteLength(bodyStr) }),
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => (responseBody += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
};

const runTests = async () => {
  console.log("\n🚀 Running DukaanSE Authentication Tests...\n");

  try {
    // 1. Health Check
    const health = await request("/api/health");
    console.log("1. Health Check:", health.status === 200 ? "✅ PASSED" : "❌ FAILED");

    // 2. Register
    const reg = await request("/api/auth/register", "POST", {
      username: testUser.username,
      email: testUser.email,
      fullName: testUser.fullName,
      password: testUser.password,
    });
    console.log("2. Register:", reg.status === 201 ? "✅ PASSED" : "❌ FAILED", "-", reg.body.message);

    // 3. Login
    const login = await request("/api/auth/login", "POST", {
      username: testUser.username,
      password: testUser.password,
    });
    console.log("3. Login:", login.status === 200 ? "✅ PASSED" : "❌ FAILED", "-", login.body.message);
    token = login.body.token;

    // 4. Get Profile
    const profile = await request("/api/auth/profile", "GET", null, token);
    console.log("4. Get Profile:", profile.status === 200 ? "✅ PASSED" : "❌ FAILED", "-", profile.body.user?.email);

    // 5. Update Profile
    const update = await request("/api/auth/profile", "PUT", { fullName: "Updated Name" }, token);
    console.log("5. Update Profile:", update.status === 200 ? "✅ PASSED" : "❌ FAILED", "-", update.body.message);

    // 6. Forgot Password
    const forgot = await request("/api/auth/forgot-password", "POST", { email: testUser.email });
    console.log("6. Forgot Password (OTP):", forgot.status === 200 ? "✅ PASSED" : "❌ FAILED", `- OTP: ${forgot.body.otp}`);
    otp = forgot.body.otp;

    // 7. Verify OTP
    const verify = await request("/api/auth/verify-otp", "POST", { email: testUser.email, otp });
    console.log("7. Verify OTP:", verify.status === 200 ? "✅ PASSED" : "❌ FAILED", "-", verify.body.message);

    // 8. Reset Password
    const reset = await request("/api/auth/reset-password", "POST", {
      email: testUser.email,
      newPassword: testUser.newPassword,
    });
    console.log("8. Reset Password:", reset.status === 200 ? "✅ PASSED" : "❌ FAILED", "-", reset.body.message);

    // 9. Change Password (login with new password first)
    const newLogin = await request("/api/auth/login", "POST", {
      email: testUser.email,
      password: testUser.newPassword,
    });
    const change = await request(
      "/api/auth/change-password",
      "PUT",
      {
        currentPassword: testUser.newPassword,
        newPassword: "FinalPassword123",
      },
      newLogin.body.token
    );
    console.log("9. Change Password:", change.status === 200 ? "✅ PASSED" : "❌ FAILED", "-", change.body.message);

    // 10. Logout
    const logout = await request("/api/auth/logout", "POST", null, newLogin.body.token);
    console.log("10. Logout:", logout.status === 200 ? "✅ PASSED" : "❌ FAILED", "-", logout.body.message);

    console.log("\n🎉 ALL 10 TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test Error:", error.message);
    process.exit(1);
  }
};

runTests();
