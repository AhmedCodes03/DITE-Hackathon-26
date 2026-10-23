import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  // Tight login threshold slows brute-force attacks while remaining usable for humans.
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many login attempts. Please try again in 15 minutes."
  }
});

export const registerLimiter = rateLimit({
  // Lower account-creation limit reduces scripted signup abuse from a single IP.
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many accounts created from this IP. Try again later."
  }
});

export const refreshLimiter = rateLimit({
  // Higher refresh budget supports normal session renewal but still limits token hammering.
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many token refresh attempts. Please try again later."
  }
});
