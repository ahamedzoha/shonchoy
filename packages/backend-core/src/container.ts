import { DataSource, Repository } from "typeorm";

import { DatabaseConfig, JwtConfig, createDataSource } from "./database/config";
import { Session, User } from "./database/entities";
import {
  SessionRepository,
  UserRepository,
} from "./repositories/implementations";
import { AuthService } from "./services/AuthService";
import { UserService } from "./services/UserService";

export interface IServiceContainer {
  authService: AuthService;
  userService: UserService;
}

export class BackendContainer implements IServiceContainer {
  private _dataSource: DataSource;
  private _authService: AuthService;
  private _userService: UserService;

  constructor(private config: DatabaseConfig & JwtConfig) {
    this._dataSource = createDataSource(config);

    // Initialize repositories
    const userRepository = new UserRepository(
      this._dataSource.getRepository(User)
    );
    const sessionRepository = new SessionRepository(
      this._dataSource.getRepository(Session)
    );

    // Initialize services
    this._authService = new AuthService(
      userRepository,
      sessionRepository,
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

  get dataSource(): DataSource {
    return this._dataSource;
  }
}
