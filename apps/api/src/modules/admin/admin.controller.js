import * as adminService from "./admin.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getDashboardTrends = asyncHandler(async (req, res) => {
  const range = Number(req.query.range) || 7;
  const trends = await adminService.getDashboardTrends(range);
  res.status(200).json({
    success: true,
    data: trends
  });
});

export const getAllPatients = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await adminService.getAllPatients({ page, limit, search });
  res.status(200).json({
    success: true,
    data: result
  });
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await adminService.getPatientById(req.params.id);
  res.status(200).json({
    success: true,
    data: patient
  });
});

export const blockPatient = asyncHandler(async (req, res) => {
  const patient = await adminService.blockPatient(req.params.id);
  res.status(200).json({
    success: true,
    message: "Patient blocked successfully",
    data: {
      id: patient._id.toString(),
      isBlocked: patient.isBlocked
    }
  });
});

export const unblockPatient = asyncHandler(async (req, res) => {
  const patient = await adminService.unblockPatient(req.params.id);
  res.status(200).json({
    success: true,
    message: "Patient unblocked successfully",
    data: {
      id: patient._id.toString(),
      isBlocked: patient.isBlocked
    }
  });
});

export const getAdminAppointments = asyncHandler(async (req, res) => {
  const { page, limit, status, date } = req.query;
  const result = await adminService.getAdminAppointments({ page, limit, status, date });
  res.status(200).json({
    success: true,
    data: result
  });
});

// ─── Doctor Management ───────────────────────────────────────────────────────

export const getAllDoctors = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;
  const result = await adminService.getAllDoctors({ page, limit, status, search });
  res.status(200).json({ success: true, data: result });
});

export const getDoctorAdminById = asyncHandler(async (req, res) => {
  const doctor = await adminService.getDoctorAdminById(req.params.id);
  res.status(200).json({ success: true, data: doctor });
});

export const approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.approveDoctor(req.params.id);
  res.status(200).json({ success: true, message: "Doctor approved successfully", data: doctor });
});

export const rejectDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.rejectDoctor(req.params.id);
  res.status(200).json({ success: true, message: "Doctor rejected", data: doctor });
});

export const blockDoctor = asyncHandler(async (req, res) => {
  const result = await adminService.blockDoctor(req.params.id);
  res.status(200).json({ success: true, message: "Doctor blocked successfully", data: result });
});

export const unblockDoctor = asyncHandler(async (req, res) => {
  const result = await adminService.unblockDoctor(req.params.id);
  res.status(200).json({ success: true, message: "Doctor unblocked successfully", data: result });
});

// ─── All Users Management ────────────────────────────────────────────────────

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const result = await adminService.getAllUsers({ page, limit, role, search });
  res.status(200).json({ success: true, data: result });
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await adminService.blockUser(req.params.id);
  res.status(200).json({ success: true, message: "User blocked", data: user });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await adminService.unblockUser(req.params.id);
  res.status(200).json({ success: true, message: "User unblocked", data: user });
});
