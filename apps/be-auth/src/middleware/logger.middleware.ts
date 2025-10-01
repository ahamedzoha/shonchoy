import { type NextFunction, type Request, type Response } from "express";

import { logger } from "../utils/logger.js";

//Error logging middleware
export const errorLoggingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Request error occured", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers["User-Agent"],
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
    status: res.statusCode,
  });
  next(err);
};

//Request logging middleware
export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  // Log incoming request
  logger.http("Incoming Request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers["User-Agent"],
  });

  // Log response when request is complete
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info("Request Completed", {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers["User-Agent"],
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
};
