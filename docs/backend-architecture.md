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
9. [Authentication Architecture](#authentication-architecture)
10. [Error Handling](#error-handling)
11. [Testing Strategy](#testing-strategy)
12. [Deployment & Scaling](#deployment--scaling)

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
- **Strategy Pattern**: Interchangeable algorithms (used in Passport.js authentication)
- **Middleware Pattern**: Request/response processing pipeline

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

## Authentication Architecture

### Passport.js Integration

The authentication system uses Passport.js as the authentication middleware framework, providing a flexible strategy-based approach to user authentication. This allows for easy integration of multiple authentication methods including traditional email/password and OAuth providers.

#### Strategy Pattern Implementation

```typescript
// apps/be-auth/src/config/passport.ts
export const configurePassport = (
  authService: AuthService,
  jwtConfig: JwtConfig
) => {
  // Local Strategy - Email/Password authentication
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email: string, password: string, done: DoneFunction) => {
        try {
          const user = await authService.authenticateUser({ email, password });
          return done(null, user || false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // JWT Strategy - Token validation
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtConfig.accessToken.secret,
      },
      async (payload: JwtPayload, done: JwtDoneFunction) => {
        try {
          const user = await authService.findUserById(payload.sub);
          return done(null, user || false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
```

#### OAuth Strategy (Conditional Configuration)

OAuth strategies are configured conditionally based on environment variables, allowing the application to work in development without OAuth credentials:

```typescript
// Google OAuth Strategy (only configured if credentials provided)
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
  process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret"
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        // OAuth user creation/linking logic
        const user = await authService.findUserByOAuthId("google", profile.id);
        if (!user) {
          // Create new user or link existing account
          const newUser = await authService.createUser({
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            oauthProvider: "google",
            oauthId: profile.id,
            emailVerified: true,
          });
          return done(null, newUser);
        }
        return done(null, user);
      }
    )
  );
}
```

### Authentication Flow

#### Traditional Authentication

1. **Client** sends login request with email/password
2. **Passport Local Strategy** validates credentials via `AuthService.authenticateUser()`
3. **JWT tokens** are generated and returned on successful authentication
4. **Client** includes Bearer token in subsequent requests
5. **Passport JWT Strategy** validates token on protected routes

#### OAuth Authentication

1. **Client** initiates OAuth flow (e.g., "Login with Google")
2. **Passport OAuth Strategy** redirects to OAuth provider
3. **OAuth Provider** handles user authentication and authorization
4. **Provider** redirects back with authorization code
5. **Strategy callback** exchanges code for user profile
6. **User creation/linking** occurs if first-time OAuth user
7. **JWT tokens** are generated and client is redirected with tokens

### Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Tokens**: HS256 signed with secure secrets
- **Token Expiration**: Separate access/refresh token lifecycles
- **OAuth State Protection**: CSRF protection via state parameter
- **Secure Defaults**: Environment-based configuration validation

### Database Schema Extensions

OAuth support required additional fields in the User entity:

```typescript
// packages/backend-core/src/database/entities/User.ts
@Entity("users")
export class User {
  // ... existing fields

  @Column({ type: "varchar", nullable: true })
  oauth_provider?: string; // 'google', 'github', 'apple'

  @Column({ type: "varchar", nullable: true })
  oauth_id?: string; // Provider-specific user ID

  @Column({ type: "boolean", default: false })
  emailVerified!: boolean; // OAuth emails are pre-verified
}
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

## New NestJS Microservices Architecture

### Overview

Building on the consolidated backend architecture, we've introduced a new NestJS-based microservice architecture that provides:

- **Modular Services**: Independent, domain-focused microservices using NestJS framework
- **Shared Utilities**: Common NestJS decorators, guards, interceptors, and filters
- **Type Safety**: Shared domain models with Zod validation schemas
- **Scalable Design**: Ready for horizontal scaling and independent deployment

### be-income Service (Income Management Microservice)

The `be-income` service is the first NestJS microservice implementing complete CRUD operations for income tracking.

#### Service Architecture

```typescript
// apps/be-income/src/income/income.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([IncomeEntity])],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
```

#### Database Entity

```typescript
// apps/be-income/src/income/entities/income.entity.ts
@Entity("incomes")
export class IncomeEntity implements Income {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: "varchar", length: 255 })
  source!: string;

  @Column({
    type: "enum",
    enum: ["weekly", "monthly", "yearly", "one-time"],
    default: "monthly",
  })
  frequency!: "weekly" | "monthly" | "yearly" | "one-time";

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "timestamptz" })
  date!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: string;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: string;
}
```

#### REST API Endpoints

The service provides a complete REST API for income management:

| Method | Endpoint      | Description                   | Auth Required |
| ------ | ------------- | ----------------------------- | ------------- |
| POST   | `/income`     | Create new income entry       | ✅ JWT        |
| GET    | `/income`     | List user incomes (paginated) | ✅ JWT        |
| GET    | `/income/:id` | Get specific income entry     | ✅ JWT        |
| PATCH  | `/income/:id` | Update income entry           | ✅ JWT        |
| DELETE | `/income/:id` | Delete income entry           | ✅ JWT        |

#### Controller Implementation

```typescript
// apps/be-income/src/income/income.controller.ts
@Controller("income")
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(
    @Body() createIncomeDto: CreateIncomeRequest,
    @CurrentUser() user: User
  ) {
    return this.incomeService.create(createIncomeDto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.incomeService.findAll(user.id, page, limit);
  }

  // ... additional CRUD methods
}
```

#### Service Layer

The service implements business logic with proper error handling and data mapping:

```typescript
// apps/be-income/src/income/income.service.ts
@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(IncomeEntity)
    private readonly incomeRepository: Repository<IncomeEntity>
  ) {}

  async create(
    createIncomeDto: CreateIncomeRequest,
    userId: string
  ): Promise<IncomeResponse> {
    const income = this.incomeRepository.create({
      ...createIncomeDto,
      userId,
      date: createIncomeDto.date || new Date().toISOString(),
    });

    const savedIncome = await this.incomeRepository.save(income);
    return this.mapToResponse(savedIncome);
  }

  // ... additional CRUD methods with user isolation
}
```

#### Authentication & Authorization

- **JWT Authentication**: Uses `@workspace/nestjs-common` JwtAuthGuard
- **User Isolation**: All operations are scoped to the authenticated user
- **Input Validation**: Leverages shared Zod schemas for request validation
- **Current User**: Uses `@CurrentUser()` decorator for user context

### @workspace/nestjs-common Package (Shared NestJS Utilities)

The `@workspace/nestjs-common` package provides reusable NestJS utilities that can be shared across all microservices, promoting consistency and reducing code duplication.

#### Package Structure

```
packages/nestjs-common/src/
├── decorators/
│   ├── current-user.decorator.ts    # @CurrentUser() decorator
│   ├── public.decorator.ts          # @Public() decorator for public routes
│   └── index.ts                     # Export all decorators
├── guards/
│   ├── jwt-auth.guard.ts            # JWT authentication guard
│   └── index.ts                     # Export guards
├── interceptors/
│   ├── logging.interceptor.ts       # Request logging interceptor
│   ├── transform.interceptor.ts     # Response transformation interceptor
│   └── index.ts                     # Export interceptors
├── filters/
│   ├── http-exception.filter.ts     # HTTP exception filter
│   ├── all-exceptions.filter.ts     # Global exception filter
│   └── index.ts                     # Export filters
└── index.ts                         # Main package exports
```

#### Decorators

##### @CurrentUser() Decorator

Extracts the authenticated user from the request object:

```typescript
// packages/nestjs-common/src/decorators/current-user.decorator.ts
import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
```

**Usage:**

```typescript
@Controller("income")
@UseGuards(JwtAuthGuard)
export class IncomeController {
  @Post()
  create(
    @Body() createIncomeDto: CreateIncomeRequest,
    @CurrentUser() user: User // Automatically injects authenticated user
  ) {
    return this.incomeService.create(createIncomeDto, user.id);
  }
}
```

##### @Public() Decorator

Marks routes as public (no authentication required):

```typescript
// packages/nestjs-common/src/decorators/public.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Usage:**

