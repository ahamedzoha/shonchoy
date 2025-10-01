export const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || "your-access-secret-key",
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m", // 15 minutes
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // 7 days
  },
};
