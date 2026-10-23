import * as availabilityService from "./availability.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllAvailability = asyncHandler(async (_req, res) => {
  const availability = await availabilityService.getAllAvailability();
  res.status(200).json({
    success: true,
    data: availability
  });
});

export const getSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  const result = await availabilityService.getAvailableSlots(date);
  res.status(200).json({
    success: true,
    data: result
  });
});

export const createAvailability = asyncHandler(async (req, res) => {
  const availability = await availabilityService.createAvailability(req.body);
  res.status(201).json({
    success: true,
    message: "Availability created successfully",
    data: availability
  });
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const availability = await availabilityService.updateAvailability(
    req.params.id,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Availability updated successfully",
    data: availability
  });
});

export const deleteAvailability = asyncHandler(async (req, res) => {
  await availabilityService.deleteAvailability(req.params.id);
  res.status(200).json({
    success: true,
    message: "Availability deleted successfully"
  });
});
