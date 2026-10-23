import mongoose from "mongoose";
import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

const appointmentIdParamSchema = z.object({
  id: z
    .string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), "Invalid appointment id")
});

const bookAppointmentSchema = z
  .object({
    appointmentDate: z.string().regex(dateRegex, "Appointment date must be in YYYY-MM-DD format"),
    startTime: z.string().regex(timeRegex, "Start time must be in HH:mm format"),
    reason: z.string().trim().min(1).max(500),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    doctorId: z.string().optional()
  })
  .strict();

const cancelSchema = z
  .object({
    reason: z.string().trim().max(500).optional()
  })
  .strict();

const rescheduleSchema = z
  .object({
    appointmentDate: z.string().regex(dateRegex, "Appointment date must be in YYYY-MM-DD format"),
    startTime: z.string().regex(timeRegex, "Start time must be in HH:mm format"),
    reason: z.string().trim().max(500).optional()
  })
  .strict();

const getMyAppointmentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]).optional()
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

export function validateBookAppointment(req, _res, next) {
  try {
    bookAppointmentSchema.parse(req.body);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateGetMyAppointmentsQuery(req, _res, next) {
  try {
    getMyAppointmentsQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateAppointmentIdParam(req, _res, next) {
  try {
    appointmentIdParamSchema.parse(req.params);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateCancelAppointment(req, _res, next) {
  try {
    appointmentIdParamSchema.parse(req.params);
    cancelSchema.parse(req.body);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateRescheduleAppointment(req, _res, next) {
  try {
    appointmentIdParamSchema.parse(req.params);
    rescheduleSchema.parse(req.body);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}
