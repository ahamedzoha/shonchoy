# Shonchoy Authentication & Authorization Microservice

A robust, scalable authentication service built with Express.js, TypeScript, and PostgreSQL, designed for the Shonchoy personal finance platform. Features complete JWT authentication, user management, and seamless integration with Apache APISIX for API versioning.

This service leverages the consolidated `@workspace/backend-core` package for shared business logic, database entities, and dependency injection patterns.

## Features

- 🔐 **JWT-based Authentication** - Access and refresh tokens with secure database storage
- 🔑 **OAuth Integration** - Google OAuth with conditional configuration (GitHub/Apple ready)
- 👤 **User Management** - Registration, login, profile management with TypeScript interfaces
- 🛡️ **Security First** - bcryptjs password hashing, JWT validation, OAuth state protection, rate limiting via APISIX
- 📊 **API Versioning** - Clean v1/v2 endpoint management via Apache APISIX gateway
- 🔄 **Session Management** - Secure refresh token handling with database persistence
- 🏗️ **Clean Architecture** - Dependency injection, repository pattern, and service layer separation
- 📦 **Shared Architecture** - Reusable `@workspace/backend-core` package across all backend services
- 🐳 **Docker Ready** - Complete containerized development environment
- 📝 **Type-Safe** - Full TypeScript coverage with shared interfaces
- 🎯 **Development Friendly** - Conditional OAuth (works without provider credentials)
- 🔧 **Centralized Configuration** - Single `.env` file at monorepo root

## Architecture

### Application Architecture

```
apps/be-auth/
├── src/
│   ├── controllers/      # Express route handlers
│   │   ├── auth.controller.ts    # Auth endpoints (login/register/refresh)
│   │   └── user.controller.ts    # User management endpoints
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── logger.middleware.ts  # Request/response logging
│   │   └── validation.middleware.ts  # Input validation
│   ├── routes/           # Route definitions
│   │   ├── auth.routes.ts        # Auth routes (/auth/*)
│   │   ├── user.routes.ts        # User routes (/users/*)
│   │   └── index.ts              # Route exports
│   ├── app.ts            # Express application setup with DI
│   └── index.ts          # Application entry point
└── package.json         # Service-specific dependencies
```

### Shared Backend-Core Package

```
packages/backend-core/
├── src/
│   ├── database/         # TypeORM entities & configuration
│   │   ├── entities/     # User, Session entities
│   │   └── config.ts     # Database & JWT configuration
│   ├── repositories/     # Data access layer
│   │   ├── interfaces/   # Repository contracts
│   │   └── implementations/ # TypeORM implementations
│   ├── services/         # Business logic layer
│   │   ├── AuthService.ts    # Authentication logic
│   │   ├── UserService.ts    # User management logic
│   │   └── BaseService.ts    # Common service utilities
│   ├── types/            # Shared type definitions
│   ├── utils/            # Logger factory
│   ├── container.ts      # Dependency injection container
│   └── index.ts          # Package exports
└── package.json         # Shared dependencies (TypeORM, bcrypt, etc.)
```

### Shared Packages

- **`@workspace/backend-core`** - Consolidated backend package containing:
  - TypeORM entities and database configuration
  - Repository pattern implementations
  - Business logic services (AuthService, UserService)
  - Dependency injection container
  - API DTOs, response types, and validation schemas
  - Logger utilities and cross-cutting concerns

## API Endpoints

### Authentication (`/v1/auth/*`)

| Method | Endpoint                   | Description                 | Auth Required |
| ------ | -------------------------- | --------------------------- | ------------- |
| POST   | `/v1/auth/login`           | User login (email/password) | No            |
| POST   | `/v1/auth/register`        | User registration           | No            |
| POST   | `/v1/auth/refresh`         | Refresh access token        | No            |
| POST   | `/v1/auth/logout`          | User logout                 | Yes           |
| GET    | `/v1/auth/google`          | Google OAuth initiation     | No            |
| GET    | `/v1/auth/google/callback` | Google OAuth callback       | No            |

### User Management (`/v1/users/*`)

| Method | Endpoint            | Description         | Auth Required |
| ------ | ------------------- | ------------------- | ------------- |
| GET    | `/v1/users/profile` | Get user profile    | Yes           |
| PUT    | `/v1/users/profile` | Update user profile | Yes           |
| GET    | `/v1/users`         | List users (admin)  | Yes           |

