import { z } from "zod";

// Expense DTOs
export const CreateExpenseRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateExpenseRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  category: z.string().min(1, "Category is required").optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export const ExpenseResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  category: z.string(),
  description: z.string().nullable(),
  date: z.string().datetime(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ExpenseListResponseSchema = z.object({
  expenses: z.array(ExpenseResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Type exports
export type CreateExpenseRequest = z.infer<typeof CreateExpenseRequestSchema>;
export type UpdateExpenseRequest = z.infer<typeof UpdateExpenseRequestSchema>;
export type ExpenseResponse = z.infer<typeof ExpenseResponseSchema>;
export type ExpenseListResponse = z.infer<typeof ExpenseListResponseSchema>;

