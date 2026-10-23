import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import * as appointmentsController from "./appointments.controller.js";
import {
  validateAppointmentIdParam,
  validateBookAppointment,
  validateCancelAppointment,
  validateGetMyAppointmentsQuery,
  validateRescheduleAppointment
} from "./appointments.validation.js";

const router = Router();

/**
 * @swagger
 * /api/v1/appointments:
 *   post:
 *     summary: Book a new appointment (patient only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentDate, startTime, reason]
 *             properties:
 *               appointmentDate:
 *                 type: string
 *                 example: 2026-04-30
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden for role
 */
router.post(
  "/",
  authenticate,
  authorize("patient"),
  validateBookAppointment,
  appointmentsController.bookAppointment
);

/**
 * @swagger
 * /api/v1/appointments/me:
 *   get:
 *     summary: Get current patient appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns patient appointment list
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden for role
 */
router.get(
  "/me",
  authenticate,
  authorize("patient"),
  validateGetMyAppointmentsQuery,
  appointmentsController.getMyAppointments
);

router.get(
  "/doctor",
  authenticate,
  authorize("doctor"),
  appointmentsController.getDoctorAppointments
);

router.get(
  "/:id",
  authenticate,
  validateAppointmentIdParam,
  appointmentsController.getAppointmentById
);

/**
 * @swagger
 * /api/v1/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Appointment not found
 */
router.patch(
  "/:id/cancel",
  authenticate,
  validateCancelAppointment,
  appointmentsController.cancelAppointment
);

router.patch(
  "/:id/reschedule",
  authenticate,
  validateRescheduleAppointment,
  appointmentsController.rescheduleAppointment
);

router.patch(
  "/:id/confirm",
  authenticate,
  authorize("admin", "doctor"),
  validateAppointmentIdParam,
  appointmentsController.confirmAppointment
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize("admin", "doctor"),
  validateAppointmentIdParam,
  appointmentsController.completeAppointment
);

router.patch(
  "/:id/no-show",
  authenticate,
  authorize("admin", "doctor"),
  validateAppointmentIdParam,
  appointmentsController.markNoShow
);

router.patch(
  "/:id/mark-approval-seen",
  authenticate,
  authorize("patient"),
  validateAppointmentIdParam,
  appointmentsController.markApprovalSeen
);

export default router;
