import {
  type ApiResponse,
  type AuthService,
  type AuthTokens,
  type EmailService,
  type RegisterInput as RegisterDto,
  createLogger,
} from "@workspace/backend-core";
import { type Request, type Response } from "express";
import passport from "passport";

const logger = createLogger("auth-service");

/**
 * Simplified AuthController using Passport.js strategies
 * Much cleaner and more maintainable than manual validation
 */
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService
  ) {}

  /**
   * Send verification email asynchronously (fire-and-forget)
   */
  private sendVerificationEmailAsync(
    email: string,
    token: string,
    firstName: string,
    userId: string
  ): void {
    // Fire-and-forget - don't await this
    this.emailService
      .sendVerificationEmail(email, token, firstName)
      .then(() => {
        logger.info("Verification email sent successfully", { userId, email });
      })
      .catch((emailError) => {
        logger.error("Failed to send verification email", {
          userId,
          email,
          error: emailError instanceof Error ? emailError.message : "Unknown",
        });
        // Email failure doesn't affect registration - user can resend later
      });
  }

  /**
   * Local authentication (email/password) using Passport Local strategy
   */
  login(req: Request, res: Response<ApiResponse<AuthTokens>>): void {
    passport.authenticate(
      "local",
      { session: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (err: any, user: any, info: any) => {
        if (err) {
          logger.error("Login error", { error: err.message });
          res.status(500).json({
            success: false,
            error: "Authentication error",
            timestamp: new Date().toISOString(),
          });
          return;
        }

        if (!user) {
          logger.warn("Login failed", {
            reason: info?.message || "Invalid credentials",
            code: info?.code,
          });

          // Handle email verification case specially
          if (info?.code === "EMAIL_NOT_VERIFIED") {
            res.status(401).json({
              success: false,
              error: "Email not verified",
              timestamp: new Date().toISOString(),
            });
          } else {
            res.status(401).json({
              success: false,
              error: info?.message || "Invalid credentials",
              timestamp: new Date().toISOString(),
            });
          }
          return;
        }

        try {
          // Generate JWT tokens using existing service
          const [accessToken, refreshToken] = await Promise.all([
            this.authService.createAccessToken(user),
            this.authService.createRefreshToken(user),
          ]);

          // Create server-side session for refresh token
          await this.authService.createUserSession(user.id, refreshToken);

          const tokens: AuthTokens = {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes
          };

          logger.info("Login successful", {
            userId: user.id,
            email: user.email,
          });
          res.json({
            success: true,
            data: tokens,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          logger.error("Token generation error", {
            error: error instanceof Error ? error.message : "Unknown",
          });
          res.status(500).json({
            success: false,
            error: "Token generation failed",
            timestamp: new Date().toISOString(),
          });
        }
      }
    )(req, res);
  }

  /**
   * User registration with manual validation
   */
  async register(
    req: Request,
    res: Response<ApiResponse<{ requiresVerification: boolean }>>
  ): Promise<void> {
    try {
      const { email, password, firstName, lastName }: RegisterDto = req.body;

      // Check if user already exists
      const existingUser = await this.authService.findUserByEmail(email);
      if (existingUser) {
        logger.warn("Register attempt failed - user already exists", { email });
        res.status(409).json({
          success: false,
          error: "User already exists",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create user (unverified)
      const user = await this.authService.createUser({
        email,
        password,
        firstName,
        lastName,
        emailVerified: false,
      });

      // Create verification token
      const token = await this.authService.createEmailVerificationToken(
        user.id
      );

      // Send verification email asynchronously (fire-and-forget)
      this.sendVerificationEmailAsync(
        user.email,
        token,
        user.firstName,
        user.id
      );

      logger.info("Register successful - verification email queued", {
        userId: user.id,
        email,
      });

      res.status(201).json({
        success: true,
        data: { requiresVerification: true },
        message:
          "Registration successful! Please check your email to verify your account.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Register error", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * OAuth callback handler - generates tokens after successful OAuth
   */
  async oauthCallback(
    req: Request,
    res: Response<ApiResponse<AuthTokens>>
  ): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = req.user as any;

      if (!user) {
        res.status(401).json({
          success: false,
          error: "OAuth authentication failed",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate JWT tokens using existing service
      const [accessToken, refreshToken] = await Promise.all([
        this.authService.createAccessToken(user),
        this.authService.createRefreshToken(user),
      ]);

      // Create server-side session for refresh token
      await this.authService.createUserSession(user.id, refreshToken);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn: 900,
      };

      logger.info("OAuth login successful", {
        userId: user.id,
        email: user.email,
        provider: user.oauth_provider,
      });

      // Redirect back to frontend with tokens as query parameters
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
      const redirectUrl = `${frontendUrl}/login?accessToken=${encodeURIComponent(tokens.accessToken)}&refreshToken=${encodeURIComponent(tokens.refreshToken)}&expiresIn=${tokens.expiresIn}`;

      res.redirect(redirectUrl);
    } catch (error) {
      logger.error("OAuth callback error", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      res.status(500).json({
        success: false,
        error: "OAuth callback failed",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Refresh access token using valid refresh token
   */
  async refreshToken(
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
      const session = await this.authService.findValidSession(refreshToken);
      if (!session) {
        logger.warn("Invalid or expired refresh token");
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
        logger.warn("User not found for refresh token");
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

      logger.info("Token refresh successful", { userId: user.id });

      res.json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Refresh token error", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Logout - revoke refresh token session
   */
  async logout(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { refreshToken } = req.body;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = req.user as any;

      if (user && refreshToken) {
        logger.info("Logout", { userId: user.id });
        await this.authService.revokeUserSession(user.id, refreshToken);
      }

      res.json({
        success: true,
        message: "Logged out successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Logout error", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Verify email address using token
   */
  async verifyEmail(
    req: Request,
    res: Response<ApiResponse<{ message: string }>>
  ): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        res.status(400).json({
          success: false,
          error: "Verification token is required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await this.authService.verifyEmailToken(token);

      if (!user) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired verification token",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info("Email verification successful", {
        userId: user.id,
        email: user.email,
      });

      res.json({
        success: true,
        data: { message: "Email verified successfully" },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Email verification error", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    req: Request,
    res: Response<ApiResponse<{ message: string }>>
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email is required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await this.authService.findUserByEmail(email);

      if (!user) {
        // Don't reveal if user exists for security
        res.json({
          success: true,
          data: {
            message: "If the email exists, a verification link has been sent",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (user.emailVerified) {
        res.status(400).json({
          success: false,
          error: "Email is already verified",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check cooldown
      const canResend = await this.authService.canResendVerificationEmail(
        user.id
      );

      if (!canResend) {
        res.status(429).json({
          success: false,
          error: "Please wait before requesting another verification email",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update resend timestamp and create new token
      await this.authService.updateResendTimestamp(user.id);
      const newToken = await this.authService.createEmailVerificationToken(
        user.id
      );

      // Send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        newToken,
        user.firstName
      );

      logger.info("Verification email resent", { userId: user.id, email });

      res.json({
        success: true,
        data: { message: "Verification email sent" },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Resend verification email error", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
