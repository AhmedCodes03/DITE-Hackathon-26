import mongoose from "mongoose";
import User from "../../models/user.model.js";
import PatientProfile from "../../models/patientProfile.model.js";
import DoctorProfile from "../../models/doctorProfile.model.js";
import Appointment from "../../models/appointment.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ensureInitialDoctors } from "../doctors/doctors.service.js";

export async function getDashboardTrends(range = 7) {
  const days = range === 30 ? 30 : 7;
  const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
  const now = new Date(Date.now() + PKT_OFFSET_MS);

  const appointments = await Appointment.find({})
    .select("appointmentDate createdAt status")
    .lean();

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const targetDateStr = `${y}-${m}-${day}`;

    let count = 0;
    for (const apt of appointments) {
      let createdDateStr = null;
      if (apt.createdAt) {
        const cDate = new Date(new Date(apt.createdAt).getTime() + PKT_OFFSET_MS);
        const cy = cDate.getUTCFullYear();
        const cm = String(cDate.getUTCMonth() + 1).padStart(2, "0");
        const cd = String(cDate.getUTCDate()).padStart(2, "0");
        createdDateStr = `${cy}-${cm}-${cd}`;
      }

      const scheduledDateStr = apt.appointmentDate;

      if (createdDateStr === targetDateStr || scheduledDateStr === targetDateStr) {
        count++;
      }
    }

    const label = d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: days === 7 ? "short" : undefined,
      month: days === 30 ? "short" : undefined,
      day: "numeric"
    }).toUpperCase();

    result.push({ date: targetDateStr, label, count });
  }

  return result;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getDashboardStats() {
  const [totalPatients, totalAppointments, statusCounts] = await Promise.all([
    User.countDocuments({ role: "patient" }),
    Appointment.countDocuments(),
    Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const counts = statusCounts.reduce(
    (acc, item) => ({
      ...acc,
      [item._id]: item.count
    }),
    {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    }
  );

  return {
    totalPatients,
    totalAppointments,
    pendingAppointments: counts.pending,
    confirmedAppointments: counts.confirmed,
    completedAppointments: counts.completed,
    cancelledAppointments: counts.cancelled,
    noShowAppointments: counts.no_show
  };
}

export async function getAllPatients(options = {}) {
  const { page = 1, limit = 10, search } = options;

  const query = { role: "patient" };

  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { fullName: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } }
    ];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
    .select("fullName email phone isBlocked isActive createdAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
  ]);

  const userIds = users.map((user) => user._id);

  const profiles = await PatientProfile.find({ userId: { $in: userIds } })
    .select("userId")
    .lean();

  const profileIdByUserId = new Map(
    profiles.map((profile) => [profile.userId.toString(), profile._id.toString()])
  );

  const profileIds = profiles.map((profile) => profile._id);

  const appointmentCounts = await Appointment.aggregate([
    {
      $match: {
        patientId: { $in: profileIds }
      }
    },
    {
      $group: {
        _id: "$patientId",
        count: { $sum: 1 }
      }
    }
  ]);

  const appointmentCountByProfileId = new Map(
    appointmentCounts.map((row) => [row._id.toString(), row.count])
  );

  const patients = users.map((user) => {
    const profileId = profileIdByUserId.get(user._id.toString());
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isBlocked: user.isBlocked,
      isActive: user.isActive,
      appointmentCount: profileId ? appointmentCountByProfileId.get(profileId) || 0 : 0,
      createdAt: user.createdAt
    };
  });

  return {
    patients,
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

export async function getPatientById(patientId) {
  const user = await User.findOne({
    _id: new mongoose.Types.ObjectId(patientId),
    role: "patient"
  });

  if (!user) {
    throw new ApiError("Patient not found", 404);
  }

  const profile = await PatientProfile.findOne({ userId: user._id });

  const appointmentCount = await Appointment.countDocuments({
    patientId: profile?._id
  });

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    isBlocked: user.isBlocked,
    isActive: user.isActive,
    appointmentCount,
    profile: profile || null,
    createdAt: user.createdAt
  };
}

export async function blockPatient(patientId) {
  const user = await User.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(patientId), role: "patient" },
    { isBlocked: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError("Patient not found", 404);
  }

  return user;
}

export async function unblockPatient(patientId) {
  const user = await User.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(patientId), role: "patient" },
    { isBlocked: false },
    { new: true }
  );

  if (!user) {
    throw new ApiError("Patient not found", 404);
  }

  return user;
}

