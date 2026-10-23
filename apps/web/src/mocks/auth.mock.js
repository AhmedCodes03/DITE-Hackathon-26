import { createId, loadDb, saveDb } from "./db";
import { createMockToken, parseMockToken } from "./token";
import { USER_ROLES } from "../utils/constants";
import { simulateLatency } from "./helpers";

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone
  };
}

export async function registerMock(payload) {
  await simulateLatency();

  const db = loadDb();
  const existing = db.users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());

  if (existing) {
    return {
      success: false,
      message: "Email already exists",
      errors: [{ field: "email", message: "Email is already registered" }]
    };
  }

  const newUser = {
    id: createId("u"),
    fullName: payload.fullName,
    email: payload.email.toLowerCase(),
    password: payload.password,
    role: USER_ROLES.PATIENT,
    phone: payload.phone || "",
    isActive: true,
    isBlocked: false
  };

  db.users.push(newUser);
  db.patientProfiles.push({
    id: createId("p"),
    userId: newUser.id,
    age: payload.age || null,
    gender: payload.gender || "prefer_not_to_say",
    address: payload.address || "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalNotes: ""
  });

  saveDb(db);

  const token = createMockToken(newUser);

  return {
    success: true,
    message: "User registered successfully",
    data: {
      user: sanitizeUser(newUser),
      token
    }
  };
}

export async function loginMock(payload) {
  await simulateLatency();

  const db = loadDb();

  const user = db.users.find((candidate) => candidate.email.toLowerCase() === payload.email.toLowerCase());

  if (!user || user.password !== payload.password) {
    return {
      success: false,
      message: "Invalid credentials",
      errors: [{ field: "email", message: "Email or password is incorrect" }]
    };
  }

  if (user.isBlocked) {
    return {
      success: false,
      message: "User is blocked",
      errors: [{ field: "email", message: "Your account is blocked" }]
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      message: "User is inactive",
      errors: [{ field: "email", message: "Your account is inactive" }]
    };
  }

  return {
    success: true,
    message: "Login successful",
    data: {
      user: sanitizeUser(user),
      token: createMockToken(user)
    }
  };
}

export async function meMock(token) {
  await simulateLatency(120);

  const payload = parseMockToken(token);

  if (!payload || payload.exp < Date.now()) {
    return {
      success: false,
      message: "Unauthorized"
    };
  }

  const db = loadDb();
  const user = db.users.find((candidate) => candidate.id === payload.id);

  if (!user || user.isBlocked || !user.isActive) {
    return {
      success: false,
      message: "Unauthorized"
    };
  }

  return {
    success: true,
    data: sanitizeUser(user)
  };
}

export async function refreshMock() {
  return {
    success: false,
    message: "Refresh token not configured"
  };
}
