# Shonchoy Authentication & Authorization Microservice

A robust, scalable authentication service built with Express.js, TypeScript, and PostgreSQL, designed for the Shonchoy personal finance platform. Features complete JWT authentication, user management, and seamless integration with Apache APISIX for API versioning.

## Features

- 🔐 **JWT-based Authentication** - Access and refresh tokens with secure database storage
- 👤 **User Management** - Registration, login, profile management with TypeScript interfaces
- 🛡️ **Security First** - bcryptjs password hashing, JWT validation, rate limiting via APISIX
- 📊 **API Versioning** - Clean v1/v2 endpoint management via Apache APISIX gateway
- 🔄 **Session Management** - Secure refresh token handling with database persistence
- 📦 **Shared Architecture** - Reusable types and DTOs across the monorepo
- 🐳 **Docker Ready** - Complete containerized development environment
- 📝 **Type-Safe** - Full TypeScript coverage with shared interfaces

## Architecture

### Folder Structure

```
src/
├── config/           # Database & JWT configuration
│   ├── database.ts   # PostgreSQL connection pool
│   ├── jwt.ts        # JWT configuration
│   └── index.ts      # Configuration exports
├── controllers/      # Route handlers
│   ├── auth.controller.ts    # Auth endpoints (login/register/refresh)
│   ├── user.controller.ts    # User management endpoints
│   └── index.ts      # Controller exports
├── middleware/       # Custom middleware
│   ├── auth.middleware.ts    # JWT authentication
│   ├── validation.middleware.ts  # Input validation (future)
│   └── index.ts      # Middleware exports
├── routes/          # Route definitions
│   ├── auth.routes.ts        # Auth routes (/auth/*)
│   ├── user.routes.ts        # User routes (/users/*)
│   └── index.ts      # Route exports
├── services/        # Business logic layer
│   ├── auth.service.ts       # Authentication logic
│   ├── user.service.ts       # User management logic
│   └── index.ts      # Service exports
├── types/           # Local type extensions
│   ├── auth.types.ts         # Auth-specific types
│   └── index.ts      # Type exports
├── utils/           # Utilities
│   ├── logger.ts    # Logging utilities
│   └── index.ts     # Utility exports
├── app.ts           # Express application setup
└── index.ts         # Application entry point
```

### Shared Packages

- **`@workspace/auth-types`** - Authentication interfaces, DTOs, and entities
- **`@workspace/common-dtos`** - Generic response types and validation schemas
- **`@workspace/database-entities`** - Database table schemas and types

## API Endpoints

### Authentication (`/v1/auth/*`)

| Method | Endpoint            | Description          | Auth Required |
| ------ | ------------------- | -------------------- | ------------- |
| POST   | `/v1/auth/login`    | User login           | No            |
| POST   | `/v1/auth/register` | User registration    | No            |
| POST   | `/v1/auth/refresh`  | Refresh access token | No            |
| POST   | `/v1/auth/logout`   | User logout          | Yes           |

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
   cp .env.example .env
   # The .env file is already configured for Docker development
   ```

4. **Start the auth service:**

   ```bash
   pnpm dev
   ```

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

| Variable                 | Description              | Default         |
| ------------------------ | ------------------------ | --------------- |
| `PORT`                   | Server port              | `4001`          |
| `DB_HOST`                | PostgreSQL host          | `localhost`     |
| `DB_PORT`                | PostgreSQL port          | `5432`          |
| `DB_NAME`                | Database name            | `shonchoy_auth` |
| `DB_USER`                | Database user            | `postgres`      |
| `DB_PASSWORD`            | Database password        | `password`      |
| `JWT_ACCESS_SECRET`      | JWT access token secret  | Required        |
| `JWT_REFRESH_SECRET`     | JWT refresh token secret | Required        |
| `JWT_ACCESS_EXPIRES_IN`  | Access token expiry      | `15m`           |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry     | `7d`            |
| `APISIX_ADMIN_KEY`       | APISIX admin API key     | Required        |
| `APISIX_VIEWER_KEY`      | APISIX viewer API key    | Required        |
| `ETCD_HOST`              | ETCD cluster endpoint    | `etcd:2379`     |
| `ENVIRONMENT`            | Deployment environment   | `development`   |

## Contributing

1. Follow the established folder structure
2. Use shared types from `@workspace/*` packages
3. Add tests for new features
4. Update API documentation
5. Ensure TypeScript types are correct

## Current Implementation Status

✅ **Completed Features:**

- Complete JWT authentication with access/refresh tokens
- User registration and login with bcryptjs password hashing
- Protected user profile and user listing endpoints
- PostgreSQL database with proper schema and migrations
- Docker Compose setup with PostgreSQL, APISIX, and ETCD
- TypeScript interfaces and shared packages
- Health check endpoint
- Token refresh functionality
- Session management with database persistence

🚧 **In Development:**

- Input validation middleware (express-validator)
- Rate limiting via APISIX plugins
- Comprehensive test suite
- API documentation generation

📋 **Future Enhancements:**

- OAuth integration (Google, Apple)
- Multi-factor authentication
- Password reset functionality
- Admin user management
- Audit logging

## License

This project is part of the Shonchoy platform.
