import { z } from "zod";

/**
 * Environment variable validation schemas and utilities
 * Provides comprehensive validation for all required environment variables
 * with clear error messages and graceful failure handling
 */

// Environment enum for validation rules
export const Environment = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export type EnvironmentType = (typeof Environment)[keyof typeof Environment];

// Helper function to check if a value is available (non-empty and not just whitespace)
function isValueAvailable(value: string): boolean {
  return !!(value && value.trim() !== "");
}

// Base environment schema that applies to all environments
const baseEnvSchema = z.object({
  // Core environment
  ENVIRONMENT: z
    .enum([Environment.DEVELOPMENT, Environment.PRODUCTION, Environment.TEST])
    .default(Environment.DEVELOPMENT),

  // Application
  PORT: z.coerce.number().int().positive().default(4001),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  BASE_URL: z.string().url().default("http://localhost:4001"),

  // Database (required for all environments)
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),

  // JWT Configuration (required - no defaults for secrets)
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters long"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters long"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

// Development-specific validations
const developmentEnvSchema = baseEnvSchema.extend({
  ENVIRONMENT: z.literal(Environment.DEVELOPMENT),
});

// Production-specific validations (stricter rules)
const productionEnvSchema = baseEnvSchema.extend({
  ENVIRONMENT: z.literal(Environment.PRODUCTION),

  // In production, these must be explicitly set (no defaults)
  PORT: z.coerce.number().int().positive(),
  BASE_URL: z.string().url(),

  // Additional production requirements
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
});

// Test environment schema
const testEnvSchema = baseEnvSchema.extend({
  ENVIRONMENT: z.literal(Environment.TEST),
});

// OAuth-specific schema (optional - only validated if OAuth is enabled)
const oauthSchema = z.object({
  GOOGLE_CLIENT_ID: z
    .string()
    .min(1, "GOOGLE_CLIENT_ID is required when OAuth is enabled"),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, "GOOGLE_CLIENT_SECRET is required when OAuth is enabled"),
});

// APISIX configuration (optional - only required if using APISIX)
const apisixSchema = z.object({
  APISIX_ADMIN_KEY: z
    .string()
    .min(1, "APISIX_ADMIN_KEY is required when using APISIX"),
  APISIX_VIEWER_KEY: z
    .string()
    .min(1, "APISIX_VIEWER_KEY is required when using APISIX"),
  ETCD_HOST: z.string().min(1, "ETCD_HOST is required when using APISIX"),
});

/**
 * Validate all environment variables and return parsed configuration
 * Throws detailed error messages for missing or invalid variables
 */
export function validateEnvironment(): {
  env: z.infer<typeof baseEnvSchema>;
  isOAuthEnabled: boolean;
  isApisixEnabled: boolean;
} {
  const env = process.env;

  // Determine environment and use appropriate schema
  const environment = env.ENVIRONMENT || Environment.DEVELOPMENT;

  let schema: z.ZodSchema;
  switch (environment) {
    case Environment.PRODUCTION:
      schema = productionEnvSchema;
      break;
    case Environment.TEST:
      schema = testEnvSchema;
      break;
    case Environment.DEVELOPMENT:
    default:
      schema = developmentEnvSchema;
      break;
  }

  // Validate base environment variables
  const parsedEnv = schema.parse(env);

  // Check if OAuth is enabled and validate if so
  const isOAuthEnabled = !!(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    isValueAvailable(env.GOOGLE_CLIENT_ID) &&
    isValueAvailable(env.GOOGLE_CLIENT_SECRET)
  );

  if (isOAuthEnabled) {
    try {
      oauthSchema.parse(env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `OAuth validation failed: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  // Check if APISIX is enabled and validate if so
  const isApisixEnabled = !!(
    env.APISIX_ADMIN_KEY &&
    env.APISIX_VIEWER_KEY &&
    env.ETCD_HOST
  );

  if (isApisixEnabled) {
    try {
      apisixSchema.parse(env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `APISIX validation failed: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  return {
    env: parsedEnv,
    isOAuthEnabled,
    isApisixEnabled,
  };
}

/**
 * Type-safe environment configuration
 */
export type ValidatedEnv = ReturnType<typeof validateEnvironment>["env"];

/**
 * Utility to check if running in development
 */
export function isDevelopment(): boolean {
  return (
    (process.env.ENVIRONMENT || Environment.DEVELOPMENT) ===
    Environment.DEVELOPMENT
  );
}

/**
 * Utility to check if running in production
 */
export function isProduction(): boolean {
  return process.env.ENVIRONMENT === Environment.PRODUCTION;
}

/**
 * Utility to check if running in test
 */
export function isTest(): boolean {
  return process.env.ENVIRONMENT === Environment.TEST;
}

/**
 * Get environment summary for logging
 */
export function getEnvironmentSummary(): {
  environment: string;
  oauthEnabled: boolean;
  apisixEnabled: boolean;
  databaseHost: string;
  port: number;
} {
  const { env, isOAuthEnabled, isApisixEnabled } = validateEnvironment();

  return {
    environment: env.ENVIRONMENT,
    oauthEnabled: isOAuthEnabled,
    apisixEnabled: isApisixEnabled,
    databaseHost: env.DB_HOST,
    port: env.PORT,
  };
}
