import { type UserDto } from "@workspace/auth-types";
import {
  type ApiResponse,
  type PaginatedResponse,
} from "@workspace/common-dtos";
import { type Request, type Response } from "express";

import { UserService } from "../services/index.js";
import { logger } from "../utils/logger.js";

export class UserController {
  static async getProfile(
    req: Request,
    res: Response<ApiResponse<UserDto>>
  ): Promise<void> {
    const startTime = Date.now();
    const userId = req.user?.id;

    try {
      logger.info("Get user profile request", {
        userId: userId,
        email: req.user?.email,
        ip: req.ip,
      });
      if (!userId) {
        logger.warn("Get profile failed - no user in request", {
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(401).json({
          success: false,
          error: "Unauthorized",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        logger.error("Get user profile error", {
          error: "User not found",
          email: req.user?.email,
          userId: userId,
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(404).json({
          success: false,
          error: "User not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }
      logger.info("Get user profile successful", {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });

      const userDto: UserDto = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
      };
      logger.info("Get user profile successful", {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });

      res.json({
        success: true,
        data: userDto,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get profile error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        userId: userId,
        email: req.user?.email,
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async getUsers(
    req: Request,
    res: Response<PaginatedResponse<UserDto>>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      logger.info("Get users request attempt started", {
        page: page,
        limit: limit,
        ip: req.ip,
      });

      const result = await UserService.getUsers(page, limit);

      const userDtos: UserDto[] = result.users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
      }));

      logger.info("Get users request successful", {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });

      res.json({
        success: true,
        data: userDtos,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get users error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        timestamp: new Date().toISOString(),
      } as PaginatedResponse<UserDto>);
    }
  }

  static async updateProfile(
    req: Request,
    res: Response<ApiResponse<UserDto>>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const userId = req.user?.id;
      if (!userId) {
        logger.warn("Update profile failed - no user in request", {
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(401).json({
          success: false,
          error: "Unauthorized",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updates = req.body;
      const updatedUser = await UserService.updateUser(userId, updates);

      if (!updatedUser) {
        logger.error("Update profile error", {
          error: "User not found",
          userId: userId,
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(404).json({
          success: false,
          error: "User not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userDto: UserDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        isActive: updatedUser.is_active,
        createdAt: updatedUser.created_at.toISOString(),
        updatedAt: updatedUser.updated_at.toISOString(),
      };

      logger.info("Update profile successful", {
        userId: updatedUser.id,
        email: updatedUser.email,
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });

      res.json({
        success: true,
        data: userDto,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Update profile error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.user?.id,
        email: req.user?.email,
        updates: req.body,
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
