import { Repository } from "typeorm";

import { Session } from "../../database/entities";
import { ISessionRepository } from "../interfaces";

export class SessionRepository implements ISessionRepository {
  constructor(private repository: Repository<Session>) {}

  async create(sessionData: Partial<Session>): Promise<Session> {
    const session = this.repository.create(sessionData);
    return this.repository.save(session);
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.repository.findOne({
      where: { refresh_token: refreshToken },
      relations: ["user"],
    });
  }

  async revokeSession(userId: string, refreshToken: string): Promise<void> {
    await this.repository.update(
      { userId, refresh_token: refreshToken },
      { is_revoked: true }
    );
  }

  async findValidSession(refreshToken: string): Promise<Session | null> {
    return this.repository
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.user", "user")
      .where("session.refresh_token = :refreshToken", { refreshToken })
      .andWhere("session.is_revoked = false")
      .andWhere("session.expires_at > NOW()")
      .getOne();
  }
}
