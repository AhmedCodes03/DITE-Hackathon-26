import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import * as adminController from "./admin.controller.js";
import {
  validateAdminAppointmentsQuery,
  validateAdminPatientsQuery,
  validatePatientIdParam
} from "./admin.validation.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/dashboard", adminController.getDashboardStats);
router.get("/dashboard/trends", adminController.getDashboardTrends);

// Patients
router.get("/patients", validateAdminPatientsQuery, adminController.getAllPatients);
router.get("/patients/:id", validatePatientIdParam, adminController.getPatientById);
router.patch("/patients/:id/block", validatePatientIdParam, adminController.blockPatient);
router.patch("/patients/:id/unblock", validatePatientIdParam, adminController.unblockPatient);

// Appointments
router.get("/appointments", validateAdminAppointmentsQuery, adminController.getAdminAppointments);

// Doctors
router.get("/doctors", adminController.getAllDoctors);
router.get("/doctors/:id", adminController.getDoctorAdminById);
router.patch("/doctors/:id/approve", adminController.approveDoctor);
router.patch("/doctors/:id/reject", adminController.rejectDoctor);
router.patch("/doctors/:id/block", adminController.blockDoctor);
router.patch("/doctors/:id/unblock", adminController.unblockDoctor);

// All Users
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/block", adminController.blockUser);
router.patch("/users/:id/unblock", adminController.unblockUser);

export default router;
