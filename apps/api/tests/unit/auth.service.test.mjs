import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const jwtMock = {
  sign: jest.fn(),
  verify: jest.fn()
};

const cryptoMock = {
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("hashed-token")
  }))
};

const bcryptMock = {
  compare: jest.fn(),
  hash: jest.fn()
};

const UserMock = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
};

const PatientProfileMock = {
  create: jest.fn()
};

jest.unstable_mockModule("jsonwebtoken", () => ({ default: jwtMock }));
jest.unstable_mockModule("crypto", () => ({ default: cryptoMock }));
jest.unstable_mockModule("bcryptjs", () => ({ default: bcryptMock }));

jest.unstable_mockModule("../../src/models/user.model.js", () => ({
  default: UserMock
}));

jest.unstable_mockModule("../../src/models/patientProfile.model.js", () => ({
  default: PatientProfileMock
}));

const {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser
} = await import("../../src/modules/auth/auth.service.js");

describe("auth service unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwtMock.sign.mockReturnValue("signed-token");
  });

  it("register creates user and returns tokens", async () => {
    const userDoc = {
      _id: { toString: () => "507f1f77bcf86cd799439011" },
      fullName: "Ali Khan",
      email: "ali@example.com",
      role: "patient",
      save: jest.fn().mockResolvedValue(undefined)
    };

    UserMock.findOne.mockResolvedValue(null);
    UserMock.create.mockResolvedValue(userDoc);
    PatientProfileMock.create.mockResolvedValue({});

    const result = await registerUser({
      fullName: "Ali Khan",
      email: "ali@example.com",
      password: "Password123",
      phone: "03001234567"
    });

    expect(UserMock.create).toHaveBeenCalled();
    expect(PatientProfileMock.create).toHaveBeenCalled();
    expect(userDoc.save).toHaveBeenCalled();
    expect(result.accessToken).toBe("signed-token");
    expect(result.refreshToken).toBe("signed-token");
  });

  it("register throws when email already exists", async () => {
    UserMock.findOne.mockResolvedValue({ _id: "existing" });

    await expect(
      registerUser({
        fullName: "Ali Khan",
        email: "ali@example.com",
        password: "Password123"
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("login returns tokens on valid credentials", async () => {
    const userDoc = {
      _id: { toString: () => "507f1f77bcf86cd799439012" },
      fullName: "Ali Khan",
      role: "patient",
      isBlocked: false,
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(undefined)
    };

    UserMock.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(userDoc)
    });

    const result = await loginUser({ email: "ali@example.com", password: "Password123" });

    expect(userDoc.comparePassword).toHaveBeenCalledWith("Password123");
    expect(result.accessToken).toBe("signed-token");
    expect(result.refreshToken).toBe("signed-token");
  });

  it("login throws on wrong password", async () => {
    const userDoc = {
      _id: { toString: () => "507f1f77bcf86cd799439012" },
      isBlocked: false,
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(false)
    };

    UserMock.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(userDoc)
    });

    await expect(
      loginUser({ email: "ali@example.com", password: "WrongPass123" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("login throws on non-existent email", async () => {
    UserMock.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await expect(
      loginUser({ email: "missing@example.com", password: "Password123" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("refresh returns new access token on valid token", async () => {
    jwtMock.verify.mockReturnValue({ userId: "507f1f77bcf86cd799439013" });

    const userDoc = {
      _id: { toString: () => "507f1f77bcf86cd799439013" },
      refreshToken: "hashed-token",
      save: jest.fn().mockResolvedValue(undefined)
    };

    UserMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(userDoc)
    });

    const result = await refreshTokens({ refreshToken: "valid-refresh-token" });

    expect(jwtMock.verify).toHaveBeenCalled();
    expect(result.accessToken).toBe("signed-token");
  });

  it("refresh throws on invalid token", async () => {
    jwtMock.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    await expect(
      refreshTokens({ refreshToken: "bad-token" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("logout clears refresh token", async () => {
    UserMock.findByIdAndUpdate.mockResolvedValue({ _id: "507f1f77bcf86cd799439014" });

    const result = await logoutUser("507f1f77bcf86cd799439014");

    expect(result).toBe(true);
    expect(UserMock.findByIdAndUpdate).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439014",
      { refreshToken: null },
      { new: true }
    );
  });
});
