import { type UserDto } from "@workspace/auth-types";
import {
  type ApiResponse,
  type PaginatedResponse,
} from "@workspace/common-dtos";
import { type Request, type Response } from "express";

import { UserService } from "../services/index.js";

export class UserController {
  static async getProfile(
    req: Request,
    res: Response<ApiResponse<UserDto>>
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userDto: UserDto = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
      };

      res.json({
        success: true,
        data: userDto,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get profile error:", error);
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
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

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
      console.error("Get users error:", error);
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
    try {
      const userId = req.user?.id;
      if (!userId) {
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

      res.json({
        success: true,
        data: userDto,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
