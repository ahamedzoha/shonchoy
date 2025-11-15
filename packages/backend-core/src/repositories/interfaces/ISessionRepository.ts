import { Session } from "../../database/entities";

export interface ISessionRepository {
  create(sessionData: Partial<Session>): Promise<Session>;
  findByRefreshToken(refreshToken: string): Promise<Session | null>;
  revokeSession(userId: string, refreshToken: string): Promise<void>;
  findValidSession(refreshToken: string): Promise<Session | null>;
}
