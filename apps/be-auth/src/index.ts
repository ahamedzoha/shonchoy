import { BackendContainer } from "@workspace/backend-core";
import { createLogger } from "@workspace/backend-core";
import { config } from "dotenv";

import { createApp } from "./app.js";
import { getEnvironmentSummary, validateEnvironment } from "./config/env.js";

// Load environment variables from .env file (located in monorepo root)
config({ path: "../../.env" });

const logger = createLogger("auth-service");

// Validate environment variables early in startup
let validatedEnv;
try {
  validatedEnv = validateEnvironment();
  logger.info("Environment validation successful", getEnvironmentSummary());
} catch (error) {
  logger.error("Environment validation failed:", {
    error: error instanceof Error ? error.message : String(error),
  });
  console.error("\n❌ Environment Configuration Error");
  console.error("=================================");
  console.error(error instanceof Error ? error.message : String(error));
  console.error(
    "\nPlease check your .env file and ensure all required variables are set correctly."
  );
  console.error("See README.md for environment setup instructions.\n");
  process.exit(1);
}

// Initialize the backend container with validated configuration
const container = new BackendContainer({
  // Database config
  host: validatedEnv.env.DB_HOST,
  port: validatedEnv.env.DB_PORT,
  username: validatedEnv.env.DB_USER,
  password: validatedEnv.env.DB_PASSWORD,
  database: validatedEnv.env.DB_NAME,

  // JWT config (only needed for services, not container)
  accessToken: {
    secret: validatedEnv.env.JWT_ACCESS_SECRET,
    expiresIn: validatedEnv.env.JWT_ACCESS_EXPIRES_IN,
  },
  refreshToken: {
    secret: validatedEnv.env.JWT_REFRESH_SECRET,
    expiresIn: validatedEnv.env.JWT_REFRESH_EXPIRES_IN,
  },
});

// Initialize database connection
container
  .initialize()
  .then(() => {
    // Create the Express app with the container
    const app = createApp(container);

    // Start the server
    app.listen(validatedEnv.env.PORT, () => {
      logger.info("Server started successfully", {
        port: validatedEnv.env.PORT,
        environment: validatedEnv.env.ENVIRONMENT,
        baseUrl: validatedEnv.env.BASE_URL,
        oauthEnabled: validatedEnv.isOAuthEnabled,
        apisixEnabled: validatedEnv.isApisixEnabled,
      });

      console.log(
        `🚀 Shonchoy Auth Server running on ${validatedEnv.env.BASE_URL}`
      );
      console.log(`📊 Health check: ${validatedEnv.env.BASE_URL}/health`);
      console.log(`🔐 Auth endpoints: ${validatedEnv.env.BASE_URL}/auth/*`);
      console.log(`👤 User endpoints: ${validatedEnv.env.BASE_URL}/users/*`);

      if (validatedEnv.isOAuthEnabled) {
        console.log(
          `🔑 OAuth enabled: ${validatedEnv.env.BASE_URL}/auth/google`
        );
      } else {
        console.log(
          `🔒 OAuth disabled (configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable)`
        );
      }
    });
  })
  .catch((error) => {
    logger.error("Failed to initialize application", { error: error.message });
    console.error("❌ Failed to initialize application:", error.message);
    process.exit(1);
  });
