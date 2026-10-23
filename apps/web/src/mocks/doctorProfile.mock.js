import { loadDb, saveDb } from "./db";
import { simulateLatency } from "./helpers";

export async function getDoctorProfileMock() {
  await simulateLatency(120);
  const db = loadDb();

  return {
    success: true,
    data: db.doctorProfile
  };
}

export async function updateDoctorProfileMock(payload) {
  await simulateLatency();

  const db = loadDb();
  db.doctorProfile = {
    ...db.doctorProfile,
    ...payload,
    updatedAt: new Date().toISOString()
  };
  saveDb(db);

  return {
    success: true,
    message: "Doctor profile updated",
    data: db.doctorProfile
  };
}
