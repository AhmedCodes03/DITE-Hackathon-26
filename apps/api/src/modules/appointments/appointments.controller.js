import * as appointmentsService from "./appointments.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const bookAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentsService.bookAppointment(req.user.userId, req.body);
  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    data: result
  });
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await appointmentsService.getMyAppointments(req.user.userId, {
    page,
    limit,
    status
  });
  res.status(200).json({
    success: true,
    data: result
  });
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { page, limit, status, date } = req.query;
  const result = await appointmentsService.getDoctorAppointments(req.user.userId, {
    page,
    limit,
    status,
    date
  });
  res.status(200).json({
    success: true,
    data: result
  });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.getAppointmentById(
    req.params.id,
    req.user.userId,
    req.user.role
  );
  res.status(200).json({
    success: true,
    data: appointment
  });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const appointment = await appointmentsService.cancelAppointment(
    req.params.id,
    req.user.userId,
    req.user.role,
    reason
  );
  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    data: appointment
  });
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentsService.rescheduleAppointment(
    req.params.id,
    req.user.userId,
    req.user.role,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Appointment rescheduled successfully",
    data: result
  });
});

export const confirmAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.updateAppointmentStatus(
    req.params.id,
    "confirmed",
    req.user.role
  );
  res.status(200).json({
    success: true,
    message: "Appointment confirmed",
    data: appointment
  });
});

export const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.updateAppointmentStatus(
    req.params.id,
    "completed",
    req.user.role
  );
  res.status(200).json({
    success: true,
    message: "Appointment marked as completed",
    data: appointment
  });
});

export const markNoShow = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.updateAppointmentStatus(
    req.params.id,
    "no_show",
    req.user.role
  );
  res.status(200).json({
    success: true,
    message: "Appointment marked as no-show",
    data: appointment
  });
});

export const markApprovalSeen = asyncHandler(async (req, res) => {
  const appointment = await appointmentsService.markApprovalAsRead(
    req.params.id,
    req.user.userId
  );

  res.status(200).json({
    success: true,
    message: "Approval notification marked as read",
    data: appointment
  });
});
