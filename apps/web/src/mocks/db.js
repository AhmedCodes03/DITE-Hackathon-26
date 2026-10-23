import { STORAGE_KEYS, USER_ROLES, APPOINTMENT_STATUSES } from "../utils/constants";

const DEFAULT_DB = {
  users: [
    {
      id: "u_admin_1",
      fullName: "System Admin",
      email: "admin@example.com",
      password: "AdminPass123",
      role: USER_ROLES.ADMIN,
      phone: "03000000000",
      isActive: true,
      isBlocked: false
    },
    {
      id: "u_patient_1",
      fullName: "Ali Khan",
      email: "ali@example.com",
      password: "PatientPass123",
      role: USER_ROLES.PATIENT,
      phone: "03001234567",
      isActive: true,
      isBlocked: false
    }
  ],
  patientProfiles: [
    {
      id: "p_1",
      userId: "u_patient_1",
      age: 28,
      gender: "male",
      address: "Lahore",
      emergencyContactName: "Ayesha Khan",
      emergencyContactPhone: "03001230000",
      medicalNotes: ""
    }
  ],
  doctorProfile: {
    id: "d_1",
    doctorName: "Dr. Adnan Khan",
    specialty: "Consultant Radiologist",
    heroHeadline: "Precision in Radiology. Confidence in Care.",
    heroSubtext: "Book your consultation with Dr. Adnan Khan.",
    bio: "Experienced consultant radiologist specializing in high-resolution diagnostic imaging and patient care.",
    aboutText:
      "Dr. Adnan Khan provides comprehensive radiology consultation and imaging-focused guidance with a patient-centered approach.",
    experienceYears: 10,
    qualifications: ["MBBS", "FCPS (Radiology)"],
    clinicName: "Advanced Radiology & Diagnostic Center",
    clinicAddress: "Gulberg III, Lahore, Pakistan",
    contactPhone: "+92 300 1234567",
    contactEmail: "contact@adnanradiology.com",
    bookingEnabled: true
  },
  availability: [
    {
      id: "a_1",
      dayOfWeek: "monday",
      startTime: "09:00",
      endTime: "13:00",
      slotDurationMinutes: 30,
      breakStartTime: "11:00",
      breakEndTime: "11:30",
      isActive: true
    },
    {
      id: "a_2",
      dayOfWeek: "wednesday",
      startTime: "15:00",
      endTime: "19:00",
      slotDurationMinutes: 30,
      isActive: true
    }
  ],
  appointments: [
    {
      id: "ap_1",
      patientId: "p_1",
      appointmentDate: "2026-04-10",
      startTime: "10:00",
      endTime: "10:30",
      status: APPOINTMENT_STATUSES.CONFIRMED,
      reason: "Radiology consultation",
      notes: "Need report review",
      createdAt: "2026-03-12T10:00:00.000Z",
      updatedAt: "2026-03-12T10:00:00.000Z"
    }
  ]
};

function isBrowser() {
  return typeof window !== "undefined";
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export function loadDb() {
  if (!isBrowser()) {
    return clone(DEFAULT_DB);
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.MOCK_DB);
  if (!raw) {
    const seeded = clone(DEFAULT_DB);
    window.localStorage.setItem(STORAGE_KEYS.MOCK_DB, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const seeded = clone(DEFAULT_DB);
    window.localStorage.setItem(STORAGE_KEYS.MOCK_DB, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveDb(db) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEYS.MOCK_DB, JSON.stringify(db));
}

export function updateDb(updater) {
  const current = loadDb();
  const next = updater(clone(current));
  saveDb(next);
  return next;
}

export function resetDb() {
  saveDb(clone(DEFAULT_DB));
  return loadDb();
}
