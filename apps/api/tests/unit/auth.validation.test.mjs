import { describe, expect, it } from "@jest/globals";
import {
  loginSchema,
  refreshSchema,
  registerSchema
} from "../../src/modules/auth/auth.validation.js";

describe("auth validation schemas", () => {
  it("registerSchema passes valid input", () => {
    const result = registerSchema.safeParse({
      fullName: "Ali Khan",
      email: "ali@example.com",
      password: "Password123",
      phone: "03001234567"
    });

    expect(result.success).toBe(true);
  });

  it("registerSchema fails with missing email", () => {
    const result = registerSchema.safeParse({
      fullName: "Ali Khan",
      password: "Password123"
    });

    expect(result.success).toBe(false);
  });

  it("registerSchema fails with invalid email format", () => {
    const result = registerSchema.safeParse({
      fullName: "Ali Khan",
      email: "invalid-email",
      password: "Password123"
    });

    expect(result.success).toBe(false);
  });

  it("registerSchema fails with short password", () => {
    const result = registerSchema.safeParse({
      fullName: "Ali Khan",
      email: "ali@example.com",
      password: "Pass1"
    });

    expect(result.success).toBe(false);
  });

  it("loginSchema passes with valid email/password", () => {
    const result = loginSchema.safeParse({
      email: "ali@example.com",
      password: "Password123"
    });

    expect(result.success).toBe(true);
  });

  it("loginSchema fails with missing password", () => {
    const result = loginSchema.safeParse({
      email: "ali@example.com"
    });

    expect(result.success).toBe(false);
  });

  it("refreshSchema passes with valid refreshToken", () => {
    const result = refreshSchema.safeParse({
      refreshToken: "some-valid-token"
    });

    expect(result.success).toBe(true);
  });

  it("refreshSchema fails with missing token", () => {
    const result = refreshSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
