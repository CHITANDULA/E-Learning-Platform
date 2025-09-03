const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Import the router
const profileRouter = require("../routes/profile");

// Mock DB
jest.mock("../config/db", () => ({
  query: jest.fn(),
}));
const db = require("../config/db");

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/profile", profileRouter);

// Helper token
const token = "fake-token";

describe("Profile Routes", () => {
  beforeEach(() => {
    // Mock jwt.verify to always succeed
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { user_id: 1 }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------- GET /profile --------
  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/profile");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No token provided.");
  });

  it("should return 404 if user not found", async () => {
    db.query.mockImplementationOnce((sql, params, cb) => cb(null, []));

    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  it("should return profile if user exists", async () => {
    db.query.mockImplementationOnce((sql, params, cb) =>
      cb(null, [{ user_id: 1, name: "Alice", email: "alice@test.com", created_at: "2024-01-01" }])
    );

    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("alice@test.com");
  });

  // -------- PUT /profile --------
  it("should return 400 if no fields provided for update", async () => {
    const res = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("No update fields provided.");
  });

  it("should update profile successfully", async () => {
    db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));

    const res = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully.");
  });

  // -------- PUT /profile/password --------
  it("should return 400 if missing current/new password", async () => {
    const res = await request(app)
      .put("/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Current and new passwords are required.");
  });

  it("should return 404 if user not found for password change", async () => {
    db.query.mockImplementationOnce((sql, params, cb) => cb(null, []));

    const res = await request(app)
      .put("/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "oldpass", newPassword: "newpass" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  it("should change password successfully if correct current password", async () => {
    const hashed = await require("bcrypt").hash("oldpass", 10);

    db.query.mockImplementation((sql, params, cb) => {
      if (sql.startsWith("SELECT")) cb(null, [{ password_hash: hashed }]);
      else if (sql.startsWith("UPDATE")) cb(null, { affectedRows: 1 });
    });

    const res = await request(app)
      .put("/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "oldpass", newPassword: "newpass" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password changed successfully.");
  });
});
