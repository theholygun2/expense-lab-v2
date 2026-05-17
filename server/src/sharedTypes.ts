import {
  insertTransactionSchema,
  selectTransactionSchema,
} from "./db/schema/transactions"
import {
  insertBudgetSchema,
  selectBudgetSchema,
} from "./db/schema/budgets"
import { z } from "zod"

// ── Transactions ───────────────────────────────────────────────────────────

// what the frontend sends on create
export const createTransactionSchema = insertTransactionSchema.omit({
  userId: true,
})

// what the frontend sends on update (all fields optional)
export const updateTransactionSchema = createTransactionSchema.partial()

// query params for GET /transactions
export const getTransactionsSchema = z.object({
  type: z.enum(["expense", "income"]).optional(),
  category: z.string().optional(),
  needWantSave: z.enum(["need", "want", "save"]).optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM")
    .optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0),
})

export type CreateTransaction = z.infer<typeof createTransactionSchema>
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>
export type Transaction = z.infer<typeof selectTransactionSchema>
export type GetTransactionsParams = z.infer<typeof getTransactionsSchema>

// ── Budgets ────────────────────────────────────────────────────────────────

const periodRefine = (data: { periodStart?: string; periodEnd?: string }) => {
  if (data.periodStart && data.periodEnd) {
    return data.periodEnd > data.periodStart
  }
  return true
}

const periodRefineError = {
  message: "End date must be after start date",
  path: ["periodEnd"],
}

export const createBudgetSchema = insertBudgetSchema
  .omit({ userId: true })
  .refine(periodRefine, periodRefineError)

export const updateBudgetSchema = insertBudgetSchema
  .omit({ userId: true })
  .partial()
  .refine(periodRefine, periodRefineError)

// query params for GET /budgets
export const getBudgetsSchema = z.object({
  year: z.coerce.number().min(2000).max(2100).optional(),
  limit: z.coerce.number().min(1).max(100).default(12),
  offset: z.coerce.number().min(0).default(0),
})

export type CreateBudget = z.infer<typeof createBudgetSchema>
export type UpdateBudget = z.infer<typeof updateBudgetSchema>
export type Budget = z.infer<typeof selectBudgetSchema>
export type GetBudgetsParams = z.infer<typeof getBudgetsSchema>