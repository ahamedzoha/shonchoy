import { DataSource } from "typeorm";

import { Session, User } from "./entities";

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface JwtConfig {
  accessToken: {
    secret: string;
    expiresIn: string;
  };
  refreshToken: {
    secret: string;
    expiresIn: string;
  };
}

export const createDataSource = (config: DatabaseConfig) => {
  return new DataSource({
    type: "postgres",
    ...config,
    synchronize: process.env.NODE_ENV === "development",
    // logging: process.env.NODE_ENV === "development",
    entities: [User, Session],
    migrations: ["dist/migrations/*.js"],
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  });
};
