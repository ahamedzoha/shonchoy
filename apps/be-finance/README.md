# Shonchoy Finance Microservice

A consolidated finance tracking service built with NestJS, handling income, expenses, assets, liabilities, and budget calculations for the Shonchoy personal finance platform.

## Overview

The Finance service is the core financial data management microservice in the Shonchoy platform. It consolidates all financial tracking functionality into a single, modular service with clear domain boundaries.

### Why Consolidated?

This service consolidates multiple financial domains (income, expenses, assets, liabilities, budgets) because they are highly coupled:

- **Budget calculations** require atomic reads across income and expenses
- **Net worth calculations** aggregate assets and liabilities
- **Dashboard queries** need data from all financial entities
- **Transaction boundaries** ensure data consistency across related domains

This architecture provides:

- ✅ Efficient cross-domain queries without network overhead
- ✅ Atomic transactions across related financial data
- ✅ Simplified deployment and monitoring
- ✅ Modular code organization with NestJS modules
- ✅ Cost-effective scaling for 10K-100K users

## Architecture

### Module Structure

```
apps/be-finance/
├── src/
│   ├── income/              # Income tracking module
│   │   ├── income.controller.ts
│   │   ├── income.service.ts
│   │   ├── income.module.ts
│   │   └── entities/
│   │       └── income.entity.ts
│   ├── expenses/            # Expense tracking module (placeholder)
│   │   ├── expenses.controller.ts
│   │   ├── expenses.service.ts
│   │   ├── expenses.module.ts
│   │   └── entities/
│   │       └── expense.entity.ts
│   ├── assets/              # Asset management module (placeholder)
│   │   ├── assets.controller.ts
│   │   ├── assets.service.ts
│   │   ├── assets.module.ts
│   │   └── entities/
│   │       └── asset.entity.ts
│   ├── liabilities/         # Liability tracking module (placeholder)
│   │   ├── liabilities.controller.ts
│   │   ├── liabilities.service.ts
│   │   ├── liabilities.module.ts
│   │   └── entities/
│   │       └── liability.entity.ts
│   ├── budget/              # Budget calculation module (placeholder)
│   │   ├── budget.controller.ts
│   │   ├── budget.service.ts
│   │   ├── budget.module.ts
│   │   └── entities/
│   │       └── budget.entity.ts
│   ├── auth/                # JWT authentication module
│   │   ├── auth.module.ts
│   │   └── jwt.strategy.ts
│   ├── app.module.ts        # Root application module
│   └── main.ts              # Application entry point
└── package.json
```

### Technology Stack

- **Framework**: NestJS 11+ with TypeScript
- **Database**: PostgreSQL 16+ with TypeORM
- **Authentication**: JWT via @workspace/nestjs-common
- **Validation**: class-validator & class-transformer
- **API Gateway**: Apache APISIX (external)

### Shared Packages

- `@workspace/nestjs-common` - Shared NestJS utilities (guards, interceptors, decorators)
- `@workspace/shared-domain` - Type-safe domain models and DTOs

## Features

### ✅ Implemented: Income Module

Full CRUD operations for income tracking:

- Create income entries with amount, source, frequency
- List incomes with pagination (page, limit)
- Get individual income by ID
- Update income entries
- Delete income entries
- User isolation (all operations scoped to authenticated user)

### 🚧 Placeholder Modules

The following modules have entity definitions and module structure in place, ready for implementation:

- **Expenses**: Track spending by category with recurring expense support
- **Assets**: Manage financial assets with type and value tracking
- **Liabilities**: Track loans, credit cards, mortgages with interest rates
- **Budget**: Aggregate financial data for surplus/deficit calculations

## API Endpoints

### Income (`/income`)

| Method | Endpoint      | Description              | Auth Required |
| ------ | ------------- | ------------------------ | ------------- |
| POST   | `/income`     | Create income entry      | Yes           |
| GET    | `/income`     | List incomes (paginated) | Yes           |
| GET    | `/income/:id` | Get income by ID         | Yes           |
| PATCH  | `/income/:id` | Update income            | Yes           |
| DELETE | `/income/:id` | Delete income            | Yes           |

### Future Endpoints

When placeholder modules are implemented, the service will support:

- `/expenses` - Expense tracking endpoints
- `/assets` - Asset management endpoints
- `/liabilities` - Liability tracking endpoints
- `/budget` - Budget calculation endpoints

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- pnpm package manager
- Docker & Docker Compose (for infrastructure)

### Development Setup

1. **Start the database:**

```bash
docker-compose up postgres-finance -d
```

2. **Install dependencies:**

```bash
cd apps/be-finance
pnpm install
```

3. **Configure environment:**

Ensure these variables are set in the root `.env` file:

```bash
DB_HOST=localhost
DB_PORT_FINANCE=5436
DB_USER=postgres
DB_PASSWORD=password
PORT_FINANCE=4002
JWT_ACCESS_SECRET=<your-secret>
NODE_ENV=development
```

4. **Start the service:**

```bash
# From monorepo root
pnpm dev:finance

# Or from service directory
pnpm dev
```

The service will start on port 4002 with:

- ✅ Database connection to `shonchoy_finance`
- ✅ Auto-synchronization in development mode
- ✅ JWT authentication via shared guards
- ✅ Global validation and error handling

### Testing the API

