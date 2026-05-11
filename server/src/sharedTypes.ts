import {
  insertTransactionSchema,
  selectTransactionSchema,
} from "@/db/schema/transactions"
import { z } from "zod"

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
