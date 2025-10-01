import { AuthTokens, LoginDto, RegisterDto } from "@workspace/auth-types";
import { ApiResponse } from "@workspace/common-dtos";
import { Request, Response } from "express";

import { AuthService } from "../services/index.js";

export class AuthController {
  static async login(
    req: Request,
    res: Response<ApiResponse<AuthTokens>>
  ): Promise<void> {
    try {
      const { email, password }: LoginDto = req.body;

      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: "Invalid credentials",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const isValidPassword = await AuthService.verifyPassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: "Invalid credentials",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const [accessToken, refreshToken] = await Promise.all([
        AuthService.createAccessToken(user),
        AuthService.createRefreshToken(user),
      ]);

      // Create session
      await AuthService.createUserSession(user.id, refreshToken);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
      };

      res.json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async register(
    req: Request,
    res: Response<ApiResponse<AuthTokens>>
  ): Promise<void> {
    try {
      const { email, password, firstName, lastName }: RegisterDto = req.body;

      // Check if user already exists
      const existingUser = await AuthService.findUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: "User already exists",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Hash password
      const passwordHash = await AuthService.hashPassword(password);

      // Create user
      const user = await AuthService.createUser({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
      });

      // Generate tokens
      const [accessToken, refreshToken] = await Promise.all([
        AuthService.createAccessToken(user),
        AuthService.createRefreshToken(user),
      ]);

      // Create session
      await AuthService.createUserSession(user.id, refreshToken);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn: 900,
      };

      res.status(201).json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async refreshToken(
    req: Request,
    res: Response<ApiResponse<AuthTokens>>
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: "Refresh token required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify refresh token and get session
      const session = await AuthService.findValidSession(refreshToken);
      if (!session) {
        res.status(401).json({
          success: false,
          error: "Invalid or expired refresh token",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get user
      const user = await AuthService.findUserById(session.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: "User not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate new tokens
      const [accessToken, newRefreshToken] = await Promise.all([
        AuthService.createAccessToken(user),
        AuthService.createRefreshToken(user),
      ]);

      // Revoke old session and create new one
      await AuthService.revokeUserSession(user.id, refreshToken);
      await AuthService.createUserSession(user.id, newRefreshToken);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      };

      res.json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async logout(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const user = req.user;

      if (user && refreshToken) {
        await AuthService.revokeUserSession(user.id, refreshToken);
      }

      res.json({
        success: true,
        message: "Logged out successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
