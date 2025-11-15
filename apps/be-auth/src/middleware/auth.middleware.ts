import type { ApiResponse, JwtConfig } from "@workspace/backend-core";
import { createLogger } from "@workspace/backend-core";
import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

const logger = createLogger("auth-middleware");

export const createAuthMiddleware = (jwtConfig: JwtConfig) => {
  return async (
    req: Request,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

      if (!token) {
        res.status(401).json({
          success: false,
          error: "Access token required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const secret = new TextEncoder().encode(jwtConfig.accessToken.secret);
      const { payload } = await jwtVerify(token, secret);

      req.user = {
        id: payload.sub as string,
        email: payload.email as string,
      };

      next();
    } catch (error) {
      logger.error("JWT verification error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      res.status(403).json({
        success: false,
        error: "Invalid or expired token",
        timestamp: new Date().toISOString(),
      });
    }
  };
};
