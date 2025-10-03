import { BackendContainer } from "@workspace/backend-core";

import { createApp } from "./app.js";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const PORT = process.env.PORT || 4001;

// Initialize the backend container with configuration
const container = new BackendContainer({
  // Database config
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "shonchoy_auth",

  // JWT config (only needed for services, not container)
  accessToken: {
    secret:
      process.env.JWT_ACCESS_SECRET ||
      "your-super-secure-access-token-secret-here-at-least-32-chars",
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  },
  refreshToken: {
    secret:
      process.env.JWT_REFRESH_SECRET ||
      "your-super-secure-refresh-token-secret-here-at-least-32-chars",
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
});

// Initialize database connection
container
  .initialize()
  .then(() => {
    // Create the Express app with the container
    const app = createApp(container);

    // Start the server
    app.listen(PORT, () => {
      console.log(
        `🚀 Shonchoy Auth Server running on http://localhost:${PORT}`
      );
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth/*`);
      console.log(`👤 User endpoints: http://localhost:${PORT}/users/*`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  });
