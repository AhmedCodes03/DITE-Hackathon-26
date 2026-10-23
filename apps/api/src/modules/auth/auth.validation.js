import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  email: z.string().email("Please provide a valid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  phone: z.string().optional()
});

export const registerDoctorSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).trim(),
  email: z.string().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  ),
  phone: z.string().optional(),
  specialty: z.string().min(2, "Specialty is required"),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  qualifications: z.union([z.string(), z.array(z.string())]).optional()
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
});

export function validate(schema) {
  return function (req, _res, next) {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        return next(
          Object.assign(new Error("Validation failed"), {
            statusCode: 400,
            errors
          })
        );
      }
      next(error);
    }
  };
}
