import { Router } from "express";
import { register, login, getMe, refresh, logout, resendVerificationController } from "../controllers/auth.controller";
import asyncHandler from "../utils/asyncHandler";
// import validateRegisterUser from "../middleware/_validateRegisterUser";
// import validateLogin from "../middleware/_validateLogin";
import authMiddleware from "../middleware/authMiddleware";
import loginRateLimiter from "../middleware/loginRateLimiter";
import validateRefreshToken from "../middleware/validateRefreshToken";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, resendVerificationSchema } from "../schemas/auth.schema";
import validate from "../middleware/validate";
import { resetPassword } from "../controllers/auth.controller";
import { verifyEmail } from "../controllers/auth.controller";

import { forgotPassword } from "../controllers/auth.controller";

const authRouter = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'  
 *     responses:
 *       201:
 *         description: User registered successfully
 *  
 *       400:
 *         description: Invalid registration data
 *         content:
 *            application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ErrorResponse'
 *
 *         409:
 *            description: Email already exists
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/register", validate(registerSchema), asyncHandler(register));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user and returns access and refresh tokens.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid login data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/login", validate(loginSchema), asyncHandler(login));

authRouter.post("/refresh", validateRefreshToken, asyncHandler(refresh)); // Placeholder for refresh token route
authRouter.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPassword)); // Placeholder for forgot password route
authRouter.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword)); // Placeholder for reset password route
authRouter.get("/verify-email", asyncHandler(verifyEmail)); // Placeholder for email verification route
authRouter.post("/resend-verification", validate(resendVerificationSchema), asyncHandler(resendVerificationController));

authRouter.post("/logout", validateRefreshToken, asyncHandler(logout)); // Placeholder for logout route

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     description: Returns the currently authenticated user's profile.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current user fetched successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.get("/me", authMiddleware, asyncHandler(getMe));


export default authRouter;

// Notice that /refresh does not use 'authMiddleware'.
//That's intentional.
//The access token may have expired. The refresh token is what authenticates this request.