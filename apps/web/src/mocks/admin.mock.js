import { loadDb, saveDb } from "./db";
import { APPOINTMENT_STATUSES } from "../utils/constants";
import { simulateLatency } from "./helpers";

export async function adminDashboardMock() {
  await simulateLatency(120);
  const db = loadDb();

  const counts = db.appointments.reduce(
    (acc, appointment) => {
      acc.totalAppointments += 1;
      if (appointment.status === APPOINTMENT_STATUSES.PENDING) acc.pendingAppointments += 1;
      if (appointment.status === APPOINTMENT_STATUSES.CONFIRMED) acc.confirmedAppointments += 1;
      if (appointment.status === APPOINTMENT_STATUSES.COMPLETED) acc.completedAppointments += 1;
      if (appointment.status === APPOINTMENT_STATUSES.CANCELLED) acc.cancelledAppointments += 1;
      return acc;
    },
    {
      totalPatients: db.users.filter((item) => item.role === "patient").length,
      totalAppointments: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0
    }
  );

  const recentBookings = db.appointments
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)
    .map((appointment) => {
      const patient = db.patientProfiles.find((profile) => profile.id === appointment.patientId);
      const user = db.users.find((item) => item.id === patient?.userId);

      return {
        ...appointment,
        patientName: user?.fullName || "Unknown"
      };
    });

  return {
    success: true,
    data: {
      ...counts,
      recentBookings
    }
  };
}

export async function adminPatientsMock() {
  await simulateLatency(130);
  const db = loadDb();

  const patients = db.users
    .filter((item) => item.role === "patient")
    .map((user) => {
      const profile = db.patientProfiles.find((item) => item.userId === user.id) || {};
      const appointmentCount = db.appointments.filter((item) => {
        const patient = db.patientProfiles.find((profileItem) => profileItem.id === item.patientId);
        return patient?.userId === user.id;
      }).length;

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isBlocked: user.isBlocked,
        isActive: user.isActive,
        appointmentCount,
        profile
      };
    });

  return {
    success: true,
    data: patients
  };
}

export async function adminPatientByIdMock(id) {
  await simulateLatency(110);
  const db = loadDb();
  const user = db.users.find((item) => item.id === id && item.role === "patient");

  if (!user) {
    return {
      success: false,
      message: "Patient not found"
    };
  }

  const profile = db.patientProfiles.find((item) => item.userId === id) || {};

  return {
    success: true,
    data: {
      ...user,
      profile
    }
  };
}

export async function blockPatientMock(id, isBlocked) {
  await simulateLatency();
  const db = loadDb();

  const user = db.users.find((item) => item.id === id && item.role === "patient");

  if (!user) {
    return {
      success: false,
      message: "Patient not found"
    };
  }

  user.isBlocked = isBlocked;
  saveDb(db);

  return {
    success: true,
    message: isBlocked ? "Patient blocked" : "Patient unblocked",
    data: {
      id: user.id,
      isBlocked: user.isBlocked
    }
  };
}
