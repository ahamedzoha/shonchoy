# NestJS API (Future Implementation)

This directory is reserved for a future NestJS API implementation.

## Setup Instructions (When Ready)

1. Install NestJS CLI globally:

   ```bash
   npm i -g @nestjs/cli
   ```

2. Initialize NestJS app in this directory:

   ```bash
   cd apps/nestjs-api
   nest new . --package-manager npm
   ```

3. Update package.json to include workspace dependencies:

   ```json
   {
     "devDependencies": {
       "@repo/eslint-config": "*",
       "@repo/typescript-config": "*"
     }
   }
   ```

4. Create turbo.json configuration:

   ```json
   {
     "extends": ["//"],
     "tasks": {
       "build": {
         "outputs": ["dist/**"]
       },
       "dev": {
         "cache": false,
         "persistent": true
       }
     }
   }
   ```

5. Update root turbo.json to include NestJS tasks and dependencies.

## Features to Implement

- [ ] Authentication & Authorization
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] API documentation with Swagger
- [ ] Validation with class-validator
- [ ] Logging with Winston
- [ ] Testing with Jest
- [ ] Docker configuration
- [ ] Environment configuration
- [ ] Rate limiting
- [ ] Health checks
