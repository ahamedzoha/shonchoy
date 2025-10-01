import { Router } from "express";

import { AuthController } from "../controllers/index.js";
import {
  authenticateToken,
  handleValidationErrors,
  validateLogin,
  validateRegister,
} from "../middleware/index.js";

const router = Router();

// Public routes
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  AuthController.login
);
router.post(
  "/register",
  validateRegister,
  handleValidationErrors,
  AuthController.register
);
router.post("/refresh", AuthController.refreshToken);

// Protected routes
router.post("/logout", authenticateToken, AuthController.logout);

export { router as authRoutes };
