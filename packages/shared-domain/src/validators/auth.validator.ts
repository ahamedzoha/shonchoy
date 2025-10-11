import { z } from "zod";

// Email validation
export const emailSchema = z.string().email("Invalid email format");

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Name validation
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

// JWT token validation
export const jwtTokenSchema = z.string().min(1, "Token is required");

// Common validation schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const idSchema = z.string().uuid("Invalid ID format");

// Type exports
export type PaginationQuery = z.infer<typeof paginationSchema>;

