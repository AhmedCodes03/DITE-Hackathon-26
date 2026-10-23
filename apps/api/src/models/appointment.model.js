import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: [true, "Patient ID is required"]
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      default: null // null = legacy single-doctor system
    },
    appointmentDate: {
      type: String,
      required: [true, "Appointment date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Appointment date must be in YYYY-MM-DD format"]
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^\d{2}:\d{2}$/, "Start time must be in HH:mm format"]
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^\d{2}:\d{2}$/, "End time must be in HH:mm format"]
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "completed", "no_show"],
        message: "Status must be a valid value"
      },
      default: "pending"
    },
    reason: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    cancelledBy: {
      type: String,
      enum: ["patient", "admin", "doctor", null],
      default: null
    },
    cancellationReason: {
      type: String,
      trim: true
    },
    rescheduledFromAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now
    },
    patientApprovalReadAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ patientId: 1, status: 1, statusUpdatedAt: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1, startTime: 1 });

// Unique slot per doctor (or global if doctorId is null)
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ["cancelled"] }
    },
    name: "unique_active_slot_per_doctor"
  }
);

appointmentSchema.pre("save", function onSave(next) {
  if (this.isModified("status")) {
    this.statusUpdatedAt = new Date();

    if (this.status === "confirmed") {
      this.patientApprovalReadAt = null;
    }
  }

  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
