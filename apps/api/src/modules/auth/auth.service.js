import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../models/user.model.js";
import PatientProfile from "../../models/patientProfile.model.js";
import DoctorProfile from "../../models/doctorProfile.model.js";
import { env } from "../../config/env.js";
import { ROLES } from "../../config/roles.js";
import { ApiError } from "../../utils/ApiError.js";

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });

  const refreshToken = jwt.sign({ userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });

  return { accessToken, refreshToken };
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * @description Creates a new patient account, initializes a patient profile, and returns auth tokens.
 */
export async function registerUser({ fullName, email, password, phone }) {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    throw new ApiError("Email already registered", 400);
  }

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    passwordHash: password,
    phone,
    role: ROLES.PATIENT
  });

  const { accessToken, refreshToken } = generateTokens(user._id.toString());

  await Promise.all([
    PatientProfile.create({ userId: user._id }),
    User.updateOne(
      { _id: user._id },
      { $set: { refreshToken: hashRefreshToken(refreshToken) } }
    )
  ]);

  return {
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}

/**
 * @description Registers a new doctor account with a pending DoctorProfile awaiting admin approval.
 */
export async function registerDoctor({ fullName, email, password, phone, specialty, clinicName, clinicAddress, bio, experienceYears, qualifications }) {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    throw new ApiError("Email already registered", 400);
  }

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    passwordHash: password,
    phone,
    role: ROLES.DOCTOR
  });

  const { accessToken, refreshToken } = generateTokens(user._id.toString());

  const qualificationsArray = Array.isArray(qualifications)
    ? qualifications
    : typeof qualifications === "string"
      ? qualifications.split(",").map((q) => q.trim()).filter(Boolean)
      : [];

  await Promise.all([
    DoctorProfile.create({
      userId: user._id,
      doctorName: fullName,
      specialty: specialty || "General Practitioner",
      bio: bio || "",
      clinicName: clinicName || "",
      clinicAddress: clinicAddress || "",
      experienceYears: experienceYears ? Number(experienceYears) : 0,
      qualifications: qualificationsArray,
      contactEmail: normalizedEmail,
      contactPhone: phone || "",
      status: "pending",
      bookingEnabled: false
    }),
    User.updateOne(
      { _id: user._id },
      { $set: { refreshToken: hashRefreshToken(refreshToken) } }
    )
  ]);

  return {
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}


/**
 * @description Authenticates a user with email/password and rotates refresh token state.
 * @param {{ email: string, password: string }} param0 - Login credentials.
 * @returns {Promise<{ user: { id: string, fullName: string, role: string }, accessToken: string, refreshToken: string }>} Authenticated user summary and JWT tokens.
 * @throws {ApiError} when credentials are invalid or the account is blocked/inactive.
 */
export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash"
  );

  if (!user) {
    throw new ApiError("Invalid email or password", 401);
  }

  if (user.isBlocked) {
    throw new ApiError("Your account has been blocked. Contact support.", 403);
  }

  if (!user.isActive) {
    throw new ApiError("Your account is inactive. Contact support.", 403);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid email or password", 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString());

  await User.updateOne(
    { _id: user._id },
    { $set: { refreshToken: hashRefreshToken(refreshToken) } }
  );

  return {
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}

/**
 * @description Validates a refresh token and issues a new access/refresh token pair.
 * @param {{ refreshToken: string }} param0 - Refresh token payload.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>} Newly issued JWT tokens.
 * @throws {ApiError} when refresh token is missing, invalid, expired, rotated, or user does not exist.
 */
export async function refreshTokens({ refreshToken }) {
  if (!refreshToken) {
    throw new ApiError("Refresh token is required", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError("Refresh token expired. Please login again.", 403);
    }
    throw new ApiError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const hashedToken = hashRefreshToken(refreshToken);
  if (user.refreshToken !== hashedToken) {
    throw new ApiError("Refresh token has been rotated. Please login again.", 403);
  }

  const tokens = generateTokens(user._id.toString());

  user.refreshToken = hashRefreshToken(tokens.refreshToken);
  await user.save();

  return tokens;
}

/**
 * @description Clears the stored refresh token hash for a user to end their authenticated session.
 * @param {string} userId - User identifier.
 * @returns {Promise<boolean>} True when logout state is persisted.
 * @throws {ApiError} when the user cannot be found.
 */
export async function logoutUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { refreshToken: null },
    { new: true }
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return true;
}

/**
 * @description Returns the public profile fields for the currently authenticated user.
 * @param {string} userId - User identifier.
 * @returns {Promise<{ id: string, fullName: string, email: string, role: string }>} Authenticated user profile summary.
 * @throws {ApiError} when the user cannot be found.
 */
export async function getMe(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role
  };
}
