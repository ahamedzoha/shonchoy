import type { JwtConfig } from "@workspace/backend-core";
import type { Request, Response } from "express";
import { Router } from "express";
import passport from "passport";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuthController } from "../controllers/auth.controller";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";
import {
  handleValidationErrors,
  validateLogin,
  validateRegister,
} from "../middleware/index.js";

/**
 * Clean auth routes using Passport.js strategies
 * Much simpler and more maintainable than manual validation
 */
export const createAuthRoutes = (
  authController: AuthController,
  jwtConfig: JwtConfig
) => {
  const router: Router = Router();
  const authenticateToken = createAuthMiddleware(jwtConfig);

  // ============================================================================
  // PUBLIC ROUTES (No Authentication Required)
  // ============================================================================

  // Traditional email/password login using Passport Local strategy
  router.post(
    "/login",
    validateLogin,
    handleValidationErrors,
    (req: Request, res: Response) => authController.login(req, res)
  );

  // User registration (manual validation)
  router.post(
    "/register",
    validateRegister,
    handleValidationErrors,
    (req: Request, res: Response) => authController.register(req, res)
  );

  // Token refresh
  router.post("/refresh", (req: Request, res: Response) =>
    authController.refreshToken(req, res)
  );

  // Health check
  router.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================================================
  // OAUTH ROUTES (Redirect-based Authentication)
  // ============================================================================

  // Google OAuth routes (enabled when credentials are provided)
  const isOAuthEnabled =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

  if (isOAuthEnabled) {
    // Google OAuth initiation
    router.get(
      "/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
      })
    );

    // Google OAuth callback
    router.get(
      "/google/callback",
      passport.authenticate("google", {
        session: false,
        failureRedirect: "/login",
      }),
      (req: Request, res: Response) => authController.oauthCallback(req, res)
    );
  }

  // ============================================================================
  // PROTECTED ROUTES (JWT Authentication Required)
  // ============================================================================

  // Logout (requires valid JWT)
  router.post("/logout", authenticateToken, (req: Request, res: Response) =>
    authController.logout(req, res)
  );

  return router;
};
