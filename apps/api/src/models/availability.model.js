import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      default: null // null = legacy global availability
    },
    dayOfWeek: {
      type: String,
      required: [true, "Day of week is required"],
      enum: {
        values: [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday"
        ],
        message: "Day of week must be a valid value"
      }
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
    slotDurationMinutes: {
      type: Number,
      required: [true, "Slot duration is required"],
      min: [5, "Slot duration must be at least 5 minutes"],
      max: [240, "Slot duration cannot exceed 240 minutes"]
    },
    breakStartTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "Break start time must be in HH:mm format"]
    },
    breakEndTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "Break end time must be in HH:mm format"]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Unique day per doctor (doctorId can be null for global/legacy)
availabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

availabilitySchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    return next(new Error("End time must be after start time"));
  }

  if (this.breakStartTime && this.breakEndTime) {
    if (this.breakStartTime >= this.breakEndTime) {
      return next(new Error("Break end time must be after break start time"));
    }
    if (this.breakStartTime < this.startTime || this.breakEndTime > this.endTime) {
      return next(new Error("Break window must fall within work hours"));
    }
  }

  next();
});

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
