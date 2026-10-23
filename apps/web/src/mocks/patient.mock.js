import { loadDb, saveDb } from "./db";
import { simulateLatency } from "./helpers";

export async function getMyProfileMock(userId) {
  await simulateLatency(120);
  const db = loadDb();

  const user = db.users.find((item) => item.id === userId);
  const profile = db.patientProfiles.find((item) => item.userId === userId);

  if (!user) {
    return {
      success: false,
      message: "User not found"
    };
  }

  return {
    success: true,
    data: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      ...(profile || {})
    }
  };
}

export async function updateMyProfileMock(userId, payload) {
  await simulateLatency();
  const db = loadDb();

  const user = db.users.find((item) => item.id === userId);
  if (!user) {
    return {
      success: false,
      message: "User not found"
    };
  }

  user.fullName = payload.fullName;
  user.phone = payload.phone;

  let profile = db.patientProfiles.find((item) => item.userId === userId);

  if (!profile) {
    profile = {
      id: `p_${Date.now()}`,
      userId
    };
    db.patientProfiles.push(profile);
  }

  Object.assign(profile, {
    age: payload.age,
    gender: payload.gender,
    address: payload.address,
    emergencyContactName: payload.emergencyContactName,
    emergencyContactPhone: payload.emergencyContactPhone,
    medicalNotes: payload.medicalNotes
  });

  saveDb(db);

  return {
    success: true,
    message: "Profile updated",
    data: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      ...profile
    }
  };
}
