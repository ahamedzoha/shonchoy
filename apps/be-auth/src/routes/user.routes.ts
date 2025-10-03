import { JwtConfig } from "@workspace/backend-core";
import { Router } from "express";

import { UserController } from "../controllers/user.controller";
import { createAuthMiddleware } from "../middleware/auth.middleware";

export const createUserRoutes = (
  userController: UserController,
  jwtConfig: JwtConfig
) => {
  const router: Router = Router();
  const authenticateToken = createAuthMiddleware(jwtConfig);

  // All user routes require authentication
  router.use(authenticateToken);

  router.get("/profile", (req, res) => userController.getProfile(req, res));
  router.put("/profile", (req, res) => userController.updateProfile(req, res));
  router.get("/", (req, res) => userController.getUsers(req, res)); // Admin route for listing users

  return router;
};
