# Backend Architecture Documentation

## Overview

This document describes the comprehensive backend architecture for the Shonchoy platform, focusing on the authentication service (`be-auth`) and the shared `@workspace/backend-core` package. The architecture follows clean architecture principles with dependency injection, repository patterns, and clear separation of concerns.

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Package Structure](#package-structure)
3. [Dependency Injection & Container](#dependency-injection--container)
4. [Data Layer (Repositories)](#data-layer-repositories)
5. [Service Layer](#service-layer)
6. [Presentation Layer (Controllers)](#presentation-layer-controllers)
7. [Infrastructure Layer](#infrastructure-layer)
8. [Cross-Cutting Concerns](#cross-cutting-concerns)
9. [Error Handling](#error-handling)
10. [Testing Strategy](#testing-strategy)
11. [Deployment & Scaling](#deployment--scaling)

## Architecture Principles

### 1. Clean Architecture

- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification

### 2. SOLID Principles

- **Single Responsibility**: Classes have one primary responsibility
- **Open/Closed**: Extend functionality without modifying existing code
- **Liskov Substitution**: Subtypes are substitutable for their base types
- **Interface Segregation**: Clients depend only on methods they use
- **Dependency Inversion**: Depend on abstractions, not concretions

### 3. Design Patterns Used

- **Repository Pattern**: Abstract data access
- **Dependency Injection**: Loose coupling between components
- **Factory Pattern**: Object creation abstraction
- **Strategy Pattern**: Interchangeable algorithms

## Package Structure

```
monorepo/
├── apps/
│   └── be-auth/                 # Authentication service
│       ├── src/
│       │   ├── controllers/     # Express route handlers
│       │   ├── middleware/      # Express middleware
│       │   ├── routes/          # Route definitions
│       │   ├── app.ts           # App factory with DI
│       │   └── index.ts         # Entry point
│       └── package.json
│
├── packages/
│   ├── backend-core/            # Consolidated shared backend package
│   │   ├── src/
│   │   │   ├── database/        # TypeORM entities & config
│   │   │   ├── repositories/    # Data access abstractions
│   │   │   ├── services/        # Business logic
│   │   │   ├── container.ts     # DI container
│   │   │   ├── types/           # All type definitions (DTOs, entities, responses)
│   │   │   └── utils/           # Utilities (logger)
│   │   └── package.json         # All shared dependencies
│   │
│   └── eslint-config/           # Code quality
│
└── docs/
    └── backend-architecture.md  # This document
```

## Dependency Injection & Container

### BackendContainer Class

The `BackendContainer` is the central dependency injection container that manages all service dependencies.

```typescript
export class BackendContainer implements IServiceContainer {
  private _dataSource: DataSource;
  private _authService: AuthService;
  private _userService: UserService;

  constructor(private config: DatabaseConfig & JwtConfig) {
    // Initialize TypeORM data source
    this._dataSource = createDataSource(config);

    // Initialize repositories
    const userRepository = new UserRepository(
      this._dataSource.getRepository(User)
    );
    const sessionRepository = new SessionRepository(
      this._dataSource.getRepository(Session)
    );

    // Initialize services with dependencies
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

  get authService(): AuthService {
    return this._authService;
  }
  get userService(): UserService {
    return this._userService;
  }
}
```

### Usage in Application

```typescript
// apps/be-auth/src/index.ts
const container = new BackendContainer({
  // Database config
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  // JWT config
  accessToken: { secret: process.env.JWT_ACCESS_SECRET, expiresIn: "15m" },
  refreshToken: { secret: process.env.JWT_REFRESH_SECRET, expiresIn: "7d" },
});

await container.initialize();

const app = createApp(container);
app.listen(4001);
```

## Data Layer (Repositories)

### Repository Pattern Implementation

The repository pattern abstracts data access, providing a clean interface for data operations.

#### Repository Interface

```typescript
// packages/backend-core/src/repositories/interfaces/IUserRepository.ts
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: Partial<User>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  getUsers(page: number, limit: number): Promise<PaginatedUsers>;
}
```

#### TypeORM Implementation

```typescript
// packages/backend-core/src/repositories/implementations/UserRepository.ts
export class UserRepository implements IUserRepository {
  constructor(private repository: Repository<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async getUsers(page: number, limit: number): Promise<PaginatedUsers> {
    const [users, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }
}
```

### TypeORM Entities

Entities represent database tables with TypeORM decorators.

```typescript
// packages/backend-core/src/database/entities/User.ts
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 255, type: "varchar" })
  email!: string;

  @Column({ length: 255, type: "varchar" })
  password_hash!: string;

  @Column({ name: "first_name", length: 100, type: "varchar" })
  firstName!: string;

  @Column({ name: "last_name", length: 100, type: "varchar" })
  lastName!: string;

  @Column({ name: "is_active", default: true, type: "boolean" })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions!: Session[];
}
```

## Service Layer

### Service Classes

Services contain business logic and orchestrate repository operations.

```typescript
// packages/backend-core/src/services/AuthService.ts
export class AuthService extends BaseService {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private jwtConfig: JwtConfig
  ) {
    super();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    return this.userRepository.create({
      email: userData.email,
      password_hash: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
  }

  async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    const user = await this.findUserByEmail(credentials.email);
    if (!user) return null;

    const isValidPassword = await this.verifyPassword(
      credentials.password,
      user.password_hash
    );
    return isValidPassword ? user : null;
  }
}
```

### Base Service Class

```typescript
// packages/backend-core/src/services/BaseService.ts
export abstract class BaseService {
  // Common service utilities and error handling
  protected handleError(error: Error, operation: string): never {
    // Centralized error handling logic
    throw new Error(`${operation} failed: ${error.message}`);
  }
}
```

## Presentation Layer (Controllers)

### Express Controllers

Controllers handle HTTP requests and responses, delegating business logic to services.

```typescript
// apps/be-auth/src/controllers/auth.controller.ts
export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { email, password }: LoginDto = req.body;

    try {
      const user = await this.authService.findUserByEmail(email);
      if (!user) {
        // Handle user not found
        return res
          .status(401)
          .json({ success: false, error: "Invalid credentials" });
      }

      const isValidPassword = await this.authService.verifyPassword(
        password,
        user.password_hash
      );

      if (!isValidPassword) {
        // Handle invalid password
        return res
          .status(401)
          .json({ success: false, error: "Invalid credentials" });
      }

      // Generate tokens and create session
      const [accessToken, refreshToken] = await Promise.all([
        this.authService.createAccessToken(user),
        this.authService.createRefreshToken(user),
      ]);

      await this.authService.createUserSession(user.id, refreshToken);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
      };

      res.json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Error handling
      res.status(500).json({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
```

### Route Factories

Routes are created as factories to inject controller dependencies.

```typescript
// apps/be-auth/src/routes/auth.routes.ts
export const createAuthRoutes = (
  authController: AuthController,
  jwtConfig: JwtConfig
) => {
  const router: Router = Router();
  const authenticateToken = createAuthMiddleware(jwtConfig);

  router.post(
    "/login",
    validateLogin,
    handleValidationErrors,
    (req: any, res: any) => authController.login(req, res)
  );

  router.post(
    "/register",
    validateRegister,
    handleValidationErrors,
    (req: any, res: any) => authController.register(req, res)
  );

  router.post("/logout", authenticateToken, (req: any, res: any) =>
    authController.logout(req, res)
  );

  return router;
};
```

## Infrastructure Layer

### Database Configuration

```typescript
// packages/backend-core/src/database/config.ts
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export const createDataSource = (config: DatabaseConfig) => {
  return new DataSource({
    type: "postgres",
    ...config,
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
    entities: [User, Session],
    migrations: ["dist/migrations/*.js"],
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  });
};
```

### Application Factory

```typescript
// apps/be-auth/src/app.ts
export const createApp = (container: BackendContainer) => {
  const app: express.Application = express();

  // Middleware setup
  app.use(requestLoggingMiddleware);
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Create controllers with services
  const authController = new AuthController(container.authService);
  const userController = new UserController(container.userService);

  // JWT config for middleware
  const jwtConfig = {
    /* JWT configuration */
  };

  // Setup routes
  const authRoutes = createAuthRoutes(authController, jwtConfig);
  const userRoutes = createUserRoutes(userController, jwtConfig);

  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);

  // Error handling
  app.use(errorLoggingMiddleware);
  app.use((err: Error, req: Request, res: Response) => {
    // Global error handler
  });

  return app;
};
```

## Cross-Cutting Concerns

### Logging

Winston-based structured logging with service-specific loggers.

```typescript
// packages/backend-core/src/utils/logger.ts
export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
      }),
      new winston.transports.File({
        filename: "logs/combined.log",
      }),
    ],
  });
};
```

### Authentication Middleware

JWT token validation middleware.

```typescript
// apps/be-auth/src/middleware/auth.middleware.ts
export const createAuthMiddleware = (jwtConfig: JwtConfig) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        res
          .status(401)
          .json({ success: false, error: "Access token required" });
        return;
      }

      const secret = new TextEncoder().encode(jwtConfig.accessToken.secret);
      const { payload } = await jwtVerify(token, secret);

      req.user = {
        id: payload.sub as string,
        email: payload.email as string,
      };

      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        error: "Invalid or expired token",
      });
    }
  };
};
```

### Request/Response Logging

HTTP request and response logging middleware.

```typescript
// apps/be-auth/src/middleware/logger.middleware.ts
export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  logger.http("Incoming Request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers["User-Agent"],
  });

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info("Request Completed", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
```

## Error Handling

### Service Layer Error Handling

```typescript
// packages/backend-core/src/services/AuthService.ts
async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  try {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      return null; // User not found is not an error
    }

    const isValidPassword = await this.verifyPassword(
      credentials.password,
      user.password_hash
    );

    if (!isValidPassword) {
      return null; // Invalid password is not an error
    }

    return user;
  } catch (error) {
    // Log unexpected errors
    this.logger.error("Authentication error", { error: error.message, email: credentials.email });
    throw error; // Re-throw for controller to handle
  }
}
```

### Controller Error Handling

```typescript
// apps/be-auth/src/controllers/auth.controller.ts
async login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await this.authService.authenticateUser({ email, password });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Generate tokens and respond
    const tokens = await this.generateTokens(user);
    res.json({ success: true, data: tokens });

  } catch (error) {
    logger.error("Login error", {
      error: error.message,
      stack: error.stack,
      email,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}
```

## Testing Strategy

### Unit Testing

```typescript
// __tests__/services/AuthService.test.ts
describe("AuthService", () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let authService: AuthService;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    authService = new AuthService(
      mockUserRepository,
      mockSessionRepository,
      jwtConfig
    );
  });

  it("should authenticate valid user", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      password_hash: "hash",
    };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await authService.authenticateUser({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual(mockUser);
  });
});
```

### Integration Testing

```typescript
// __tests__/integration/auth.integration.test.ts
describe("Auth API", () => {
  let container: BackendContainer;
  let app: express.Application;

  beforeAll(async () => {
    container = new BackendContainer(testConfig);
    await container.initialize();
    app = createApp(container);
  });

  it("should login user", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "password123" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("accessToken");
  });
});
```

## Deployment & Scaling

### Environment Configuration

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=shonchoy_auth

# JWT
JWT_ACCESS_SECRET=your-super-secure-access-token-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-token-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Service
PORT=4001
NODE_ENV=production
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 4001

CMD ["npm", "start"]
```

### Horizontal Scaling

- **Stateless Services**: All services are stateless and can be scaled horizontally
- **Database Connection Pooling**: TypeORM handles connection pooling
- **Session Storage**: Refresh tokens stored in PostgreSQL
- **Load Balancing**: Services can be load balanced at the APISIX level

### Monitoring & Observability

```typescript
// Structured logging for monitoring
logger.info("User authenticated", {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
  service: "auth-service",
  operation: "login",
});
```

## Conclusion

This consolidated architecture provides:

1. **Simplified Package Management**: Single `@workspace/backend-core` package instead of 4+ separate packages
2. **Scalability**: Clean separation allows independent scaling of layers
3. **Maintainability**: Dependency injection and interfaces make changes safe
4. **Testability**: Each layer can be tested in isolation
5. **Reusability**: Backend-core can be used across multiple services
6. **Type Safety**: Full TypeScript coverage prevents runtime errors
7. **Performance**: Optimized database queries and connection pooling
8. **Monitoring**: Structured logging and error handling

### Migration Benefits Achieved

- ✅ **Eliminated 2 packages**: `auth-types` and `common-dtos` consolidated into `backend-core`
- ✅ **Reduced complexity**: Fewer packages to maintain and understand
- ✅ **Better organization**: All backend concerns in one cohesive package
- ✅ **Easier onboarding**: New developers only need to understand one shared package
- ✅ **Simplified dependencies**: Fewer workspace package dependencies to manage

The architecture follows domain-driven design principles and can easily accommodate future requirements like OAuth, multi-factor authentication, and microservice communication.
