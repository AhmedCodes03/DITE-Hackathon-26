import mongoose from "mongoose";
import PatientProfile from "../../models/patientProfile.model.js";
import User from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function getMyProfile(userId) {
  const patientProfile = await PatientProfile.findOne({
    userId: new mongoose.Types.ObjectId(userId)
  }).populate("userId", "fullName email phone role");

  if (!patientProfile) {
    throw new ApiError("Patient profile not found", 404);
  }

  return {
    id: patientProfile._id.toString(),
    fullName: patientProfile.userId.fullName,
    email: patientProfile.userId.email,
    phone: patientProfile.userId.phone,
    dateOfBirth: patientProfile.dateOfBirth,
    age: patientProfile.age,
    gender: patientProfile.gender,
    address: patientProfile.address,
    emergencyContactName: patientProfile.emergencyContactName,
    emergencyContactPhone: patientProfile.emergencyContactPhone,
    medicalNotes: patientProfile.medicalNotes,
    profileImage: patientProfile.profileImage || ""
  };
}

export async function updateMyProfile(userId, updates) {
  const patientProfile = await PatientProfile.findOne({
    userId: new mongoose.Types.ObjectId(userId)
  });

  if (!patientProfile) {
    throw new ApiError("Patient profile not found", 404);
  }

  const allowedFields = [
    "dateOfBirth",
    "age",
    "gender",
    "address",
    "emergencyContactName",
    "emergencyContactPhone",
    "medicalNotes"
  ];

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      patientProfile[key] = updates[key];
    }
  }

  if (updates.phone !== undefined) {
    await User.findByIdAndUpdate(userId, { phone: updates.phone });
  }

  if (updates.fullName !== undefined) {
    await User.findByIdAndUpdate(userId, { fullName: updates.fullName });
  }

  await patientProfile.save();

  return getMyProfile(userId);
}
