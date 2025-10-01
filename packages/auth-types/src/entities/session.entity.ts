export interface SessionEntity {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
}
