import {
  numeric,
  text,
  pgTable,
  index,
  uuid,
  timestamp,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { user } from "../../db/schema/auth"

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    salaryAmount: numeric("salary_amount", { precision: 12, scale: 2 }).notNull(),
    needsAmount: numeric("needs_amount", { precision: 12, scale: 2 }).notNull(),
    wantsAmount: numeric("wants_amount", { precision: 12, scale: 2 }).notNull(),
    savingsAmount: numeric("savings_amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("budget_userId_idx").on(t.userId),
    // prevent duplicate budget periods per user
    uniqueIndex("budget_user_period_idx").on(t.userId, t.periodStart),
  ]
)

export const insertBudgetSchema = createInsertSchema(budgets, {
  salaryAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a positive number")
    .refine((v) => parseFloat(v) > 0, "Amount must be greater than 0"),
  periodStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  periodEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
})
  .omit({
    id: true,
    createdAt: true,
    needsAmount: true,
    wantsAmount: true,
    savingsAmount: true,
  })

export const selectBudgetSchema = createSelectSchema(budgets, {
  salaryAmount: z.string(),
  needsAmount: z.string(),
  wantsAmount: z.string(),
  savingsAmount: z.string(),
})

export const budgetIdSchema = z.object({
  id: z.uuid(),
})

export type InsertBudget = z.infer<typeof insertBudgetSchema>
export type SelectBudget = z.infer<typeof selectBudgetSchema>