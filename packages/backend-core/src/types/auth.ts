// Internal service types
import { User } from "../database/entities";

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// API-facing types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
  type?: string; // for refresh tokens
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
