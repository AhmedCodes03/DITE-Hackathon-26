import * as doctorProfileService from "./doctorProfile.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getDoctorProfile = asyncHandler(async (_req, res) => {
  const profile = await doctorProfileService.getDoctorProfile();
  res.status(200).json({
    success: true,
    data: profile
  });
});

export const updateDoctorProfile = asyncHandler(async (req, res) => {
  const profile = await doctorProfileService.updateDoctorProfile(req.body);
  res.status(200).json({
    success: true,
    message: "Doctor profile updated successfully",
    data: profile
  });
});

export const getMyDoctorProfile = asyncHandler(async (req, res) => {
  const profile = await doctorProfileService.getMyDoctorProfile(req.user.userId);
  res.status(200).json({
    success: true,
    data: profile
  });
});

export const updateMyDoctorProfile = asyncHandler(async (req, res) => {
  const profile = await doctorProfileService.updateMyDoctorProfile(req.user.userId, req.body);
  res.status(200).json({
    success: true,
    message: "Doctor profile updated successfully",
    data: profile
  });
});
