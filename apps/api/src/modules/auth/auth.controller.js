import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result
  });
});

export const registerDoctor = asyncHandler(async (req, res) => {
  const result = await authService.registerDoctor(req.body);
  res.status(201).json({
    success: true,
    message: "Doctor registered successfully. Your account is pending admin approval.",
    data: result
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json({
    success: true,
    data: result
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refreshTokens(req.body);
  res.status(200).json({
    success: true,
    data: tokens
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.userId);
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId);
  res.status(200).json({
    success: true,
    data: user
  });
});
