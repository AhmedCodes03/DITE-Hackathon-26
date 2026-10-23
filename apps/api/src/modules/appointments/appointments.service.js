import mongoose from "mongoose";
import Appointment from "../../models/appointment.model.js";
import PatientProfile from "../../models/patientProfile.model.js";
import DoctorProfile from "../../models/doctorProfile.model.js";
import * as availabilityService from "../availability/availability.service.js";
import * as doctorsService from "../doctors/doctors.service.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * @description Creates a new appointment for a patient after validating booking status, date, and slot availability.
 */
export async function bookAppointment(userId, bookingData) {
  const { appointmentDate, startTime, reason, notes, doctorId } = bookingData;

  // If doctorId provided, validate per-doctor; otherwise fall back to legacy global doctor
  let resolvedDoctorId = null;
  if (doctorId) {
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor || doctor.status !== "approved" || !doctor.bookingEnabled) {
      throw new ApiError("Doctor is not available for booking.", 422);
    }
    resolvedDoctorId = doctor._id;
  } else {
    // Legacy: use the single global doctor profile
    const doctorProfile = await DoctorProfile.findOne({ userId: null });
    if (!doctorProfile?.bookingEnabled) {
      throw new ApiError("Booking is currently disabled. Please try again later.", 422);
    }
    resolvedDoctorId = doctorProfile?._id || null;
  }

  const requestedDate = new Date(appointmentDate + "T00:00:00.000Z");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requestedDate < today) {
    throw new ApiError("Cannot book appointments for a past date", 422);
  }

  // Get slots for this doctor (or global if legacy)
  let slotsData;
  if (resolvedDoctorId) {
    slotsData = await doctorsService.getDoctorSlots(resolvedDoctorId.toString(), appointmentDate);
  } else {
    slotsData = await availabilityService.getAvailableSlots(appointmentDate);
  }

  const slot = slotsData.slots.find((s) => s.startTime === startTime);
  if (!slot) {
    throw new ApiError("Selected slot is not available", 422);
  }

  const patientProfile = await PatientProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (!patientProfile) {
    throw new ApiError("Patient profile not found", 404);
  }

  try {
    const appointment = await Appointment.create({
      patientId: patientProfile._id,
      doctorId: resolvedDoctorId,
      appointmentDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "pending",
      reason,
      notes
    });

    return {
      id: appointment._id.toString(),
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      doctorId: appointment.doctorId
    };
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      throw new ApiError("This slot has already been booked. Please select another.", 409);
    }
    throw error;
  }
}


/**
 * @description Lists paginated appointments for the authenticated patient, optionally filtered by status.
 * @param {string} userId - Authenticated patient user identifier.
 * @param {{ page?: number, limit?: number, status?: string }} [options={}] - Pagination and filter options.
 * @returns {Promise<{ appointments: Array<any>, total: number, page: number, limit: number }>} Paginated appointments result.
 */
export async function getMyAppointments(userId, options = {}) {
  const { page = 1, limit = 10, status } = options;

  const patientProfile = await PatientProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (!patientProfile) {
    return {
      appointments: [],
      total: 0,
      page: Number(page),
      limit: Number(limit)
    };
  }

  const query = { patientId: patientProfile._id };
  if (status) {
    query.status = status;
  }

  const total = await Appointment.countDocuments(query);

  const appointments = await Appointment.find(query)
    .populate("doctorId", "doctorName specialty clinicName consultationFee consultationDurationMinutes")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    appointments,
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

/**
 * @description Lists appointments for the authenticated doctor.
 */
export async function getDoctorAppointments(userId, options = {}) {
  const { page = 1, limit = 10, status, date } = options;

  const doctorProfile = await DoctorProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (!doctorProfile) {
    return {
      appointments: [],
      total: 0,
      page: Number(page),
      limit: Number(limit)
    };
  }

  const query = { doctorId: doctorProfile._id };
  if (status) query.status = status;
  if (date) query.appointmentDate = date;

  const total = await Appointment.countDocuments(query);

  const appointments = await Appointment.find(query)
    .populate({
      path: "patientId",
      populate: { path: "userId", select: "fullName email phone" }
    })
    .sort({ appointmentDate: 1, startTime: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    appointments,
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

/**
 * @description Fetches a single appointment and enforces ownership/admin access checks.
 * @param {string} appointmentId - Appointment identifier.
 * @param {string} userId - Authenticated user identifier.
 * @param {string} userRole - Authenticated user role.
 * @returns {Promise<any>} Appointment document with patient reference data.
 * @throws {ApiError} when the appointment is missing or the requester is not authorized.
 */
export async function getAppointmentById(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId)
    .populate("patientId")
    .populate("doctorId");

  if (!appointment) {
    throw new ApiError("Appointment not found", 404);
  }

  if (userRole === "admin") {
    return appointment;
  }

  if (userRole === "patient") {
    const patientProfile = await PatientProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!patientProfile || appointment.patientId?._id.toString() !== patientProfile._id.toString()) {
      throw new ApiError("You do not have permission to view this appointment", 403);
    }
    return appointment;
  }

  if (userRole === "doctor") {
    const doctorProfile = await DoctorProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!doctorProfile || appointment.doctorId?._id.toString() !== doctorProfile._id.toString()) {
      throw new ApiError("You do not have permission to view this appointment", 403);
    }
    return appointment;
  }

  return appointment;
}

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled", "completed", "no_show"]
};

