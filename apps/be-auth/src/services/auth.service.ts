import { type SessionEntity, type UserEntity } from "@workspace/auth-types";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

import { pool } from "../config/index.js";
import { jwtConfig } from "../config/index.js";

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async createAccessToken(user: UserEntity): Promise<string> {
    const secret = new TextEncoder().encode(jwtConfig.accessToken.secret);

    return new SignJWT({
      sub: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(jwtConfig.accessToken.expiresIn)
      .sign(secret);
  }

  static async createRefreshToken(user: UserEntity): Promise<string> {
    const secret = new TextEncoder().encode(jwtConfig.refreshToken.secret);

    return new SignJWT({
      sub: user.id,
      email: user.email,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(jwtConfig.refreshToken.expiresIn)
      .sign(secret);
  }

  static async createUserSession(
    userId: string,
    refreshToken: string
  ): Promise<SessionEntity> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const result = await pool.query(
      "INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3) RETURNING *",
      [userId, refreshToken, expiresAt]
    );

    return result.rows[0];
  }

  static async findUserByEmail(email: string): Promise<UserEntity | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  }

  static async findUserById(id: string): Promise<UserEntity | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async createUser(userData: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
  }): Promise<UserEntity> {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name,
      ]
    );
    return result.rows[0];
  }

  static async revokeUserSession(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    await pool.query(
      "UPDATE sessions SET is_revoked = true WHERE user_id = $1 AND refresh_token = $2",
      [userId, refreshToken]
    );
  }

  static async findValidSession(
    refreshToken: string
  ): Promise<SessionEntity | null> {
    const result = await pool.query(
      "SELECT * FROM sessions WHERE refresh_token = $1 AND is_revoked = false AND expires_at > NOW()",
      [refreshToken]
    );
    return result.rows[0] || null;
  }
}
