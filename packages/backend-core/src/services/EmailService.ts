import nodemailer from "nodemailer";

import { EmailConfig } from "../types/email";
import { createLogger } from "../utils/logger";

const logger = createLogger("email-service");

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = this.getVerificationEmailTemplate(firstName, verificationUrl);

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: email,
        subject: "Verify your email address - Shonchoy",
        html,
      });

      logger.info("Verification email sent successfully", { email });
    } catch (error) {
      logger.error("Failed to send verification email", {
        email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error("Failed to send verification email");
    }
  }

  private getVerificationEmailTemplate(
    firstName: string,
    verificationUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Shonchoy</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Shonchoy</div>
            <h1 class="title">Welcome to Shonchoy!</h1>
            <p class="subtitle">Hi ${firstName}, please verify your email address to complete your account setup.</p>
          </div>
          
          <p>Thank you for signing up! To get started, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification link.
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
          
          <p>If you didn't create an account with Shonchoy, you can safely ignore this email.</p>
          
          <div class="footer">
            <p>This email was sent by Shonchoy. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Shonchoy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
