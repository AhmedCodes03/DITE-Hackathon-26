import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null // null = legacy single-doctor profile
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved"
    },
    doctorName: {
      type: String,
      default: "Dr. Adnan Khan"
    },
    specialty: {
      type: String,
      default: "General Practitioner"
    },
    title: {
      type: String
    },
    bio: {
      type: String
    },
    introText: {
      type: String
    },
    aboutText: {
      type: String
    },
    experienceYears: {
      type: Number
    },
    qualifications: [
      {
        type: String
      }
    ],
    clinicName: {
      type: String
    },
    clinicAddress: {
      type: String
    },
    contactPhone: {
      type: String
    },
    contactEmail: {
      type: String
    },
    heroHeadline: {
      type: String
    },
    heroSubtext: {
      type: String
    },
    photoUrl: {
      type: String,
      default: null
    },
    bookingEnabled: {
      type: Boolean,
      default: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

doctorProfileSchema.index({ userId: 1 }, { sparse: true });
doctorProfileSchema.index({ status: 1, isAvailable: 1 });

const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);

export default DoctorProfile;
