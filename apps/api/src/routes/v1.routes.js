import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import doctorProfileRoutes from "../modules/doctor-profile/doctorProfile.routes.js";
import doctorsRoutes from "../modules/doctors/doctors.routes.js";
import availabilityRoutes from "../modules/availability/availability.routes.js";
import appointmentRoutes from "../modules/appointments/appointments.routes.js";
import patientRoutes from "../modules/patients/patients.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/doctor-profile", doctorProfileRoutes);
router.use("/doctors", doctorsRoutes);
router.use("/availability", availabilityRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/patients", patientRoutes);
router.use("/admin", adminRoutes);
router.use("/ai", aiRoutes);

export default router;
