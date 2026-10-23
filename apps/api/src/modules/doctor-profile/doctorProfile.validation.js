import { z } from "zod";

const doctorProfileUpdateSchema = z
  .object({
    doctorName: z.string().trim().min(2).max(120).optional(),
    specialty: z.string().trim().min(2).max(120).optional(),
    title: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(3000).optional(),
    introText: z.string().trim().max(2000).optional(),
    aboutText: z.string().trim().max(5000).optional(),
    experienceYears: z.number().int().min(0).max(80).optional(),
    qualifications: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
    clinicName: z.string().trim().max(200).optional(),
    clinicAddress: z.string().trim().max(300).optional(),
    contactPhone: z.string().trim().max(30).optional(),
    contactEmail: z.string().trim().email().optional(),
    heroHeadline: z.string().trim().max(300).optional(),
    heroSubtext: z.string().trim().max(500).optional(),
    photoUrl: z.string().trim().nullable().optional(),
    bookingEnabled: z.boolean().optional()
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

export function validateDoctorProfileUpdate(req, _res, next) {
  try {
    doctorProfileUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    next(toValidationError(error));
  }
}
