import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import DoctorProfile from "../models/doctorProfile.model.js";

dotenv.config();

const adminData = {
  fullName: "System Admin",
  email: "admin@example.com",
  passwordHash: "AdminPass123",
  role: "admin",
  phone: "03001234567"
};

const doctorProfileData = {
  doctorName: "Dr. Adnan Khan",
  specialty: "Consultant Radiologist",
  title: "Consultant Radiologist",
  bio: "Experienced consultant radiologist specializing in high-resolution diagnostic imaging, ultrasound, MRI, and patient-centered diagnostic insights.",
  introText:
    "Dr. Adnan Khan is a dedicated consultant radiologist committed to providing precise diagnostic imaging services with a focus on patient comfort, clarity, and rapid diagnosis.",
  aboutText:
    "With over 10 years of experience in clinical radiology, Dr. Adnan Khan provides comprehensive consultation across ultrasound, MRI, CT scanning, and digital X-ray interpretation. His patient-centered approach ensures that every individual receives clear explanations, compassionate guidance, and accurate diagnostic results.",
  experienceYears: 10,
  qualifications: ["MBBS", "FCPS (Radiology)"],
  clinicName: "Advanced Radiology & Diagnostic Center",
  clinicAddress: "Gulberg III, Lahore, Pakistan",
  contactPhone: "+92 300 1234567",
  contactEmail: "contact@adnanradiology.com",
  heroHeadline: "Precision in Radiology. Confidence in Care.",
  heroSubtext: "Book your consultation with Dr. Adnan Khan for expert diagnostic imaging and radiology care.",
  photoUrl: null,
  bookingEnabled: true
};

async function seedAdminAndDoctor() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/dr_xyz_appointments";
    
    const options = {
      serverSelectionTimeoutMS: 60000,
      connectTimeoutMS: 60000,
    };
    
    await mongoose.connect(uri, options);
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin user already exists:", adminData.email);
    } else {
      const admin = await User.create(adminData);
      console.log("Admin user created:", admin.email);
    }

    const existingDoctor = await DoctorProfile.findOne();
    if (existingDoctor) {
      console.log("Doctor profile already exists, updating...");
      await DoctorProfile.updateOne({}, doctorProfileData);
      console.log("Doctor profile updated");
    } else {
      await DoctorProfile.create(doctorProfileData);
      console.log("Doctor profile created");
    }

    console.log("Seed completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedAdminAndDoctor();
