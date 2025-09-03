const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Import your routers
const authRouter = require("../routes/auth");
const profileRouter = require("../routes/profile");

// Mock DB
jest.mock("../config/db");
const db = require("../config/db");

// Create Express app for integration tests
const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/profile", profileRouter);

// Helper to generate JWT (fallback secret if not set)
function generateToken(user_id = 1) {
  return jwt.sign({ user_id }, process.env.JWT_SECRET || "testsecret", { expiresIn: "1h" });
}

describe("Integration Test: Auth → Profile Flow", () => {
  beforeAll(() => {
    // Mock db.query to handle all SQL in this flow
    db.query.mockImplementation(async (sql, params, callback) => {
      // REGISTER user
      if (/INSERT INTO users/i.test(sql)) {
        return callback(null, { insertId: 1 });
      }

      // INSERT dashboard
      if (/INSERT INTO dashboards/i.test(sql)) {
        return callback(null, { affectedRows: 1 });
      }

      // LOGIN select query
      if (/SELECT u\.\*, d\.dashboard_id FROM users u/i.test(sql)) {
        const passwordHash = await bcrypt.hash("123456", 10);
        return callback(null, [
          {
            user_id: 1,
            name: "Test User",
            email: "test@example.com",
            password_hash: passwordHash,
            dashboard_id: 1,
          },
        ]);
      }

      // PROFILE select
      if (/SELECT user_id, name, email, created_at FROM users WHERE user_id/i.test(sql)) {
        return callback(null, [
          { user_id: 1, name: "Test User", email: "test@example.com", created_at: "2025-01-01" },
        ]);
      }

      // UPDATE profile or password
      if (/UPDATE users/i.test(sql)) {
        return callback(null, { affectedRows: 1 });
      }

      // Default empty result
      return callback(null, []);
    });
  });

  it("should register, login, get profile, update profile, and change password", async () => {
    // --- REGISTER ---
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.message).toBe("Registration successful! You can now log in.");

    // --- LOGIN ---
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "123456",
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    const token = loginRes.body.token;

    // --- GET PROFILE ---
    const profileRes = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.email).toBe("test@example.com");

    // --- UPDATE PROFILE ---
    const updateRes = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated User" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.message).toBe("Profile updated successfully.");

    // --- CHANGE PASSWORD ---
    const passwordRes = await request(app)
      .put("/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "123456", newPassword: "newpassword" });

    expect(passwordRes.status).toBe(200);
    expect(passwordRes.body.message).toBe("Password changed successfully.");
  });
});
