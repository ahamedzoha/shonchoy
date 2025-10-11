import { z } from "zod";

// Income DTOs
export const CreateIncomeRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  source: z.string().min(1, "Source is required"),
  frequency: z.enum(["weekly", "monthly", "yearly", "one-time"]),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

export const UpdateIncomeRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  source: z.string().min(1, "Source is required").optional(),
  frequency: z.enum(["weekly", "monthly", "yearly", "one-time"]).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

export const IncomeResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  source: z.string(),
  frequency: z.enum(["weekly", "monthly", "yearly", "one-time"]),
  description: z.string().nullable(),
  date: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const IncomeListResponseSchema = z.object({
  incomes: z.array(IncomeResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Type exports
export type CreateIncomeRequest = z.infer<typeof CreateIncomeRequestSchema>;
export type UpdateIncomeRequest = z.infer<typeof UpdateIncomeRequestSchema>;
export type IncomeResponse = z.infer<typeof IncomeResponseSchema>;
export type IncomeListResponse = z.infer<typeof IncomeListResponseSchema>;

// Export interfaces for direct use
export interface CreateIncomeRequestInterface {
  amount: number;
  source: string;
  frequency: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date?: string;
}

export interface UpdateIncomeRequestInterface {
  amount?: number;
  source?: string;
  frequency?: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date?: string;
}

export interface IncomeResponseInterface {
  id: string;
  userId: string;
  amount: number;
  source: string;
  frequency: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeListResponseInterface {
  incomes: IncomeResponseInterface[];
  total: number;
  page: number;
  limit: number;
}
