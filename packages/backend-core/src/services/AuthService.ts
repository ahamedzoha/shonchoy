import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

import { JwtConfig } from "../database/config";
import { User } from "../database/entities";
import {
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

  async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    const user = await this.findUserByEmail(credentials.email);
    if (!user) return null;

    // OAuth users don't have passwords
    if (!user.password_hash) return null;

    const isValidPassword = await this.verifyPassword(
      credentials.password,
      user.password_hash
    );
    return isValidPassword ? user : null;
  }
}
