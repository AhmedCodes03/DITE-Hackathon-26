import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import * as doctorProfileController from "./doctorProfile.controller.js";
import { validateDoctorProfileUpdate } from "./doctorProfile.validation.js";

const router = Router();

router.get("/", doctorProfileController.getDoctorProfile);

router.get("/me", authenticate, authorize("doctor"), doctorProfileController.getMyDoctorProfile);
router.patch("/me", authenticate, authorize("doctor"), doctorProfileController.updateMyDoctorProfile);

router.patch(
  "/",
  authenticate,
  authorize("admin"),
  validateDoctorProfileUpdate,
  doctorProfileController.updateDoctorProfile
);

export default router;
