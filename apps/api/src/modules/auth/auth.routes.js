import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { loginLimiter, registerLimiter, refreshLimiter } from "../../middleware/rateLimiter.js";
import { validate, registerSchema, registerDoctorSchema, loginSchema, refreshSchema } from "./auth.validation.js";
import * as authController from "./auth.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new patient account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */
router.post("/register", registerLimiter, validate(registerSchema), authController.register);
router.post("/register-doctor", registerLimiter, validate(registerDoctorSchema), authController.registerDoctor);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in and receive JWT tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns tokens
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Rate limit exceeded
 */
router.post("/login", loginLimiter, validate(loginSchema), authController.login);

router.post("/refresh", refreshLimiter, validate(refreshSchema), authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out and invalidate token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user object
 *       401:
 *         description: Not authenticated
 */
router.get("/me", authenticate, authController.me);

export default router;