```typescript
@Controller("auth")
export class AuthController {
  @Public() // This route doesn't require authentication
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    // Login logic
  }
}
```

#### Guards

##### JwtAuthGuard

Extends Passport's AuthGuard to provide JWT authentication with public route support:

```typescript
// packages/nestjs-common/src/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip authentication for public routes
    }

    return super.canActivate(context) as any;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException("Invalid or expired token");
    }
    return user;
  }
}
```

#### Interceptors

##### LoggingInterceptor

Logs incoming requests and their completion:

```typescript
// packages/nestjs-common/src/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    console.log(`Incoming Request: ${request.method} ${request.url}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(
          `Request Completed: ${request.method} ${request.url} - ${duration}ms`
        );
      })
    );
  }
}
```

##### TransformInterceptor

Standardizes API responses with consistent structure:

```typescript
// packages/nestjs-common/src/interceptors/transform.interceptor.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: any) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}
```

#### Exception Filters

##### HttpExceptionFilter

Handles HTTP exceptions with consistent error responses:

```typescript
// packages/nestjs-common/src/filters/http-exception.filter.ts
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      error: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

##### AllExceptionsFilter

Catches all unhandled exceptions:

```typescript
// packages/nestjs-common/src/filters/all-exceptions.filter.ts
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.error("Unhandled exception:", exception);

    response.status(500).json({
      success: false,
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
}
```

