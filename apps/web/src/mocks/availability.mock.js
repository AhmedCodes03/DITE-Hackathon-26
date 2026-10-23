import { createId, loadDb, saveDb } from "./db";
import { generateSlots, simulateLatency } from "./helpers";

export async function getAvailabilityMock() {
  await simulateLatency(120);
  const db = loadDb();

  return {
    success: true,
    data: db.availability
  };
}

export async function getAvailabilitySlotsMock(date) {
  await simulateLatency(150);
  const db = loadDb();

  const slots = generateSlots({
    date,
    availabilityRules: db.availability,
    appointments: db.appointments
  });

  return {
    success: true,
    data: {
      date,
      slots
    }
  };
}

export async function createAvailabilityMock(payload) {
  await simulateLatency();
  const db = loadDb();

  const next = {
    id: createId("a"),
    ...payload,
    isActive: payload.isActive ?? true
  };

  db.availability.push(next);
  saveDb(db);

  return {
    success: true,
    message: "Availability created",
    data: next
  };
}

export async function updateAvailabilityMock(id, payload) {
  await simulateLatency();
  const db = loadDb();

  db.availability = db.availability.map((item) =>
    item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
  );

  const updated = db.availability.find((item) => item.id === id);
  saveDb(db);

  return {
    success: true,
    message: "Availability updated",
    data: updated
  };
}

export async function deleteAvailabilityMock(id) {
  await simulateLatency();
  const db = loadDb();
  db.availability = db.availability.filter((item) => item.id !== id);
  saveDb(db);

  return {
    success: true,
    message: "Availability deleted"
  };
}
