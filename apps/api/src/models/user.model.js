import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "patient", "doctor"],
        message: "Role must be 'admin', 'patient', or 'doctor'"
      },
      required: [true, "Role is required"],
      default: "patient"
    },
    phone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String,
      select: false,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model("User", userSchema);

export default User;
