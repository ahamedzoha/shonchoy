import { EmailVerificationToken } from "../../database/entities";
import { CreateVerificationTokenDto } from "../../types/email";

export interface IEmailVerificationRepository {
  create(data: CreateVerificationTokenDto): Promise<EmailVerificationToken>;
  findByToken(token: string): Promise<EmailVerificationToken | null>;
  findByUserId(userId: string): Promise<EmailVerificationToken | null>;
  deleteByUserId(userId: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
}
