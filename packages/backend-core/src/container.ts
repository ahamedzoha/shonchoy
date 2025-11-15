import { DataSource, Repository } from "typeorm";

import { DatabaseConfig, JwtConfig, createDataSource } from "./database/config";
import { EmailVerificationToken, Session, User } from "./database/entities";
import {
  EmailVerificationRepository,
  SessionRepository,
  UserRepository,
} from "./repositories/implementations";
import { AuthService } from "./services/AuthService";
import { EmailService } from "./services/EmailService";
import { UserService } from "./services/UserService";
import { EmailConfig } from "./types/email";

export interface IServiceContainer {
  authService: AuthService;
  userService: UserService;
  emailService: EmailService;
}
/**
 * BackendContainer is a class that initializes the database connection and the services.
 * It is used to inject the dependencies into the controllers and routes.
 * @param config - The configuration for the database and the services.
 * @returns The BackendContainer instance.
 * @example
 * const container = new BackendContainer({
 *   host: "localhost",
 *   port: 5432,
 *   username: "postgres",
 *   password: "password",
 *   database: "shonchoy_auth",
 *   accessToken: {
 *     secret: "your-super-secure-access-token-secret-here-at-least-32-chars",
 *     expiresIn: "15m",
 *   },
 *   refreshToken: {
 *     secret: "your-super-secure-refresh-token-secret-here-at-least-32-chars",
 *     expiresIn: "7d",
 *   },
 * });
 *
 * await container.initialize();
 * const app = createApp(container);
 * app.listen(3000);
 */
export class BackendContainer implements IServiceContainer {
  private _dataSource: DataSource;
  private _authService: AuthService;
  private _userService: UserService;
  private _emailService: EmailService;

  constructor(
    private config: DatabaseConfig & JwtConfig & { emailConfig: EmailConfig }
  ) {
    this._dataSource = createDataSource(config);

    // Initialize repositories
    const userRepository = new UserRepository(
      this._dataSource.getRepository(User)
    );
    const sessionRepository = new SessionRepository(
      this._dataSource.getRepository(Session)
    );
    const emailVerificationRepository = new EmailVerificationRepository(
      this._dataSource.getRepository(EmailVerificationToken)
    );

    // Initialize services
    this._emailService = new EmailService(config.emailConfig);
    this._authService = new AuthService(
      userRepository,
      sessionRepository,
      emailVerificationRepository,
      config
    );
    this._userService = new UserService(userRepository);
  }

  async initialize(): Promise<void> {
    await this._dataSource.initialize();
  }

  async close(): Promise<void> {
    await this._dataSource.destroy();
  }

  get authService(): AuthService {
    return this._authService;
  }

  get userService(): UserService {
    return this._userService;
  }

  get emailService(): EmailService {
    return this._emailService;
  }

  get dataSource(): DataSource {
    return this._dataSource;
  }
}
