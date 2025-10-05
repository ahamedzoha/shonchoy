import type { AuthService } from "@workspace/backend-core";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";

// Type definitions for Passport callbacks

/**
 * Configure Passport.js strategies for authentication
 * Based on latest Passport.js patterns for stateless JWT authentication
 */
export const configurePassport = (
  authService: AuthService,
  jwtConfig: {
    accessToken: { secret: string };
    refreshToken: { secret: string };
  }
) => {
  // Local Strategy - Email/Password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false, // No sessions for JWT-based auth
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (email: string, password: string, done: any) => {
        try {
          const user = await authService.authenticateUser({ email, password });

          if (!user) {
            return done(null, false, { message: "Invalid credentials" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy - For validating JWT tokens in protected routes
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtConfig.accessToken.secret,
        ignoreExpiration: false,
        algorithms: ["HS256"],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (payload: { sub: string; email: string }, done: any) => {
        try {
          const user = await authService.findUserById(payload.sub);

          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth Strategy (only if credentials are configured)
  const isOAuthEnabled = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID.trim() &&
    process.env.GOOGLE_CLIENT_SECRET.trim()
  );

  if (isOAuthEnabled) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.BASE_URL || "http://localhost:4001"}/auth/google/callback`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        async (
          accessToken: string,
          refreshToken: string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile: any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          done: any
        ) => {
          try {
            // Try to find existing user by OAuth ID first
            let user = await authService.findUserByOAuthId(
              "google",
              profile.id
            );

            if (!user) {
              // Try to find by email (account linking)
              const email = profile.emails?.[0]?.value;
              if (!email) {
                return done(new Error("No email provided by Google"));
              }

              const existingUser = await authService.findUserByEmail(email);

              if (existingUser) {
                // Link Google account to existing user
                user = await authService.updateUser(existingUser.id, {
                  oauth_provider: "google",
                  oauth_id: profile.id,
                  emailVerified: true,
                });
              } else {
                // Create new user
                user = await authService.createUser({
                  email,
                  firstName:
                    profile.name?.givenName ||
                    profile.displayName?.split(" ")[0] ||
                    "Google",
                  lastName:
                    profile.name?.familyName ||
                    profile.displayName?.split(" ").slice(1).join(" ") ||
                    "User",
                  oauthProvider: "google",
                  oauthId: profile.id,
                  emailVerified: profile.emails?.[0]?.verified || false,
                });
              }
            }

            return done(null, user || false);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }
};
