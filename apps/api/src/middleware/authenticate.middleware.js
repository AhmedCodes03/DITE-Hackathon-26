import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError("Access token is required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    req.user = {
      userId: decoded.userId,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Access token has expired", 401));
    }
    return next(new ApiError("Invalid access token", 401));
  }
}

export async function optionalAuthenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(decoded.userId);
    if (user) {
      req.user = {
        userId: decoded.userId,
        id: decoded.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      };
    }
  } catch {
    // Ignore invalid/expired token for optional authentication
  }

  next();
}
