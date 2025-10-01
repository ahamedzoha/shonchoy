import { Router } from "express";

import { UserController } from "../controllers/index.js";
import { authenticateToken } from "../middleware/index.js";

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

router.get("/profile", UserController.getProfile);
router.put("/profile", UserController.updateProfile);
router.get("/", UserController.getUsers); // Admin route for listing users

export { router as userRoutes };
