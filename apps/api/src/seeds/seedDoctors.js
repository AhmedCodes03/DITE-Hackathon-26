/**
 * Seed script: Creates 3 approved doctors with availability and sample appointments.
 * Run: node apps/api/src/seeds/seedDoctors.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import DoctorProfile from "../models/doctorProfile.model.js";
import PatientProfile from "../models/patientProfile.model.js";
import Availability from "../models/availability.model.js";
import Appointment from "../models/appointment.model.js";

dotenv.config();

const DOCTORS = [
  {
    user: {
      fullName: "Dr. Adnan Khan",
      email: "adnan@clinic.com",
      password: "Doctor123",
      phone: "+92 300 1234567",
      role: "doctor"
    },
    profile: {
      doctorName: "Dr. Adnan Khan",
      specialty: "Consultant Radiologist",
      title: "Consultant Radiologist & Imaging Specialist",
      bio: "Expert in high-resolution diagnostic imaging, MRI, CT scanning, and ultrasound with 12+ years of clinical experience.",
      introText: "Dr. Adnan Khan is a dedicated consultant radiologist committed to precise, patient-centered diagnostic care.",
      aboutText: "With over 12 years in clinical radiology, Dr. Adnan Khan provides comprehensive imaging consultation including MRI, CT, ultrasound, and X-ray interpretation. His patient-centered approach ensures every patient receives clear, accurate results.",
      experienceYears: 12,
      qualifications: ["MBBS", "FCPS (Radiology)", "Fellowship in Diagnostic Imaging"],
      clinicName: "Advanced Radiology & Diagnostic Center",
      clinicAddress: "Gulberg III, Lahore, Pakistan",
      contactPhone: "+92 300 1234567",
      contactEmail: "adnan@clinic.com",
      heroHeadline: "Precision in Radiology. Confidence in Care.",
      heroSubtext: "Book your consultation with Dr. Adnan Khan for expert diagnostic imaging.",
      status: "approved",
      bookingEnabled: true,
      isAvailable: true
    },
    availability: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30, breakStartTime: "11:00", breakEndTime: "11:30" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30 },
      { dayOfWeek: "wednesday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 30 },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30 },
      { dayOfWeek: "saturday", startTime: "10:00", endTime: "14:00", slotDurationMinutes: 30 }
    ]
  },
  {
    user: {
      fullName: "Dr. Sara Ahmed",
      email: "sara@clinic.com",
      password: "Doctor123",
      phone: "+92 321 9876543",
      role: "doctor"
    },
    profile: {
      doctorName: "Dr. Sara Ahmed",
      specialty: "Cardiologist",
      title: "Senior Consultant Cardiologist",
      bio: "Specialist in preventive cardiology, echocardiography, and heart disease management with 10 years of experience.",
      introText: "Dr. Sara Ahmed is a compassionate cardiologist focused on heart health, early diagnosis, and patient wellness.",
      aboutText: "Dr. Sara Ahmed brings 10 years of expertise in cardiovascular medicine. She specializes in preventive cardiology, stress tests, echocardiography, and long-term heart disease management, helping patients achieve optimal cardiac health.",
      experienceYears: 10,
      qualifications: ["MBBS", "MRCP (UK)", "Fellowship in Cardiology"],
      clinicName: "Heart Care Clinic",
      clinicAddress: "DHA Phase 5, Karachi, Pakistan",
      contactPhone: "+92 321 9876543",
      contactEmail: "sara@clinic.com",
      heroHeadline: "Your Heart Health Is Our Priority.",
      heroSubtext: "Book a consultation with Dr. Sara Ahmed for expert cardiac care.",
      status: "approved",
      bookingEnabled: true,
      isAvailable: true
    },
    availability: [
      { dayOfWeek: "monday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 20 },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 20, breakStartTime: "11:00", breakEndTime: "11:30" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "13:00", slotDurationMinutes: 20 },
      { dayOfWeek: "saturday", startTime: "14:00", endTime: "17:00", slotDurationMinutes: 20 }
    ]
  },
  {
    user: {
      fullName: "Dr. Zain Malik",
      email: "zain@clinic.com",
      password: "Doctor123",
      phone: "+92 333 5551234",
      role: "doctor"
    },
    profile: {
      doctorName: "Dr. Zain Malik",
      specialty: "General Physician",
      title: "General Physician & Family Medicine Specialist",
      bio: "Experienced general physician specializing in family medicine, preventive care, chronic disease management, and minor procedures.",
      introText: "Dr. Zain Malik provides compassionate, comprehensive care for patients of all ages.",
      aboutText: "Dr. Zain Malik has 8 years of experience in family medicine and general health care. He manages a wide spectrum of conditions from common illnesses to chronic disease, emphasizing preventive care and patient education for long-term wellness.",
      experienceYears: 8,
      qualifications: ["MBBS", "MRCGP", "Diploma in Family Medicine"],
      clinicName: "Family Health Center",
      clinicAddress: "F-10, Islamabad, Pakistan",
      contactPhone: "+92 333 5551234",
      contactEmail: "zain@clinic.com",
      heroHeadline: "Comprehensive Care for Every Stage of Life.",
      heroSubtext: "Book your appointment with Dr. Zain Malik for trusted family medicine.",
      status: "approved",
      bookingEnabled: true,
      isAvailable: true
    },
    availability: [
      { dayOfWeek: "monday", startTime: "08:00", endTime: "12:00", slotDurationMinutes: 15 },
      { dayOfWeek: "tuesday", startTime: "08:00", endTime: "12:00", slotDurationMinutes: 15 },
      { dayOfWeek: "thursday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 15 },
      { dayOfWeek: "friday", startTime: "14:00", endTime: "18:00", slotDurationMinutes: 15 },
      { dayOfWeek: "sunday", startTime: "10:00", endTime: "14:00", slotDurationMinutes: 15 }
    ]
  },
  {
    user: {
      fullName: "Dr. Nadia Hussain",
      email: "nadia@clinic.com",
      password: "Doctor123",
      phone: "+92 345 7778888",
      role: "doctor"
    },
    profile: {
      doctorName: "Dr. Nadia Hussain",
      specialty: "Dermatologist",
      title: "Consultant Dermatologist & Skin Specialist",
      bio: "Specializes in skin diseases, cosmetic dermatology, acne management, and skin cancer screening with 7 years of experience.",
      introText: "Dr. Nadia Hussain is passionate about skin health and confident, glowing skin for all patients.",
      aboutText: "Dr. Nadia Hussain has 7 years of clinical experience in medical and cosmetic dermatology, helping patients achieve healthier skin through evidence-based treatments for acne, eczema, psoriasis, and other conditions.",
      experienceYears: 7,
      qualifications: ["MBBS", "MCPS (Dermatology)", "Diploma in Cosmetic Dermatology"],
      clinicName: "Glow Skin Clinic",
      clinicAddress: "Johar Town, Lahore, Pakistan",
      contactPhone: "+92 345 7778888",
      contactEmail: "nadia@clinic.com",
      heroHeadline: "Healthy Skin. Confident You.",
      heroSubtext: "Book a consultation with Dr. Nadia Hussain for expert dermatology care.",
      status: "pending",
      bookingEnabled: false,
      isAvailable: false
    },
    availability: []
  }
];

async function seedDoctors() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/dr_xyz_appointments";
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000, connectTimeoutMS: 30000 });
    console.log("Connected to MongoDB");

    for (const doc of DOCTORS) {
      const existingUser = await User.findOne({ email: doc.user.email });

      let user = existingUser;
      if (existingUser) {
        console.log(`Doctor user already exists: ${doc.user.email} — skipping user creation`);
      } else {
        const passwordHash = await bcrypt.hash(doc.user.password, 12);
        user = await User.create({ ...doc.user, passwordHash });
        console.log(`Created user: ${user.email}`);
      }

      const existingProfile = await DoctorProfile.findOne({ userId: user._id });
      if (existingProfile) {
        await DoctorProfile.updateOne({ userId: user._id }, { $set: doc.profile });
        console.log(`Updated doctor profile: ${doc.profile.doctorName}`);
      } else {
        await DoctorProfile.create({ ...doc.profile, userId: user._id });
        console.log(`Created doctor profile: ${doc.profile.doctorName}`);
      }

      const doctorProfile = await DoctorProfile.findOne({ userId: user._id });

      // Seed availability
      if (doc.availability.length > 0) {
        for (const avail of doc.availability) {
          const existing = await Availability.findOne({ doctorId: doctorProfile._id, dayOfWeek: avail.dayOfWeek });
          if (!existing) {
            await Availability.create({ ...avail, doctorId: doctorProfile._id });
            console.log(`  Added ${avail.dayOfWeek} availability for ${doc.profile.doctorName}`);
          }
        }
      }
    }

    // ── Seed 2 patient accounts with appointments ──────────────────────────

    const patients = [
      { fullName: "Ali Raza", email: "ali@patient.com", password: "Patient123", phone: "+92 311 1112233" },
      { fullName: "Fatima Zahra", email: "fatima@patient.com", password: "Patient123", phone: "+92 311 4445566" }
    ];

    for (const p of patients) {
      const existingPatient = await User.findOne({ email: p.email });
      if (!existingPatient) {
        const passwordHash = await bcrypt.hash(p.password, 12);
        const patientUser = await User.create({ ...p, passwordHash, role: "patient" });
        await PatientProfile.create({ userId: patientUser._id });
        console.log(`Created patient: ${p.email}`);
      } else {
        console.log(`Patient already exists: ${p.email}`);
      }
    }

    // ── Seed sample appointments ──────────────────────────────────────────

    const adnanProfile = await DoctorProfile.findOne({ "contactEmail": "adnan@clinic.com" });
    const saraProfile = await DoctorProfile.findOne({ "contactEmail": "sara@clinic.com" });
    const aliUser = await User.findOne({ email: "ali@patient.com" });
    const fatimaUser = await User.findOne({ email: "fatima@patient.com" });

    if (adnanProfile && aliUser) {
      const aliPatient = await PatientProfile.findOne({ userId: aliUser._id });
      if (aliPatient) {
        const existingApt = await Appointment.findOne({ patientId: aliPatient._id, doctorId: adnanProfile._id });
        if (!existingApt) {
          // Use a future date (next Monday)
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const dateStr = nextWeek.toISOString().slice(0, 10);
          await Appointment.create({
            patientId: aliPatient._id,
            doctorId: adnanProfile._id,
            appointmentDate: dateStr,
            startTime: "09:00",
            endTime: "09:30",
            status: "confirmed",
            reason: "Chest X-ray interpretation and follow-up",
            notes: "Patient has prior imaging from referring hospital"
          });
          console.log(`Created sample appointment: Ali with Dr. Adnan`);
        }
      }
    }

    if (saraProfile && fatimaUser) {
      const fatimaPatient = await PatientProfile.findOne({ userId: fatimaUser._id });
      if (fatimaPatient) {
        const existingApt = await Appointment.findOne({ patientId: fatimaPatient._id, doctorId: saraProfile._id });
        if (!existingApt) {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 5);
          const dateStr = nextWeek.toISOString().slice(0, 10);
          await Appointment.create({
            patientId: fatimaPatient._id,
            doctorId: saraProfile._id,
            appointmentDate: dateStr,
            startTime: "14:00",
            endTime: "14:20",
            status: "pending",
            reason: "Routine cardiac checkup and ECG review"
          });
          console.log(`Created sample appointment: Fatima with Dr. Sara`);
        }
      }
    }

    console.log("\n✅ Doctor seeding complete!");
    console.log("\nDoctor Login Credentials:");
    console.log("  Dr. Adnan Khan  → adnan@clinic.com  / Doctor123  (approved)");
    console.log("  Dr. Sara Ahmed  → sara@clinic.com   / Doctor123  (approved)");
    console.log("  Dr. Zain Malik  → zain@clinic.com   / Doctor123  (approved)");
    console.log("  Dr. Nadia Hussain → nadia@clinic.com / Doctor123  (pending approval)");
    console.log("\nPatient Login Credentials:");
    console.log("  Ali Raza        → ali@patient.com   / Patient123");
    console.log("  Fatima Zahra    → fatima@patient.com / Patient123");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedDoctors();