### Health Check

| Method | Endpoint     | Description          | Auth Required |
| ------ | ------------ | -------------------- | ------------- |
| GET    | `/v1/health` | Service health check | No            |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm package manager

### Quick Start with Docker

1. **Start the development environment:**

   ```bash
   # Start PostgreSQL, APISIX, and ETCD
   docker-compose up -d

   # Verify services are running
   docker-compose ps
   ```

2. **Install dependencies:**

   ```bash
   cd apps/be-auth
   pnpm install
   ```

3. **Set up environment variables:**

   ```bash
   # The .env file is already configured in the monorepo root
   # Ensure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set to real 32+ character secrets
   # The app will validate all environment variables at startup and fail gracefully if misconfigured
   ```

4. **Start the auth service:**

   ```bash
   pnpm dev
   ```

   The service will perform environment validation on startup. If validation fails, you'll see clear error messages explaining what's wrong.

The service will be available at `http://localhost:4001`

## Testing the API

### Health Check

```bash
curl http://localhost:4001/health
```

### Authentication Flow

1. **Register a new user:**

```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

2. **Login and get tokens:**

```bash
# Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }')

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
```

3. **Access protected endpoints:**

```bash
# Get user profile
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:4001/users/profile

# List users (admin endpoint)
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:4001/users?page=1&limit=10"
```

4. **Refresh token:**

```bash
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.refreshToken')

curl -X POST http://localhost:4001/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

### Manual Setup (Alternative)

If you prefer not to use Docker:

1. **Install PostgreSQL 16+ locally**
2. **Create database:**

   ```sql
   CREATE DATABASE shonchoy_auth;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE shonchoy_auth TO postgres;
   ```

3. **Run database migrations:**

   ```bash
   # The init script will create tables automatically
   docker exec shonchoy-postgres-1 psql -U postgres -d shonchoy_auth -f /docker-entrypoint-initdb.d/init-database.sql
   ```

4. **Configure APISIX (optional):**

   ```bash
   ./scripts/import_apisix_config.sh
   ```

## API Versioning

This service uses API versioning through Apache APISIX:

- **v1** - Current stable version
- **v2** - Future version (planned)

Version routing is handled by APISIX, allowing seamless upgrades and backward compatibility.

## Authentication Flow

1. **Registration/Login** → Returns access + refresh tokens
2. **API Requests** → Include `Authorization: Bearer <access_token>`
3. **Token Refresh** → Use refresh token to get new access token
4. **Logout** → Revoke refresh token

## Security Features

- **Password Hashing** - bcrypt with 12 salt rounds
- **JWT Tokens** - HS256 signed with configurable secrets
- **Rate Limiting** - Via APISIX plugins
- **Input Validation** - express-validator middleware
- **CORS Protection** - Configured for allowed origins
- **Helmet Security** - Security headers

## Development

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm check-types` - Run TypeScript type checking

### Testing

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
```

## Environment Variables

The application uses comprehensive environment variable validation that ensures all required variables are properly configured before startup. The app will fail to start with clear error messages if any required variables are missing or invalid.

### Required Variables (Development)

| Variable             | Description              | Validation Requirements                                   |
| -------------------- | ------------------------ | --------------------------------------------------------- |
| `ENVIRONMENT`        | Deployment environment   | Must be "development", "production", or "test"            |
| `DB_HOST`            | PostgreSQL host          | Required, non-empty string                                |
| `DB_PORT`            | PostgreSQL port          | Integer 1-65535, default 5432                             |
| `DB_NAME`            | Database name            | Required, non-empty string                                |
| `DB_USER`            | Database user            | Required, non-empty string                                |
| `DB_PASSWORD`        | Database password        | Required, non-empty string                                |
| `JWT_ACCESS_SECRET`  | JWT access token secret  | **Must be at least 32 characters, cannot be placeholder** |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | **Must be at least 32 characters, cannot be placeholder** |

### Optional Variables

