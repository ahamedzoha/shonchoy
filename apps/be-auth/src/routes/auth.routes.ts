import { JwtConfig } from "@workspace/backend-core";
import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";
import {
  handleValidationErrors,
  validateLogin,
  validateRegister,
} from "../middleware/index.js";

export const createAuthRoutes = (
  authController: AuthController,
  jwtConfig: JwtConfig
) => {
  const router: Router = Router();
  const authenticateToken = createAuthMiddleware(jwtConfig);

  // Public routes
  router.post(
    "/login",
    validateLogin,
    handleValidationErrors,
    (req: any, res: any) => authController.login(req, res)
  );
  router.post(
    "/register",
    validateRegister,
    handleValidationErrors,
    (req: any, res: any) => authController.register(req, res)
  );
  router.post("/refresh", (req: any, res: any) =>
    authController.refreshToken(req, res)
  );

  // Protected routes
  router.post("/logout", authenticateToken, (req: any, res: any) =>
    authController.logout(req, res)
  );

  return router;
};
