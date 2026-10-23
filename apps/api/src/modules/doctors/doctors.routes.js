import { Router } from "express";
import * as doctorsController from "./doctors.controller.js";

const router = Router();

// All public routes - no auth required
router.get("/", doctorsController.listDoctors);
router.get("/:id", doctorsController.getDoctorById);
router.get("/:id/availability", doctorsController.getDoctorAvailability);
router.get("/:id/slots", doctorsController.getDoctorSlots);

export default router;