#### Usage in Services

```typescript
// apps/be-income/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global guards
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3001);
}
bootstrap();
```

### @workspace/shared-domain Package (Shared Domain Models)

The `@workspace/shared-domain` package provides shared TypeScript types, interfaces, and Zod validation schemas that ensure type safety and data validation consistency across all services and the frontend.

#### Package Structure

```
packages/shared-domain/src/
├── entities/
│   ├── user.entity.ts         # User domain model
│   ├── income.entity.ts       # Income domain model
│   ├── expense.entity.ts      # Expense domain model
│   └── index.ts               # Export all entities
├── dtos/
│   ├── auth.dto.ts            # Authentication DTOs
│   ├── income.dto.ts          # Income operation DTOs
│   ├── expense.dto.ts         # Expense operation DTOs
│   └── index.ts               # Export all DTOs
├── validators/
│   ├── auth.validator.ts      # Authentication validation schemas
│   └── index.ts               # Export validators
└── index.ts                   # Main package exports
```

#### Domain Entities

##### User Entity

```typescript
// packages/shared-domain/src/entities/user.entity.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  oauthProvider?: string;
  oauthId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

##### Income Entity

```typescript
// packages/shared-domain/src/entities/income.entity.ts
export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: string;
  frequency: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeCreate {
  amount: number;
  source: string;
  frequency: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date?: string;
}

export interface IncomeUpdate {
  amount?: number;
  source?: string;
  frequency?: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date?: string;
}
```

##### Expense Entity

```typescript
// packages/shared-domain/src/entities/expense.entity.ts
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCreate {
  amount: number;
  category: string;
  description?: string;
  date?: string;
  tags?: string[];
}

export interface ExpenseUpdate {
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  tags?: string[];
}
```

#### Data Transfer Objects (DTOs)

##### Authentication DTOs

```typescript
// packages/shared-domain/src/dtos/auth.dto.ts
import { z } from "zod";

// Request DTOs
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Response DTOs
export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: AuthTokensSchema,
  timestamp: z.string().datetime(),
});

// Type exports
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
```

##### Income DTOs

```typescript
// packages/shared-domain/src/dtos/income.dto.ts
import { z } from "zod";

// Validation schemas
export const CreateIncomeRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  source: z.string().min(1, "Source is required"),
  frequency: z.enum(["weekly", "monthly", "yearly", "one-time"]),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

export const UpdateIncomeRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  source: z.string().min(1, "Source is required").optional(),
  frequency: z.enum(["weekly", "monthly", "yearly", "one-time"]).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

// Response schemas
export const IncomeResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  source: z.string(),
  frequency: z.enum(["weekly", "monthly", "yearly", "one-time"]),
  description: z.string().nullable(),
  date: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const IncomeListResponseSchema = z.object({
  incomes: z.array(IncomeResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Type exports
export type CreateIncomeRequest = z.infer<typeof CreateIncomeRequestSchema>;
export type UpdateIncomeRequest = z.infer<typeof UpdateIncomeRequestSchema>;
export type IncomeResponse = z.infer<typeof IncomeResponseSchema>;
export type IncomeListResponse = z.infer<typeof IncomeListResponseSchema>;
```

#### Validation Schemas

##### Authentication Validators

```typescript
// packages/shared-domain/src/validators/auth.validator.ts
import { z } from "zod";

// Common validation patterns
export const emailSchema = z.string().email("Invalid email format");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const jwtTokenSchema = z.string().min(1, "Token is required");

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// ID validation
export const uuidSchema = z.string().uuid("Invalid UUID format");
```

#### Usage Across Services

```typescript
// In NestJS controllers
import type {
  CreateIncomeRequest,
  IncomeResponse,
  UpdateIncomeRequest,
  User,
} from "@workspace/shared-domain";

@Controller("income")
@UseGuards(JwtAuthGuard)
export class IncomeController {
  @Post()
  create(
    @Body() createIncomeDto: CreateIncomeRequest, // Type-safe DTO
    @CurrentUser() user: User // Type-safe user
  ): Promise<IncomeResponse> {
    // Type-safe response
    return this.incomeService.create(createIncomeDto, user.id);
  }
}
```

#### Benefits

- **Type Safety**: Ensures consistent typing across backend services and frontend
- **Validation**: Zod schemas provide runtime validation and TypeScript inference
- **DRY Principle**: Single source of truth for domain models and DTOs
- **API Contracts**: Clear interfaces for API communication
- **Developer Experience**: IntelliSense and compile-time error checking

The architecture follows domain-driven design principles and can easily accommodate future requirements like OAuth, multi-factor authentication, and microservice communication.
