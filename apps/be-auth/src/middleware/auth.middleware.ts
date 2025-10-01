import { type ApiResponse } from "@workspace/common-dtos";
import { type NextFunction, type Request, type Response } from "express";
import { jwtVerify } from "jose";

import { jwtConfig } from "../config/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (
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
    res.status(403).json({
      success: false,
      error: "Invalid or expired token",
      timestamp: new Date().toISOString(),
    });
  }
};
