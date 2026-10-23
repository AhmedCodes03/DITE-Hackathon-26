import { asyncHandler } from "../../utils/asyncHandler.js";
import * as aiService from "./ai.service.js";

export const chatWithAi = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      message: "messages array is required"
    });
  }

  const patientContext = req.user ? {
    userId: req.user._id || req.user.id,
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role
  } : null;

  const result = await aiService.processAiMessage({
    messages,
    patientContext
  });

  return res.status(200).json({
    success: true,
    data: result
  });
});
