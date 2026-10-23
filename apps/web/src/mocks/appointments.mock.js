import { APPOINTMENT_STATUSES } from "../utils/constants";
import { createId, loadDb, saveDb } from "./db";
import { generateSlots, simulateLatency } from "./helpers";

function getPatientProfileByUserId(db, userId) {
  return db.patientProfiles.find((profile) => profile.userId === userId);
}

function enrichAppointment(db, appointment) {
  const patient = db.patientProfiles.find((profile) => profile.id === appointment.patientId);
  const user = db.users.find((candidate) => candidate.id === patient?.userId);

  return {
    ...appointment,
    patient: user
      ? {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone
        }
      : null
  };
}

export async function bookAppointmentMock(payload, userId) {
  await simulateLatency();

  const db = loadDb();
  const doctorProfile = db.doctorProfile;
  const patientProfile = getPatientProfileByUserId(db, userId);

  if (!patientProfile) {
    return {
      success: false,
      message: "Patient profile not found",
      errors: [{ field: "appointmentDate", message: "Please complete your profile first" }]
    };
  }

  if (!doctorProfile.bookingEnabled) {
    return {
      success: false,
      message: "Booking is currently disabled"
    };
  }

  const dateNow = new Date();
  dateNow.setHours(0, 0, 0, 0);
  const requestedDate = new Date(payload.appointmentDate);
  requestedDate.setHours(0, 0, 0, 0);

  if (requestedDate < dateNow) {
    return {
      success: false,
      message: "Appointment date cannot be in the past",
      errors: [{ field: "appointmentDate", message: "Please choose a future date" }]
    };
  }

  const availableSlots = generateSlots({
    date: payload.appointmentDate,
    availabilityRules: db.availability,
    appointments: db.appointments
  });

  const selectedSlot = availableSlots.find((slot) => slot.startTime === payload.startTime);

  if (!selectedSlot) {
    return {
      success: false,
      message: "Selected slot is no longer available",
      errors: [{ field: "startTime", message: "This slot has already been booked" }]
    };
  }

  const duplicate = db.appointments.some(
    (appointment) =>
      appointment.patientId === patientProfile.id &&
      appointment.appointmentDate === payload.appointmentDate &&
      appointment.startTime === payload.startTime &&
      appointment.status !== APPOINTMENT_STATUSES.CANCELLED
  );

  if (duplicate) {
    return {
      success: false,
      message: "Duplicate appointment is not allowed",
      errors: [{ field: "startTime", message: "You already booked this slot" }]
    };
  }

  const nextAppointment = {
    id: createId("ap"),
    patientId: patientProfile.id,
    appointmentDate: payload.appointmentDate,
    startTime: selectedSlot.startTime,
    endTime: selectedSlot.endTime,
    status: APPOINTMENT_STATUSES.PENDING,
    reason: payload.reason || "",
    notes: payload.notes || "",
    cancelledBy: null,
    cancellationReason: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.appointments.push(nextAppointment);
  saveDb(db);

  return {
    success: true,
    message: "Appointment booked successfully",
    data: nextAppointment
  };
}

export async function getMyAppointmentsMock(userId) {
  await simulateLatency(120);

  const db = loadDb();
  const patientProfile = getPatientProfileByUserId(db, userId);

  if (!patientProfile) {
    return {
      success: true,
      data: []
    };
  }

  const items = db.appointments
    .filter((appointment) => appointment.patientId === patientProfile.id)
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .map((appointment) => enrichAppointment(db, appointment));

  return {
    success: true,
    data: items
  };
}

export async function getAppointmentByIdMock(id) {
  await simulateLatency(100);

  const db = loadDb();
  const item = db.appointments.find((appointment) => appointment.id === id);

  if (!item) {
    return {
      success: false,
      message: "Appointment not found"
    };
  }

  return {
    success: true,
    data: enrichAppointment(db, item)
  };
}

function updateAppointmentStatus({ id, status, reason, cancelledBy, nextDate, nextTime }) {
  const db = loadDb();
  const appointment = db.appointments.find((item) => item.id === id);

  if (!appointment) {
    return {
      success: false,
      message: "Appointment not found"
    };
  }

  if (nextDate && nextTime) {
    const availableSlots = generateSlots({
      date: nextDate,
      availabilityRules: db.availability,
      appointments: db.appointments.filter((item) => item.id !== id)
    });

    const nextSlot = availableSlots.find((slot) => slot.startTime === nextTime);

    if (!nextSlot) {
      return {
        success: false,
        message: "Selected slot is no longer available",
        errors: [{ field: "startTime", message: "This slot has already been booked" }]
      };
    }

    appointment.appointmentDate = nextDate;
    appointment.startTime = nextSlot.startTime;
    appointment.endTime = nextSlot.endTime;
    appointment.status = APPOINTMENT_STATUSES.PENDING;
    appointment.rescheduledFromAppointmentId = id;
  } else {
    appointment.status = status;
  }

  if (reason) {
    appointment.cancellationReason = reason;
  }

  if (cancelledBy) {
    appointment.cancelledBy = cancelledBy;
  }

  appointment.updatedAt = new Date().toISOString();
  saveDb(db);

  return {
    success: true,
    message: "Appointment updated",
    data: enrichAppointment(db, appointment)
  };
}

export async function cancelAppointmentMock(id, payload, cancelledBy = "patient") {
  await simulateLatency();
  return updateAppointmentStatus({
    id,
    status: APPOINTMENT_STATUSES.CANCELLED,
    reason: payload?.reason,
    cancelledBy
  });
}

export async function rescheduleAppointmentMock(id, payload) {
  await simulateLatency();
  return updateAppointmentStatus({
    id,
    nextDate: payload.appointmentDate,
    nextTime: payload.startTime,
    reason: payload?.reason
  });
}

export async function confirmAppointmentMock(id) {
  await simulateLatency();
  return updateAppointmentStatus({ id, status: APPOINTMENT_STATUSES.CONFIRMED });
}

export async function completeAppointmentMock(id) {
  await simulateLatency();
  return updateAppointmentStatus({ id, status: APPOINTMENT_STATUSES.COMPLETED });
}

export async function noShowAppointmentMock(id) {
  await simulateLatency();
  return updateAppointmentStatus({ id, status: APPOINTMENT_STATUSES.NO_SHOW });
}

export async function adminAppointmentsMock(filters = {}) {
  await simulateLatency(140);
  const db = loadDb();

  let items = db.appointments.map((appointment) => enrichAppointment(db, appointment));

  if (filters.status) {
    items = items.filter((appointment) => appointment.status === filters.status);
  }

  if (filters.date) {
    items = items.filter((appointment) => appointment.appointmentDate === filters.date);
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    items = items.filter((appointment) => {
      const name = appointment.patient?.fullName?.toLowerCase() || "";
      return name.includes(term);
    });
  }

  items = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    success: true,
    data: {
      items,
      page: Number(filters.page || 1),
      limit: Number(filters.limit || 20),
      total: items.length
    }
  };
}
