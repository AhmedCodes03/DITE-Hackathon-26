import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import * as patientsController from "./patients.controller.js";
import { validateProfileUpdate } from "./patients.validation.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  authorize("patient"),
  patientsController.getMyProfile
);

router.patch(
  "/me",
  authenticate,
  authorize("patient"),
  validateProfileUpdate,
  patientsController.updateMyProfile
);

router.post(
  "/me/photo",
  authenticate,
  authorize("patient"),
  patientsController.uploadMyProfilePhoto
);

export default router;
