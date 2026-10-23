import mongoose from "mongoose";
import { z } from "zod";

const patientIdParamSchema = z.object({
  id: z
    .string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), "Invalid patient id")
});

const appointmentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional()
  })
  .strict();

const patientsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().max(120).optional()
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

export function validatePatientIdParam(req, _res, next) {
  try {
    patientIdParamSchema.parse(req.params);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateAdminPatientsQuery(req, _res, next) {
  try {
    patientsQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateAdminAppointmentsQuery(req, _res, next) {
  try {
    appointmentsQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}