/**
 * @description Cancels an appointment when cancellation rules and authorization constraints are satisfied.
 * @param {string} appointmentId - Appointment identifier.
 * @param {string} userId - Authenticated user identifier.
 * @param {string} userRole - Authenticated user role.
 * @param {string | undefined} reason - Optional cancellation reason.
 * @returns {Promise<any>} Updated appointment document.
 * @throws {ApiError} when the appointment is missing, unauthorized, already finalized, or invalid to cancel.
 */
export async function cancelAppointment(appointmentId, userId, userRole, reason) {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError("Appointment not found", 404);
  }

  if (userRole !== "admin" && appointment.patientId.toString() !== userId) {
    throw new ApiError("You can only cancel your own appointments", 403);
  }

  if (appointment.status === "completed") {
    throw new ApiError("Cannot cancel a completed appointment", 422);
  }

  if (appointment.status === "cancelled") {
    throw new ApiError("Appointment is already cancelled", 422);
  }

  const appointmentDate = new Date(appointment.appointmentDate + "T00:00:00.000Z");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (userRole === "patient" && appointmentDate < today) {
    throw new ApiError("Cannot cancel past appointments", 422);
  }

  appointment.status = "cancelled";
  appointment.cancelledBy = userRole;
  appointment.cancellationReason = reason || null;

  await appointment.save();

  return appointment;
}

/**
 * @description Reschedules an existing appointment by creating a replacement appointment and cancelling the original.
 * @param {string} appointmentId - Existing appointment identifier.
 * @param {string} userId - Authenticated user identifier.
 * @param {string} userRole - Authenticated user role.
 * @param {{ appointmentDate: string, startTime: string, reason?: string }} newData - New appointment scheduling payload.
 * @returns {Promise<any>} Newly created replacement appointment document.
 * @throws {ApiError} when authorization fails, status/date/slot is invalid, appointment is missing, or slot is already booked.
 */
export async function rescheduleAppointment(appointmentId, userId, userRole, newData) {
  const { appointmentDate, startTime, reason } = newData;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError("Appointment not found", 404);
  }

  if (userRole !== "admin" && appointment.patientId.toString() !== userId) {
    throw new ApiError("You can only reschedule your own appointments", 403);
  }

  if (!["pending", "confirmed"].includes(appointment.status)) {
    throw new ApiError("Only pending or confirmed appointments can be rescheduled", 422);
  }

  const requestedDate = new Date(appointmentDate + "T00:00:00.000Z");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requestedDate < today) {
    throw new ApiError("Cannot reschedule to a past date", 422);
  }

  const slotsData = await availabilityService.getAvailableSlots(appointmentDate);
  const slot = slotsData.slots.find((s) => s.startTime === startTime);

  if (!slot) {
    throw new ApiError("Selected slot is not available", 422);
  }

  try {
    const newAppointment = await Appointment.create({
      patientId: appointment.patientId,
      appointmentDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "pending",
      reason: reason || appointment.reason,
      rescheduledFromAppointmentId: appointment._id
    });

    appointment.status = "cancelled";
    appointment.cancelledBy = "patient";
    appointment.cancellationReason = "Rescheduled to new appointment";
    await appointment.save();

    return newAppointment;
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      throw new ApiError("This slot has already been booked. Please select another.", 409);
    }
    throw error;
  }
}

/**
 * @description Updates appointment status according to the configured transition rules.
 * @param {string} appointmentId - Appointment identifier.
 * @param {string} newStatus - Target status.
 * @param {string} userRole - Authenticated user role.
 * @returns {Promise<any>} Updated appointment document.
 * @throws {ApiError} when appointment is missing or transition is not allowed.
 */
export async function updateAppointmentStatus(appointmentId, newStatus, userRole) {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError("Appointment not found", 404);
  }

  const allowedForRole = ALLOWED_TRANSITIONS[appointment.status] || [];
  if (!allowedForRole.includes(newStatus)) {
    throw new ApiError(
      `Cannot change status from '${appointment.status}' to '${newStatus}'`,
      422
    );
  }

  appointment.status = newStatus;
  await appointment.save();

  return appointment;
}

/**
 * @description Marks the patient approval notification timestamp as read for a patient-owned appointment.
 * @param {string} appointmentId - Appointment identifier.
 * @param {string} userId - Authenticated patient user identifier.
 * @returns {Promise<any>} Updated appointment document.
 * @throws {ApiError} when patient profile or appointment cannot be found.
 */
export async function markApprovalAsRead(appointmentId, userId) {
  const patientProfile = await PatientProfile.findOne({
    userId: new mongoose.Types.ObjectId(userId)
  }).select("_id");

  if (!patientProfile) {
    throw new ApiError("Patient profile not found", 404);
  }

  const appointment = await Appointment.findOne({
    _id: new mongoose.Types.ObjectId(appointmentId),
    patientId: patientProfile._id
  });

  if (!appointment) {
    throw new ApiError("Appointment not found", 404);
  }

  appointment.patientApprovalReadAt = new Date();
  await appointment.save();

  return appointment;
}

/**
 * @description Lists paginated appointments for admin views with optional status/date filters.
 * @param {{ page?: number, limit?: number, status?: string, date?: string }} [options={}] - Pagination and filtering options.
 * @returns {Promise<{ appointments: Array<any>, total: number, page: number, limit: number }>} Paginated appointments result.
 */
export async function getAllAppointments(options = {}) {
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

  return {
    appointments,
    total,
    page: Number(page),
    limit: Number(limit)
  };
}
