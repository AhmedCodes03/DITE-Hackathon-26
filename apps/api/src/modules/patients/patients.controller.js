import * as patientsService from "./patients.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await patientsService.getMyProfile(req.user.userId);
  res.status(200).json({
    success: true,
    data: profile
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await patientsService.updateMyProfile(req.user.userId, req.body);
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: profile
  });
});

export const uploadMyProfilePhoto = asyncHandler(async (req, res) => {
  const image = req.body?.image;
  if (!image || typeof image !== "string") {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: [{ field: "image", message: "Image is required" }]
    });
    return;
  }

  if (!image.startsWith("data:image/")) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: [{ field: "image", message: "Image must be a valid data URL" }]
    });
    return;
  }

  const profile = await patientsService.updateMyProfile(req.user.userId, { profileImage: image });
  res.status(200).json({
    success: true,
    message: "Profile photo updated successfully",
    data: profile
  });
});