```bash
# Create an income entry
curl -X POST http://localhost:4002/income \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "source": "Salary",
    "frequency": "monthly",
    "description": "Monthly salary",
    "date": "2025-10-10T00:00:00Z"
  }'

# List incomes with pagination
curl http://localhost:4002/income?page=1&limit=10 \
  -H "Authorization: Bearer <token>"

# Get specific income
curl http://localhost:4002/income/<income-id> \
  -H "Authorization: Bearer <token>"
```

## Database Schema

### Income Table

| Column      | Type        | Constraints                    | Description                    |
| ----------- | ----------- | ------------------------------ | ------------------------------ |
| id          | UUID        | PRIMARY KEY                    | Unique identifier              |
| user_id     | UUID        | NOT NULL, INDEX                | User foreign key               |
| amount      | DECIMAL     | (10,2) NOT NULL                | Income amount                  |
| source      | VARCHAR     | (255) NOT NULL                 | Income source (e.g., "Salary") |
| frequency   | ENUM        | weekly/monthly/yearly/one-time | Payment frequency              |
| description | TEXT        | NULLABLE                       | Optional notes                 |
| date        | TIMESTAMPTZ | NOT NULL                       | Transaction date               |
| created_at  | TIMESTAMPTZ | DEFAULT NOW()                  | Creation timestamp             |
| updated_at  | TIMESTAMPTZ | DEFAULT NOW(), ON UPDATE       | Last update timestamp          |

### Future Tables

Entity definitions exist for:

- `expenses` - Expense tracking with categories
- `assets` - Asset management with types and values
- `liabilities` - Debt tracking with interest rates
- `budgets` - Budget periods and surplus calculations

All tables follow the same patterns:

- UUID primary keys
- `user_id` for data isolation
- DECIMAL for financial amounts
- TIMESTAMPTZ for all timestamps
- Snake_case column names

## Development Guidelines

### Adding a New Module

Follow the income module pattern:

1. **Create entity** with TypeORM decorators
2. **Create service** with `@Injectable()` and repository injection
3. **Create controller** with `@Controller()` and `@UseGuards(JwtAuthGuard)`
4. **Create module** with TypeORM.forFeature([Entity])
5. **Update app.module.ts** to import new module and entity
6. **Add DTOs** to @workspace/shared-domain

### NestJS Best Practices

This service follows [official NestJS patterns](https://docs.nestjs.com):

- **Module-first architecture**: Each feature is a self-contained module
- **Dependency Injection**: Services injected via constructor
- **Guards for authentication**: JwtAuthGuard applied at controller level
- **DTOs for validation**: class-validator decorators on input DTOs
- **Repository pattern**: TypeORM repositories for data access
- **Global configuration**: ConfigModule with `isGlobal: true`

### TypeScript Configuration

- Extends `@workspace/typescript-config/base.json`
- Decorators enabled for NestJS
- Strict mode disabled for rapid prototyping
- CommonJS modules for Node.js compatibility

### Code Quality

```bash
# Lint code
pnpm lint

# Type check
pnpm check-types

# Format code
pnpm format

# Run tests (when implemented)
pnpm test
```

## Deployment

### Production Build

```bash
# Build the service
pnpm build

# Start production server
pnpm start:prod
```

### Environment Variables

Production requires:

- `NODE_ENV=production`
- `DB_PORT_FINANCE=<production-port>`
- `JWT_ACCESS_SECRET=<secure-secret>`
- Database synchronize disabled (manual migrations required)

### Docker Deployment

The service is containerizable:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY dist ./dist
CMD ["node", "dist/main"]
```

## Module Implementation Roadmap

### Phase 1: Core Income Module ✅

- [x] Income entity with TypeORM
- [x] Income service with CRUD operations
- [x] Income controller with JWT auth
- [x] Pagination support
- [x] User isolation

### Phase 2: Expenses Module

- [ ] Implement expense entity and service
- [ ] Add category-based filtering
- [ ] Support recurring expenses
- [ ] CSV import/export

### Phase 3: Assets & Liabilities

- [ ] Implement asset management
- [ ] Implement liability tracking
- [ ] Net worth calculation service
- [ ] Interest calculation for loans

### Phase 4: Budget Module

- [ ] Aggregate income and expenses
- [ ] Calculate surplus/deficit
- [ ] Budget period management
- [ ] Envelope budgeting support

### Phase 5: Dashboard & Analytics

- [ ] Cross-module dashboard service
- [ ] Financial insights aggregation
- [ ] Trend analysis endpoints
- [ ] Export functionality

## Troubleshooting

### Database Connection Issues

```bash
# Check if postgres-finance is running
docker ps | grep postgres-finance

# View database logs
docker logs postgres-finance

# Restart database
docker-compose restart postgres-finance
```

### Port Conflicts

If port 4002 is in use, update `PORT_FINANCE` in `.env`

### TypeORM Synchronization Issues

In development, TypeORM auto-syncs schemas. For manual control:

```typescript
// In app.module.ts, set:
synchronize: false;
```

Then run migrations manually.

## Contributing

1. Follow the established module pattern
2. Use shared packages for cross-cutting concerns
3. Write tests for new features (when test infrastructure is ready)
4. Update this README when adding modules
5. Keep DTOs in @workspace/shared-domain

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [NestJS Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [NestJS Database](https://docs.nestjs.com/techniques/database)

## License

This service is part of the Shonchoy platform.
