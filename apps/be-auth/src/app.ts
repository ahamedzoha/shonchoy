import {
  type ApiResponse,
  type BackendContainer,
  createLogger,
} from "@workspace/backend-core";
import compression from "compression";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import passport from "passport";

import { configurePassport } from "./config/passport";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import {
  errorLoggingMiddleware,
  requestLoggingMiddleware,
} from "./middleware/logger.middleware";
import { createAuthRoutes, createUserRoutes } from "./routes/index";

const logger = createLogger("auth-service");

export const createApp = (container: BackendContainer) => {
  const app: express.Application = express();

  // Logger Middleware
  app.use(requestLoggingMiddleware);

  // Security Middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize Passport
  app.use(passport.initialize()); // No sessions for JWT-based auth

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Create controllers with services from container
  const authController = new AuthController(container.authService);
  const userController = new UserController(container.userService);

  // Create routes with controllers and JWT config
  // Note: JWT config is now validated at startup in index.ts
  const jwtConfig = {
    accessToken: {
      secret: process.env.JWT_ACCESS_SECRET!, // Validated at startup
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET!, // Validated at startup
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  };

  // Configure Passport strategies
  configurePassport(container.authService, jwtConfig);

  const authRoutes = createAuthRoutes(authController, jwtConfig);
  const userRoutes = createUserRoutes(userController, jwtConfig);

  // API routes
  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  });

  // Error Logging Middleware - should be last to catch all errors
  app.use(errorLoggingMiddleware);

  // Error handler - uses Winston Logger
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error("Unhandled [be-auth] application error occured", {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({
      success: false,
      error: "Something went wrong!",
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  });

  return app;
};
