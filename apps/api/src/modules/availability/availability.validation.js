import mongoose from "mongoose";
import { z } from "zod";

const timeRegex = /^\d{2}:\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const availabilityShape = {
  dayOfWeek: z
    .enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  slotDurationMinutes: z.number().int().min(5).max(240),
  breakStartTime: z.string().regex(timeRegex).optional(),
  breakEndTime: z.string().regex(timeRegex).optional(),
  isActive: z.boolean().optional()
};

function withBreakValidation(schema) {
  return schema.superRefine((value, ctx) => {
    if ((value.breakStartTime && !value.breakEndTime) || (!value.breakStartTime && value.breakEndTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["breakStartTime"],
        message: "Both breakStartTime and breakEndTime are required together"
      });
    }
  });
}

const createAvailabilitySchema = withBreakValidation(z.object(availabilityShape).strict());

const updateAvailabilitySchema = withBreakValidation(z.object(availabilityShape).partial().strict());

const availabilityIdParamSchema = z.object({
  id: z
    .string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), "Invalid availability id")
});

const slotsQuerySchema = z.object({
  date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format")
});

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

export function validateCreateAvailability(req, _res, next) {
  try {
    createAvailabilitySchema.parse(req.body);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateUpdateAvailability(req, _res, next) {
  try {
    availabilityIdParamSchema.parse(req.params);
    updateAvailabilitySchema.parse(req.body);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateDeleteAvailability(req, _res, next) {
  try {
    availabilityIdParamSchema.parse(req.params);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}

export function validateSlotsQuery(req, _res, next) {
  try {
    slotsQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}