| Variable                 | Description                  | Default                 | Notes                               |
| ------------------------ | ---------------------------- | ----------------------- | ----------------------------------- |
| `PORT`                   | Server port                  | `4001`                  | Integer 1-65535                     |
| `BASE_URL`               | Base URL for the application | `http://localhost:4001` | Must be valid URL                   |
| `JWT_ACCESS_EXPIRES_IN`  | Access token expiry          | `15m`                   | JWT duration string                 |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry         | `7d`                    | JWT duration string                 |
| `NODE_ENV`               | Node environment             | `development`           | "development", "production", "test" |

### OAuth Configuration (Optional)

Google OAuth is automatically enabled when valid credentials are provided:

| Variable               | Description                | Requirements                   |
| ---------------------- | -------------------------- | ------------------------------ |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     | Must not be placeholder values |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Must not be placeholder values |

**Note:** OAuth routes are only registered when valid credentials are configured. Invalid or placeholder credentials will disable OAuth entirely.

### APISIX Configuration (Optional)

APISIX integration is enabled when all gateway variables are configured:

| Variable            | Description           |
| ------------------- | --------------------- |
| `APISIX_ADMIN_KEY`  | APISIX admin API key  |
| `APISIX_VIEWER_KEY` | APISIX viewer API key |
| `ETCD_HOST`         | ETCD cluster endpoint |

### Environment Validation

The application performs strict validation at startup:

- **Early Validation**: All environment variables are validated before any other initialization
- **Clear Error Messages**: Invalid configurations show specific error messages
- **Graceful Failure**: App exits with code 1 and helpful guidance when validation fails
- **Environment-Specific Rules**: Different validation rules for development/production/test

**Example validation error:**

```
❌ Environment Configuration Error
=================================
JWT_ACCESS_SECRET must be at least 32 characters long
JWT_REFRESH_SECRET must be set to a real secret, not a placeholder

Please check your .env file and ensure all required variables are set correctly.
```

## Contributing

1. Follow the established folder structure
2. Use shared types from `@workspace/*` packages
3. Add tests for new features
4. Update API documentation
5. Ensure TypeScript types are correct

## Current Implementation Status

✅ **Completed Features:**

- **Complete Authentication System:**
  - JWT-based authentication with access/refresh tokens
  - Google OAuth integration with conditional configuration
  - Passport.js strategy pattern implementation
  - Bcryptjs password hashing with configurable salt rounds
  - Secure token storage and validation

- **User Management:**
  - User registration and login endpoints
  - Protected user profile and user listing endpoints
  - OAuth user creation and account linking
  - Email verification support for OAuth users

- **Database & Architecture:**
  - PostgreSQL database with TypeORM entities and migrations
  - Consolidated `@workspace/backend-core` package
  - Dependency injection container with clean architecture
  - Repository pattern with TypeORM implementations
  - Service layer with business logic separation

- **API Gateway Integration:**
  - Apache APISIX gateway with JWT validation
  - Public/private route segregation
  - WSL2-compatible configuration scripts
  - Secure API routing with consumer authentication

- **Development & Deployment:**
  - Docker Compose setup with PostgreSQL, APISIX, and ETCD
  - Centralized environment configuration
  - TypeScript interfaces and shared packages
  - Health check endpoint and monitoring
  - Token refresh functionality with database persistence

- **Security & Quality:**
  - Clean separation of concerns (controllers, services, repositories)
  - Winston-based structured logging
  - ESLint and TypeScript strict mode compliance
  - Conditional OAuth (development-friendly)
  - CSRF protection via OAuth state parameters

- **Environment Configuration & Validation:**
  - Comprehensive environment variable validation with Zod schemas
  - Early validation that fails gracefully with clear error messages
  - Environment-specific validation rules (development/production/test)
  - Automatic OAuth and APISIX feature detection
  - Secure JWT secret validation (no placeholder values allowed)

🚧 **In Development:**

- Input validation middleware (express-validator)
- Comprehensive test suite with unit/integration tests
- API documentation generation (OpenAPI/Swagger)
- Database migration scripts and seeding
- Rate limiting via APISIX plugins

📋 **Future Enhancements:**

- Additional OAuth providers (GitHub, Apple - infrastructure ready)
- Multi-factor authentication (2FA)
- Password reset functionality
- Admin user management and RBAC
- Audit logging and monitoring
- API rate limiting and caching
- Service mesh integration
- Email/SMS notifications

## License

This project is part of the Shonchoy platform.
