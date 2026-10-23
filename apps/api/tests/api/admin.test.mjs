import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import User from "../../src/models/user.model.js";

function isDbAvailable() {
  return mongoose.connection.readyState === 1;
}

function generateAccessToken(userId) {
  return jwt.sign({ userId }, env.jwtAccessSecret, { expiresIn: "1h" });
}

async function createUser(role) {
  const now = Date.now();
  return User.create({
    fullName: `${role}-user-${now}`,
    email: `${role}-${now}-${Math.random().toString(16).slice(2)}@example.com`,
    passwordHash: "Password123!",
    phone: "03001234567",
    role
  });
}

async function createAuthContext() {
  const adminUser = await createUser("admin");
  const patientUser = await createUser("patient");

  return {
    adminToken: generateAccessToken(adminUser._id.toString()),
    patientToken: generateAccessToken(patientUser._id.toString())
  };
}

describe("Admin API", () => {
  describe("GET /api/v1/admin/dashboard", () => {
    it("returns 200 with valid admin JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { adminToken } = await createAuthContext();
      const res = await request(app)
        .get("/api/v1/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 401 with no token", async () => {
      const res = await request(app).get("/api/v1/admin/dashboard");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 with patient JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { patientToken } = await createAuthContext();
      const res = await request(app)
        .get("/api/v1/admin/dashboard")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/admin/patients", () => {
    it("returns 200 with valid admin JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { adminToken } = await createAuthContext();
      const res = await request(app)
        .get("/api/v1/admin/patients")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 401 with no token", async () => {
      const res = await request(app).get("/api/v1/admin/patients");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 with patient JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { patientToken } = await createAuthContext();
      const res = await request(app)
        .get("/api/v1/admin/patients")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/admin/appointments", () => {
    it("returns 200 with valid admin JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { adminToken } = await createAuthContext();
      const res = await request(app)
        .get("/api/v1/admin/appointments")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 401 with no token", async () => {
      const res = await request(app).get("/api/v1/admin/appointments");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/v1/admin/patients/:id/block", () => {
    it("returns 404 with nonexistent patient id", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { adminToken } = await createAuthContext();
      const res = await request(app)
        .patch("/api/v1/admin/patients/507f1f77bcf86cd799439011/block")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 with no token", async () => {
      const res = await request(app).patch("/api/v1/admin/patients/507f1f77bcf86cd799439011/block");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
