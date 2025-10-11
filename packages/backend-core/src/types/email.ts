export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
  from: string;
}

export interface VerificationEmailData {
  email: string;
  firstName: string;
  token: string;
  expiresIn: number;
}

export interface CreateVerificationTokenDto {
  userId: string;
  token: string;
  expiresAt: Date;
  lastResendAt?: Date | null;
}
