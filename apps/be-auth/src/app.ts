import type { ApiResponse } from "@workspace/common-dtos";
import compression from "compression";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";

import {
  errorLoggingMiddleware,
  requestLoggingMiddleware,
} from "./middleware/logger.middleware.js";
import { authRoutes, userRoutes } from "./routes/index.js";
import { logger } from "./utils/logger.js";

const app: express.Application = express();

// Logger Middleware
app.use(requestLoggingMiddleware);

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

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

export { app };
