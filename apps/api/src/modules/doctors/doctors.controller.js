import * as doctorsService from "./doctors.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listDoctors = asyncHandler(async (req, res) => {
  const { search, specialty } = req.query;
  const doctors = await doctorsService.listDoctors({ search, specialty });
  res.status(200).json({ success: true, data: doctors });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorsService.getDoctorById(req.params.id);
  res.status(200).json({ success: true, data: doctor });
});

export const getDoctorAvailability = asyncHandler(async (req, res) => {
  const availability = await doctorsService.getDoctorAvailability(req.params.id);
  res.status(200).json({ success: true, data: availability });
});

export const getDoctorSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const slots = await doctorsService.getDoctorSlots(req.params.id, date);
  res.status(200).json({ success: true, data: slots });
});
