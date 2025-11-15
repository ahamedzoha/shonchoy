import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

import { JwtConfig } from "../database/config";
import { User } from "../database/entities";
import {
  IEmailVerificationRepository,
  ISessionRepository,
  IUserRepository,
} from "../repositories/interfaces";
import { AuthTokens, CreateUserData, LoginCredentials } from "../types/auth";
import { CreateUserDto } from "../types/user";
import { BaseService } from "./BaseService";

export class AuthService extends BaseService {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private emailVerificationRepository: IEmailVerificationRepository,
    private jwtConfig: JwtConfig
  ) {
    super();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findUserByOAuthId(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    return this.userRepository.findByOAuthId(provider, providerId);
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const hashedPassword = userData.password
      ? await this.hashPassword(userData.password)
      : null;

    console.log("hashedPassword", hashedPassword);

    return this.userRepository.create({
      email: userData.email,
      password_hash: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      oauth_provider: userData.oauthProvider,
      oauth_id: userData.oauthId,
      emailVerified: userData.emailVerified || false,
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return this.userRepository.update(id, updates);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createAccessToken(user: User): Promise<string> {
    return new SignJWT({
      sub: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.jwtConfig.accessToken.expiresIn)
      .sign(new TextEncoder().encode(this.jwtConfig.accessToken.secret));
  }

  async createRefreshToken(user: User): Promise<string> {
    return new SignJWT({
      sub: user.id,
      email: user.email,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.jwtConfig.refreshToken.expiresIn)
      .sign(new TextEncoder().encode(this.jwtConfig.refreshToken.secret));
  }

  async createUserSession(userId: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return this.sessionRepository.create({
      userId,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    } as any);
  }

  async revokeUserSession(userId: string, refreshToken: string): Promise<void> {
    return this.sessionRepository.revokeSession(userId, refreshToken);
  }

  async findValidSession(refreshToken: string) {
    return this.sessionRepository.findValidSession(refreshToken);
  }

  async authenticateUser(
    credentials: LoginCredentials
  ): Promise<User | "unverified" | null> {
    const user = await this.findUserByEmail(credentials.email);
    if (!user) return null;

    // OAuth users don't have passwords
    if (!user.password_hash) return null;

    const isValidPassword = await this.verifyPassword(
      credentials.password,
      user.password_hash
    );

    if (!isValidPassword) return null;

    // Check if email is verified - block login if not verified
    if (!user.emailVerified) {
      return "unverified";
    }

    return user;
  }

  async createEmailVerificationToken(userId: string): Promise<string> {
    // Delete any existing token for this user
    await this.emailVerificationRepository.deleteByUserId(userId);

    // Generate new token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await this.emailVerificationRepository.create({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  async verifyEmailToken(token: string): Promise<User | null> {
    const verificationToken =
      await this.emailVerificationRepository.findByToken(token);

    if (!verificationToken) return null;

    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      await this.emailVerificationRepository.deleteByToken(token);
      return null;
    }

    // Update user as verified
    const user = await this.userRepository.update(verificationToken.userId, {
      emailVerified: true,
    });

    // Delete the token after successful verification
    await this.emailVerificationRepository.deleteByToken(token);

    return user;
  }

  async canResendVerificationEmail(userId: string): Promise<boolean> {
    const existingToken =
      await this.emailVerificationRepository.findByUserId(userId);

    if (!existingToken || !existingToken.lastResendAt) return true;

    // Check if 120 seconds have passed since last resend
    const now = new Date();
    const timeDiff = now.getTime() - existingToken.lastResendAt.getTime();
    const secondsDiff = timeDiff / 1000;

    return secondsDiff >= 120;
  }

  async updateResendTimestamp(userId: string): Promise<void> {
    const existingToken =
      await this.emailVerificationRepository.findByUserId(userId);

    if (existingToken) {
      await this.emailVerificationRepository.deleteByUserId(userId);
    }

    // Create new token with updated timestamp
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const lastResendAt = new Date();

    await this.emailVerificationRepository.create({
      userId,
      token,
      expiresAt,
      lastResendAt,
    });
  }
}
