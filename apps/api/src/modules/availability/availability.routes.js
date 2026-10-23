import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import * as availabilityController from "./availability.controller.js";
import {
  validateCreateAvailability,
  validateDeleteAvailability,
  validateSlotsQuery,
  validateUpdateAvailability
} from "./availability.validation.js";

const router = Router();

router.get("/", availabilityController.getAllAvailability);

router.get("/slots", validateSlotsQuery, availabilityController.getSlots);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateAvailability,
  availabilityController.createAvailability
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateAvailability,
  availabilityController.updateAvailability
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateDeleteAvailability,
  availabilityController.deleteAvailability
);

export default router;
