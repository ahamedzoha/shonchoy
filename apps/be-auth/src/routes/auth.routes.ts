import type {
  ApiResponse,
  AuthTokens,
  JwtConfig,
} from "@workspace/backend-core";
import { type Request, type Response, Router } from "express";

import type { AuthController } from "../controllers/auth.controller";
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
    (req: Request, res: Response<ApiResponse<AuthTokens>>) =>
      authController.login(req, res)
  );
  router.post(
    "/register",
    validateRegister,
    handleValidationErrors,
    (req: Request, res: Response<ApiResponse<AuthTokens>>) =>
      authController.register(req, res)
  );
  router.post(
    "/refresh",
    (req: Request, res: Response<ApiResponse<AuthTokens>>) =>
      authController.refreshToken(req, res)
  );

  // Protected routes
  router.post(
    "/logout",
    authenticateToken,
    (req: Request, res: Response<ApiResponse<AuthTokens>>) =>
      authController.logout(req, res)
  );

  return router;
};
