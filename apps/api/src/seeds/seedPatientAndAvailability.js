import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import PatientProfile from "../models/patientProfile.model.js";
import Availability from "../models/availability.model.js";

dotenv.config();

const patientData = {
  user: {
    fullName: "Ali Khan",
    email: "ali@example.com",
    passwordHash: "PatientPass123",
    role: "patient",
    phone: "03019876543"
  },
  patientProfile: {
    gender: "male",
    age: 28,
    address: "Johar Town, Lahore"
  }
};

const availabilityData = [
  {
    dayOfWeek: "monday",
    startTime: "09:00",
    endTime: "13:00",
    slotDurationMinutes: 30,
    breakStartTime: "11:00",
    breakEndTime: "11:30",
    isActive: true
  },
  {
    dayOfWeek: "wednesday",
    startTime: "15:00",
    endTime: "19:00",
    slotDurationMinutes: 30,
    breakStartTime: "17:00",
    breakEndTime: "17:30",
    isActive: true
  },
  {
    dayOfWeek: "friday",
    startTime: "10:00",
    endTime: "14:00",
    slotDurationMinutes: 30,
    isActive: true
  }
];

async function seedPatientAndAvailability() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/dr_xyz_appointments");
    console.log("Connected to MongoDB");

    const existingPatient = await User.findOne({ email: patientData.user.email });
    if (existingPatient) {
      console.log("Patient user already exists:", patientData.user.email);
    } else {
      const user = await User.create(patientData.user);
      await PatientProfile.create({
        userId: user._id,
        ...patientData.patientProfile
      });
      console.log("Patient user created:", patientData.user.email);
    }

    for (const avail of availabilityData) {
      const existing = await Availability.findOne({ dayOfWeek: avail.dayOfWeek });
      if (existing) {
        console.log(`Availability for ${avail.dayOfWeek} already exists, skipping...`);
      } else {
        await Availability.create(avail);
        console.log(`Availability created for ${avail.dayOfWeek}`);
      }
    }

    console.log("Patient and Availability seed completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedPatientAndAvailability();
