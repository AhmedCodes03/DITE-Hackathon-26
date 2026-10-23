import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true
    },
    dateOfBirth: {
      type: Date
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"]
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other", "prefer_not_to_say"],
        message: "Gender must be a valid value"
      }
    },
    address: {
      type: String,
      trim: true
    },
    emergencyContactName: {
      type: String,
      trim: true
    },
    emergencyContactPhone: {
      type: String,
      trim: true
    },
    medicalNotes: {
      type: String,
      trim: true
    },
    profileImage: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);



const PatientProfile = mongoose.model("PatientProfile", patientProfileSchema);

export default PatientProfile;