export async function getAdminAppointments(options = {}) {
  const { page = 1, limit = 10, status, date } = options;

  const query = {};
  if (status) {
    query.status = status;
  }
  if (date) {
    query.appointmentDate = date;
  }

  const total = await Appointment.countDocuments(query);

  const appointments = await Appointment.find(query)
    .populate("patientId")
    .sort({ appointmentDate: -1, startTime: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const formattedAppointments = await Promise.all(
    appointments.map(async (apt) => {
      let patientInfo = null;
      if (apt.patientId) {
        const user = await User.findById(apt.patientId.userId);
        if (user) {
          patientInfo = {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            phone: user.phone
          };
        }
      }

      return {
        id: apt._id.toString(),
        patientId: apt.patientId?._id.toString(),
        patient: patientInfo,
        appointmentDate: apt.appointmentDate,
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
        cancelledBy: apt.cancelledBy,
        cancellationReason: apt.cancellationReason,
        createdAt: apt.createdAt
      };
    })
  );

  return {
    appointments: formattedAppointments,
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

// ─── Doctor Management ───────────────────────────────────────────────────────

export async function getAllDoctors(options = {}) {
  const { page = 1, limit = 20, status, search } = options;

  await ensureInitialDoctors().catch(() => {});

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { doctorName: { $regex: search, $options: "i" } },
      { specialty: { $regex: search, $options: "i" } },
      { clinicName: { $regex: search, $options: "i" } }
    ];
  }

  const total = await DoctorProfile.countDocuments(query);

  const doctors = await DoctorProfile.find(query)
    .populate("userId", "fullName email phone isBlocked isActive createdAt")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  return { doctors, total, page: Number(page), limit: Number(limit) };
}

export async function getDoctorAdminById(doctorProfileId) {
  const doctor = await DoctorProfile.findById(doctorProfileId)
    .populate("userId", "fullName email phone isBlocked isActive createdAt")
    .lean();
  if (!doctor) throw new ApiError("Doctor not found", 404);
  return doctor;
}

export async function approveDoctor(doctorProfileId) {
  const doctor = await DoctorProfile.findByIdAndUpdate(
    doctorProfileId,
    { status: "approved", bookingEnabled: true, isAvailable: true },
    { new: true }
  ).populate("userId", "fullName email isBlocked isActive");
  if (!doctor) throw new ApiError("Doctor not found", 404);
  return doctor;
}

export async function rejectDoctor(doctorProfileId) {
  const doctor = await DoctorProfile.findByIdAndUpdate(
    doctorProfileId,
    { status: "rejected", bookingEnabled: false },
    { new: true }
  ).populate("userId", "fullName email isBlocked isActive");
  if (!doctor) throw new ApiError("Doctor not found", 404);
  return doctor;
}

export async function blockDoctor(doctorProfileId) {
  const doctor = await DoctorProfile.findById(doctorProfileId).populate("userId");
  if (!doctor) throw new ApiError("Doctor not found", 404);

  const userId = doctor.userId?._id || doctor.userId;
  if (userId) {
    await User.findByIdAndUpdate(userId, { isBlocked: true });
  }
  await DoctorProfile.findByIdAndUpdate(doctorProfileId, { bookingEnabled: false, isAvailable: false });

  return { doctorProfileId, isBlocked: true };
}

export async function unblockDoctor(doctorProfileId) {
  const doctor = await DoctorProfile.findById(doctorProfileId).populate("userId");
  if (!doctor) throw new ApiError("Doctor not found", 404);

  const userId = doctor.userId?._id || doctor.userId;
  if (userId) {
    await User.findByIdAndUpdate(userId, { isBlocked: false });
  }
  if (doctor.status === "approved") {
    await DoctorProfile.findByIdAndUpdate(doctorProfileId, { bookingEnabled: true, isAvailable: true });
  }

  return { doctorProfileId, isBlocked: false };
}

// ─── All Users Management ────────────────────────────────────────────────────

export async function getAllUsers(options = {}) {
  const { page = 1, limit = 20, role, search } = options;

  const query = { role: { $ne: "admin" } };
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select("fullName email phone role isBlocked isActive createdAt")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  return { users, total, page: Number(page), limit: Number(limit) };
}

export async function blockUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: true },
    { new: true }
  ).select("fullName email role isBlocked isActive");
  if (!user) throw new ApiError("User not found", 404);
  return user;
}

export async function unblockUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: false },
    { new: true }
  ).select("fullName email role isBlocked isActive");
  if (!user) throw new ApiError("User not found", 404);
  return user;
}
