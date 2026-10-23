import { z } from "zod";

const profileUpdateSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(7).max(30).optional(),
    dateOfBirth: z.string().datetime().optional(),
    age: z.number().int().min(0).max(130).optional(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
    address: z.string().trim().max(300).optional(),
    emergencyContactName: z.string().trim().max(100).optional(),
    emergencyContactPhone: z.string().trim().max(30).optional(),
    medicalNotes: z.string().trim().max(2000).optional(),
    profileImage: z.string().trim().max(2_000_000).optional()
  })
  .strict();

function toValidationError(error) {
  if (error instanceof z.ZodError) {
    const errors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message
    }));

    return Object.assign(new Error("Validation failed"), {
      statusCode: 400,
      errors
    });
  }

  return error;
}

export function validateProfileUpdate(req, _res, next) {
  try {
    profileUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}
