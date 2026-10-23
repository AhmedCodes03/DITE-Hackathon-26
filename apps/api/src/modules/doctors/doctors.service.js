import mongoose from "mongoose";
import User from "../../models/user.model.js";
import DoctorProfile from "../../models/doctorProfile.model.js";
import Availability from "../../models/availability.model.js";
import Appointment from "../../models/appointment.model.js";
import { ApiError } from "../../utils/ApiError.js";

const PKT_OFFSET_MINUTES = 5 * 60;

function getNowInOffset(offsetMinutes) {
  return new Date(Date.now() + offsetMinutes * 60 * 1000);
}

function getCurrentDateInPkt() {
  const date = getNowInOffset(PKT_OFFSET_MINUTES);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCurrentMinutesInPkt() {
  const now = getNowInOffset(PKT_OFFSET_MINUTES);
  return now.getUTCHours() * 60 + now.getUTCMinutes();
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function generateSlots(startTime, endTime, durationMinutes, breakStart, breakEnd) {
  const slots = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;

  const bStart = breakStart ? toMinutes(breakStart) : null;
  const bEnd = breakEnd ? toMinutes(breakEnd) : null;

  while (cur + durationMinutes <= end) {
    const slotEnd = cur + durationMinutes;
    if (bStart !== null && bEnd !== null && cur < bEnd && slotEnd > bStart) {
      cur = bEnd;
      continue;
    }
    const pad = (n) => String(Math.floor(n)).padStart(2, "0");
    slots.push({
      startTime: `${pad(cur / 60)}:${pad(cur % 60)}`,
      endTime: `${pad(slotEnd / 60)}:${pad(slotEnd % 60)}`
    });
    cur += durationMinutes;
  }
  return slots;
}

const DEFAULT_VERIFIED_DOCTORS = [
  {
    doctorName: "Dr. Adnan Khan",
    specialty: "Consultant Radiologist",
    title: "Consultant Radiologist & Diagnostic Imaging Specialist",
    bio: "Expert in high-resolution diagnostic imaging, MRI, CT scanning, ultrasound, and digital X-rays with 12+ years of clinical experience.",
    introText: "Dr. Adnan Khan is a dedicated consultant radiologist providing compassionate, accurate diagnostic imaging care.",
    aboutText: "With over 12 years in clinical radiology, Dr. Adnan Khan provides comprehensive consultation across ultrasound, MRI, CT scanning, and digital X-ray interpretation.",
    experienceYears: 12,
    qualifications: ["MBBS", "FCPS (Radiology)", "Fellowship in Diagnostic Imaging"],
    clinicName: "Advanced Radiology & Diagnostic Center",
    clinicAddress: "Gulberg III, Lahore, Pakistan",
    contactPhone: "+92 300 1234567",
    contactEmail: "adnan@clinic.com",
    consultationFee: 3000,
    consultationDurationMinutes: 30,
    status: "approved",
    bookingEnabled: true,
    isAvailable: true,
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    availability: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30 },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30 },
      { dayOfWeek: "wednesday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 30 },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30 },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30 },
      { dayOfWeek: "saturday", startTime: "10:00", endTime: "14:00", slotDurationMinutes: 30 }
    ]
  },
  {
    doctorName: "Dr. Sara Ahmed",
    specialty: "Cardiologist",
    title: "Senior Consultant Cardiologist",
    bio: "Specialist in preventive cardiology, echocardiography, hypertension, and heart disease management with 10 years of experience.",
    introText: "Dr. Sara Ahmed is a compassionate cardiologist focused on cardiovascular wellness and early diagnosis.",
    aboutText: "Dr. Sara Ahmed brings 10 years of clinical expertise in cardiovascular medicine. She specializes in preventive cardiology, ECG and echo interpretation, and personalized cardiac rehabilitation.",
    experienceYears: 10,
    qualifications: ["MBBS", "MRCP (UK)", "Fellowship in Cardiology"],
    clinicName: "Heart Care Clinic",
    clinicAddress: "DHA Phase 5, Karachi, Pakistan",
    contactPhone: "+92 321 9876543",
    contactEmail: "sara@clinic.com",
    consultationFee: 2500,
    consultationDurationMinutes: 20,
    status: "approved",
    bookingEnabled: true,
    isAvailable: true,
    photoUrl: "https://images.unsplash.com/photo-1594824813589-9a7065e94b29?auto=format&fit=crop&w=600&q=80",
    availability: [
      { dayOfWeek: "monday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 20 },
      { dayOfWeek: "tuesday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 20 },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 20 },
      { dayOfWeek: "thursday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 20 },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 20 },
      { dayOfWeek: "saturday", startTime: "14:00", endTime: "17:00", slotDurationMinutes: 20 }
    ]
  },
  {
    doctorName: "Dr. Zain Malik",
    specialty: "General Physician",
    title: "General Physician & Family Medicine Specialist",
    bio: "Experienced general physician specializing in family healthcare, chronic illness management, and preventive screening.",
    introText: "Dr. Zain Malik provides comprehensive medical care for patients of all age groups.",
    aboutText: "Dr. Zain Malik has 8 years of experience in family medicine and clinical health care. He manages routine illnesses, chronic conditions like diabetes and hypertension, and preventive checkups.",
    experienceYears: 8,
    qualifications: ["MBBS", "MRCGP", "Diploma in Family Medicine"],
    clinicName: "Family Health Center",
    clinicAddress: "F-10 Markaz, Islamabad, Pakistan",
    contactPhone: "+92 333 5551234",
    contactEmail: "zain@clinic.com",
    consultationFee: 1500,
    consultationDurationMinutes: 15,
    status: "approved",
    bookingEnabled: true,
    isAvailable: true,
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
    availability: [
      { dayOfWeek: "monday", startTime: "08:00", endTime: "12:00", slotDurationMinutes: 15 },
      { dayOfWeek: "tuesday", startTime: "08:00", endTime: "12:00", slotDurationMinutes: 15 },
      { dayOfWeek: "wednesday", startTime: "08:00", endTime: "12:00", slotDurationMinutes: 15 },
      { dayOfWeek: "thursday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 15 },
      { dayOfWeek: "friday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 15 },
      { dayOfWeek: "saturday", startTime: "10:00", endTime: "14:00", slotDurationMinutes: 15 }
    ]
  },
  {
    doctorName: "Dr. Nadia Hussain",
    specialty: "Dermatologist",
    title: "Consultant Dermatologist & Skin Specialist",
    bio: "Dedicated dermatologist specializing in skin disorders, clinical dermatology, acne therapies, and aesthetic skin care.",
    introText: "Dr. Nadia Hussain provides patient-focused dermatology and skin wellness consultations.",
    aboutText: "Dr. Nadia Hussain brings 7 years of specialized expertise in medical and cosmetic dermatology. She provides evidence-based diagnosis and treatment for eczema, acne, psoriasis, and skin concerns.",
    experienceYears: 7,
    qualifications: ["MBBS", "MCPS (Dermatology)", "Diploma in Aesthetic Medicine"],
    clinicName: "Glow Skin & Laser Clinic",
    clinicAddress: "Johar Town, Lahore, Pakistan",
    contactPhone: "+92 345 7778888",
    contactEmail: "nadia@clinic.com",
    consultationFee: 2200,
    consultationDurationMinutes: 20,
    status: "approved",
    bookingEnabled: true,
    isAvailable: true,
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    availability: [
      { dayOfWeek: "monday", startTime: "11:00", endTime: "15:00", slotDurationMinutes: 20 },
      { dayOfWeek: "tuesday", startTime: "11:00", endTime: "15:00", slotDurationMinutes: 20 },
      { dayOfWeek: "wednesday", startTime: "11:00", endTime: "15:00", slotDurationMinutes: 20 },
      { dayOfWeek: "thursday", startTime: "11:00", endTime: "15:00", slotDurationMinutes: 20 },
      { dayOfWeek: "friday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 20 },
      { dayOfWeek: "saturday", startTime: "11:00", endTime: "15:00", slotDurationMinutes: 20 }
    ]
  },
  {
    doctorName: "Dr. Tariq Mahmood",
    specialty: "Orthopedic Surgeon",
    title: "Senior Consultant Orthopedic Surgeon",
    bio: "Specializing in joint disorders, sports injuries, fracture management, and musculoskeletal health with 14 years of experience.",
    introText: "Dr. Tariq Mahmood is an established orthopedic specialist dedicated to mobility and joint health.",
    aboutText: "With 14 years of surgical and clinical practice, Dr. Tariq Mahmood provides advanced care for arthritis, ligament injuries, back pain, and joint health.",
    experienceYears: 14,
    qualifications: ["MBBS", "MS (Orthopedics)", "AO Trauma Fellowship"],
    clinicName: "Bone & Joint Care Center",
    clinicAddress: "Blue Area, Islamabad, Pakistan",
    contactPhone: "+92 301 4443322",
    contactEmail: "tariq@clinic.com",
    consultationFee: 3000,
    consultationDurationMinutes: 30,
    status: "approved",
    bookingEnabled: true,
    isAvailable: true,
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
    availability: [
      { dayOfWeek: "monday", startTime: "10:00", endTime: "14:00", slotDurationMinutes: 30 },
      { dayOfWeek: "wednesday", startTime: "10:00", endTime: "14:00", slotDurationMinutes: 30 },
      { dayOfWeek: "friday", startTime: "10:00", endTime: "14:00", slotDurationMinutes: 30 },
      { dayOfWeek: "saturday", startTime: "10:00", endTime: "13:00", slotDurationMinutes: 30 }
    ]
  }
];

export async function ensureInitialDoctors() {
  for (const doc of DEFAULT_VERIFIED_DOCTORS) {
    try {
      const email = doc.contactEmail ? doc.contactEmail.toLowerCase() : "";
      let user = null;
      if (email) {
        user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            fullName: doc.doctorName,
            email,
            passwordHash: "Doctor123", // automatically hashed by userSchema pre-save
            phone: doc.contactPhone || "+92 300 0000000",
            role: "doctor",
            isActive: true,
            isBlocked: false
          });
        } else if (user.role !== "doctor") {
          await User.updateOne({ _id: user._id }, { $set: { role: "doctor", isBlocked: false, isActive: true } });
        }
      }

      const existing = await DoctorProfile.findOne({
        $or: [
          { doctorName: doc.doctorName },
          ...(email ? [{ contactEmail: email }] : []),
          ...(user ? [{ userId: user._id }] : [])
        ]
      });

      let docProfileId = existing?._id;

      if (!existing) {
        const { availability, ...profileData } = doc;
        const created = await DoctorProfile.create({
          ...profileData,
          userId: user?._id || null,
          contactEmail: email,
          status: doc.status || "approved",
          bookingEnabled: true,
          isAvailable: true
        });
        docProfileId = created._id;
      } else {
        await DoctorProfile.updateOne(
          { _id: existing._id },
          {
            $set: {
              userId: existing.userId || user?._id || null,
              status: existing.status || doc.status || "approved",
              isAvailable: true,
              bookingEnabled: true,
              consultationFee: existing.consultationFee || doc.consultationFee,
              specialty: existing.specialty || doc.specialty,
              clinicName: existing.clinicName || doc.clinicName,
              clinicAddress: existing.clinicAddress || doc.clinicAddress,
              photoUrl: existing.photoUrl || doc.photoUrl,
              contactEmail: email,
              contactPhone: doc.contactPhone
            }
          }
        );
      }

      if (doc.availability && docProfileId) {
        for (const slot of doc.availability) {
          const hasSlot = await Availability.findOne({ doctorId: docProfileId, dayOfWeek: slot.dayOfWeek });
          if (!hasSlot) {
            try {
              await Availability.create({ ...slot, doctorId: docProfileId });
            } catch {}
          }
        }
      }
    } catch (err) {
      console.warn("Failed ensuring doctor profile:", doc.doctorName, err.message);
    }
  }
}

/**
 * Get all approved + available doctors (public listing)
 */
export async function listDoctors({ search, specialty } = {}) {
  await ensureInitialDoctors().catch(() => {});

  const query = { status: "approved", isAvailable: true };
  if (specialty) query.specialty = { $regex: specialty, $options: "i" };
  if (search) query.$or = [
    { doctorName: { $regex: search, $options: "i" } },
    { specialty: { $regex: search, $options: "i" } },
    { clinicName: { $regex: search, $options: "i" } }
  ];

  const doctors = await DoctorProfile.find(query)
    .populate("userId", "fullName email isActive isBlocked")
    .sort({ createdAt: 1 })
    .lean();

  return doctors.filter((d) => !d.userId || (d.userId.isActive !== false && !d.userId.isBlocked));
}

/**
 * Get single doctor by profile id
 */
export async function getDoctorById(doctorId) {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError("Invalid doctor ID", 400);
  }

  const doctor = await DoctorProfile.findOne({
    _id: doctorId,
    status: "approved",
    isAvailable: true
  }).populate("userId", "fullName email isActive isBlocked").lean();

  if (!doctor) throw new ApiError("Doctor not found", 404);
  if (doctor.userId && (doctor.userId.isActive === false || doctor.userId.isBlocked)) {
    throw new ApiError("Doctor is not currently available", 404);
  }
  return doctor;
}

/**
 * Get doctor's availability schedule
 */
export async function getDoctorAvailability(doctorId) {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError("Invalid doctor ID", 400);
  }
  return Availability.find({ doctorId, isActive: true }).sort({ dayOfWeek: 1 }).lean();
}

/**
 * Get available slots for a doctor on a given date
 */
export async function getDoctorSlots(doctorId, dateString) {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError("Invalid doctor ID", 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new ApiError("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const todayInPkt = getCurrentDateInPkt();
  if (dateString < todayInPkt) {
    throw new ApiError("Cannot fetch slots for a past date", 400);
  }

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const requestedDate = new Date(`${dateString}T12:00:00.000Z`);
  const dayOfWeek = dayNames[requestedDate.getUTCDay()];

  const availability = await Availability.findOne({
    doctorId,
    dayOfWeek,
    isActive: true
  });

  if (!availability) {
    return { date: dateString, dayOfWeek, timezone: "UTC+05:00", slots: [] };
  }

  const allSlots = generateSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDurationMinutes,
    availability.breakStartTime,
    availability.breakEndTime
  );

  const booked = await Appointment.find({
    doctorId,
    appointmentDate: dateString,
    status: { $nin: ["cancelled"] }
  }).select("startTime").lean();

  const bookedSet = new Set(booked.map((a) => a.startTime));
  let available = allSlots.filter((s) => !bookedSet.has(s.startTime));

  if (dateString === todayInPkt) {
    const curMin = getCurrentMinutesInPkt();
    available = available.filter((s) => toMinutes(s.startTime) > curMin);
  }

  return { date: dateString, dayOfWeek, timezone: "UTC+05:00", slots: available };
}
