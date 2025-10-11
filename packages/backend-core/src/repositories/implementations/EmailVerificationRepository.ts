import { Repository } from "typeorm";

import { EmailVerificationToken } from "../../database/entities";
import { CreateVerificationTokenDto } from "../../types/email";
import { IEmailVerificationRepository } from "../interfaces/IEmailVerificationRepository";

export class EmailVerificationRepository
  implements IEmailVerificationRepository
{
  constructor(private repository: Repository<EmailVerificationToken>) {}

  async create(
    data: CreateVerificationTokenDto
  ): Promise<EmailVerificationToken> {
    const token = this.repository.create(data);
    return this.repository.save(token);
  }

  async findByToken(token: string): Promise<EmailVerificationToken | null> {
    return this.repository.findOne({
      where: { token },
      relations: ["user"],
    });
  }

  async findByUserId(userId: string): Promise<EmailVerificationToken | null> {
    return this.repository.findOne({
      where: { userId },
      relations: ["user"],
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.repository.delete({ token });
  }
}
