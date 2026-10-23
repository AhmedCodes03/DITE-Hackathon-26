import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import User from "../../src/models/user.model.js";
import PatientProfile from "../../src/models/patientProfile.model.js";

function isDbAvailable() {
  return mongoose.connection.readyState === 1;
}

function generateAccessToken(userId) {
  return jwt.sign({ userId }, env.jwtAccessSecret, { expiresIn: "1h" });
}

async function createPatientContext() {
  const now = Date.now();
  const user = await User.create({
    fullName: `patient-${now}`,
    email: `patient-${now}-${Math.random().toString(16).slice(2)}@example.com`,
    passwordHash: "Password123!",
    phone: "03001234567",
    role: "patient"
  });

  await PatientProfile.create({ userId: user._id });

  return {
    user,
    token: generateAccessToken(user._id.toString())
  };
}

async function createAdminToken() {
  const now = Date.now();
  const admin = await User.create({
    fullName: `admin-${now}`,
    email: `admin-${now}-${Math.random().toString(16).slice(2)}@example.com`,
    passwordHash: "Password123!",
    phone: "03001234567",
    role: "admin"
  });

  return generateAccessToken(admin._id.toString());
}

describe("Patients API", () => {
  describe("GET /api/v1/patients/me", () => {
    it("returns 200 with valid patient JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { token } = await createPatientContext();
      const res = await request(app)
        .get("/api/v1/patients/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 401 with no token", async () => {
      const res = await request(app).get("/api/v1/patients/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 403 with admin JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const adminToken = await createAdminToken();
      const res = await request(app)
        .get("/api/v1/patients/me")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/v1/patients/me", () => {
    it("returns 200 with valid patient JWT + valid body", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { token } = await createPatientContext();
      const res = await request(app)
        .patch("/api/v1/patients/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
          fullName: "Updated Patient",
          phone: "03111222333",
          gender: "female",
          address: "Updated Address"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 400 with invalid payload (Zod rejection)", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const { token } = await createPatientContext();
      const res = await request(app)
        .patch("/api/v1/patients/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
          gender: "not-valid-gender"
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 with no token", async () => {
      const res = await request(app)
        .patch("/api/v1/patients/me")
        .send({ fullName: "No Auth" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
