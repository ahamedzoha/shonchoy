import {
  type ApiResponse,
  AuthService,
  type AuthTokens,
  type LoginInput as LoginDto,
  type RegisterInput as RegisterDto,
  createLogger,
} from "@workspace/backend-core";
import { type Request, type Response } from "express";

const logger = createLogger("auth-service");

export class AuthController {
  constructor(private authService: AuthService) {}
  async login(
    req: Request,
    res: Response<ApiResponse<AuthTokens>>
  ): Promise<void> {
    const startTime = Date.now();
    const { email, password }: LoginDto = req.body;

    try {
      logger.info("Login attempt started", {
        email,
        ip: req.ip,
        userAgent: req.headers["User-Agent"],
      });
      const user = await this.authService.findUserByEmail(email);
      if (!user) {
        logger.warn("Login attempt failed - user not found", {
          email,
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(401).json({
          success: false,
          error: "Invalid credentials",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const isValidPassword = await this.authService.verifyPassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        logger.warn("Login attempt failed - invalid password", {
          email,
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(401).json({
          success: false,
          error: "Invalid credentials",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const [accessToken, refreshToken] = await Promise.all([
        this.authService.createAccessToken(user),
        this.authService.createRefreshToken(user),
      ]);

      // Create session
      await this.authService.createUserSession(user.id, refreshToken);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
      };

      logger.info("Login successful", {
        userId: user.id,
        email,
        ip: req.ip,
        userAgent: req.headers["User-Agent"],
        duration: `${Date.now() - startTime}ms`,
      });
      res.json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Login error:", error);
      logger.error("Login error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip,
        email,
        userAgent: req.headers["User-Agent"],
        duration: `${Date.now() - startTime}ms`,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  async register(
    req: Request,
    res: Response<ApiResponse<AuthTokens>>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const { email, password, firstName, lastName }: RegisterDto = req.body;

      // Check if user already exists
      const existingUser = await this.authService.findUserByEmail(email);
      if (existingUser) {
        logger.warn("Register attempt failed - user already exists", {
          email,
          firstName,
          lastName,
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(409).json({
          success: false,
          error: "User already exists",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Hash password
      const passwordHash = await this.authService.hashPassword(password);

      // Create user
      const user = await this.authService.createUser({
        email,
        password: passwordHash,
        firstName,
        lastName,
      });

      // Generate tokens
      const [accessToken, refreshToken] = await Promise.all([
        this.authService.createAccessToken(user),
        this.authService.createRefreshToken(user),
      ]);

      // Create session
      await this.authService.createUserSession(user.id, refreshToken);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn: 900,
      };

      logger.info("Register successful", {
        userId: user.id,
        email,
        ip: req.ip,
        userAgent: req.headers["User-Agent"],
        duration: `${Date.now() - startTime}ms`,
      });

      res.status(201).json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Register error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip,
        userAgent: req.headers["User-Agent"],
        duration: `${Date.now() - startTime}ms`,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  async refreshToken(
    req: Request,
    res: Response<ApiResponse<AuthTokens>>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const { refreshToken } = req.body;
      logger.info("Refresh token attempt started", {
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });
      if (!refreshToken) {
        logger.warn("Refresh token attempt failed - refresh token required", {
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(400).json({
          success: false,
          error: "Refresh token required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify refresh token and get session
      const session = await this.authService.findValidSession(refreshToken);
      if (!session) {
        logger.warn(
          "Refresh token attempt failed - invalid or expired refresh token",
          {
            ip: req.ip,
            duration: `${Date.now() - startTime}ms`,
          }
        );
        res.status(401).json({
          success: false,
          error: "Invalid or expired refresh token",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get user
      const user = await this.authService.findUserById(session.userId);
      if (!user) {
        logger.warn("Refresh token attempt failed - user not found", {
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        res.status(401).json({
          success: false,
          error: "User not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate new tokens
      const [accessToken, newRefreshToken] = await Promise.all([
        this.authService.createAccessToken(user),
        this.authService.createRefreshToken(user),
      ]);

      // Revoke old session and create new one
      await this.authService.revokeUserSession(user.id, refreshToken);
      await this.authService.createUserSession(user.id, newRefreshToken);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      };

      logger.info("Refresh token successful", {
        userId: user.id,
        ip: req.ip,
        duration: `${Date.now() - startTime}ms`,
      });

      res.json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Refresh token error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
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

  async logout(req: Request, res: Response<ApiResponse>): Promise<void> {
    const startTime = Date.now();
    try {
      const { refreshToken } = req.body;
      const user = req.user;

      if (user && refreshToken) {
        logger.info("Logout attempt started", {
          userId: user.id,
          ip: req.ip,
          duration: `${Date.now() - startTime}ms`,
        });
        await this.authService.revokeUserSession(user.id, refreshToken);
      }

      res.json({
        success: true,
        message: "Logged out successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Logout error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
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
