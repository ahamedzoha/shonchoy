import type { ApiResponse } from "@workspace/common-dtos";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { authRoutes, userRoutes } from "./routes/index.js";

const app = express();

// Middleware
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

// Error handler
app.use(
  (
    err: unknown & { stack?: string },
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: express.NextFunction
  ) => {
    console.error(err?.stack ?? "Unknown error");
    res.status(500).json({
      success: false,
      error: "Something went wrong!",
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
);

export { app };
