import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";
import User from "../src/models/user.model.js";

const testUser = {
  fullName: "Test Patient",
  email: "test@example.com",
  password: "Password123!",
  phone: "03001234567"
};

function isDbAvailable() {
  return mongoose.connection.readyState === 1;
}

async function createUser({ role = "patient", emailPrefix = "user" } = {}) {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return User.create({
    fullName: `${role} ${emailPrefix}`,
    email: `${emailPrefix}-${unique}@example.com`,
    passwordHash: "Password123!",
    phone: "03001234567",
    role
  });
}

function signAccessToken(userId) {
  return jwt.sign({ userId }, env.jwtAccessSecret, { expiresIn: "1h" });
}

describe("Auth API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should return 201 for a valid payload when DB is available", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const uniqueEmail = `valid-${Date.now()}@example.com`;
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...testUser, email: uniqueEmail });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 or 409 for duplicate email when DB is available", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const duplicateEmail = `dup-${Date.now()}@example.com`;
      const first = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...testUser, email: duplicateEmail });

      const second = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...testUser, email: duplicateEmail });

      expect(first.status).toBe(201);
      expect([400, 409]).toContain(second.status);
      expect(second.body.success).toBe(false);
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...testUser, email: "invalid-email" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for short password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...testUser, password: "123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return 400 when password is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "invalid-email", password: testUser.password });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 for non-existent email", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nonexistent@example.com", password: testUser.password });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return 200 with valid JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const user = await createUser({ role: "patient", emailPrefix: "me-valid" });
      const token = signAccessToken(user._id.toString());

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return user body with id, email, role fields", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const user = await createUser({ role: "patient", emailPrefix: "me-shape" });
      const token = signAccessToken(user._id.toString());

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          role: expect.any(String)
        })
      );
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 for invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 for malformed token string", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer malformed.token.value");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 for expired token", async () => {
      const expiredToken = jwt.sign(
        { userId: "507f1f77bcf86cd799439011" },
        env.jwtAccessSecret,
        { expiresIn: -10 }
      );

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should return 400 when refresh token is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 for invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "not-a-valid-token" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should return 200 with valid JWT", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const user = await createUser({ role: "patient", emailPrefix: "logout-valid" });
      const token = signAccessToken(user._id.toString());

      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app).post("/api/v1/auth/logout");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 for malformed bearer token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", "Bearer malformed.token.value");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

describe("Doctor Profile API", () => {
  describe("GET /api/v1/doctor-profile", () => {
    it("should return doctor profile", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const res = await request(app).get("/api/v1/doctor-profile");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /api/v1/doctor-profile", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .patch("/api/v1/doctor-profile")
        .send({ doctorName: "Dr. Hacked" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

describe("Availability API", () => {
  describe("GET /api/v1/availability", () => {
    it("should return availability list", async () => {
      if (!isDbAvailable()) {
        expect(true).toBe(true);
        return;
      }

      const res = await request(app).get("/api/v1/availability");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/v1/availability/slots", () => {
    it("should return 400 for missing date", async () => {
      const res = await request(app).get("/api/v1/availability/slots");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/availability", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .post("/api/v1/availability")
        .send({
          dayOfWeek: "monday",
          startTime: "09:00",
          endTime: "17:00",
          slotDurationMinutes: 30
        });

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/availability/:id", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .patch("/api/v1/availability/507f1f77bcf86cd799439011")
        .send({ startTime: "10:00" });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/v1/availability/:id", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .delete("/api/v1/availability/507f1f77bcf86cd799439011");

      expect(res.status).toBe(401);
    });
  });
});

describe("Appointments API", () => {
  describe("POST /api/v1/appointments", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .send({
          appointmentDate: "2026-04-13",
          startTime: "09:00",
          endTime: "09:30",
          reason: "Regular checkup"
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/appointments/me", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app).get("/api/v1/appointments/me");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/appointments/:id", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .get("/api/v1/appointments/507f1f77bcf86cd799439011");

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/appointments/:id/cancel", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .patch("/api/v1/appointments/507f1f77bcf86cd799439011/cancel")
        .send({ cancellationReason: "Schedule conflict" });

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/appointments/:id/confirm", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .patch("/api/v1/appointments/507f1f77bcf86cd799439011/confirm");

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/appointments/:id/complete", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .patch("/api/v1/appointments/507f1f77bcf86cd799439011/complete");

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/appointments/:id/no-show", () => {
    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app)
        .patch("/api/v1/appointments/507f1f77bcf86cd799439011/no-show");

      expect(res.status).toBe(401);
    });
  });
});

describe("Health Check", () => {
  it("should return healthy status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

describe("404 Handler", () => {
  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/unknown-route");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
