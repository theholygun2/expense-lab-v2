import {
  numeric,
  text,
  pgTable,
  index,
  uuid,
  timestamp,
  date,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { user } from "@/db/schema/auth"

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    type: text("type").notNull(), // validated by Zod, not DB enum
    description: text("description"),
    category: text("category").notNull(),
    needWantSave: text("need_want_save"), // validated by Zod, not DB enum
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("userId_idx").on(t.userId), index("date_idx").on(t.date)]
)

export const insertTransactionSchema = createInsertSchema(transactions, {
  type: z.enum(["expense", "income"]),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a positive number")
    .refine(v => parseFloat(v) > 0, "Amount must be greater than 0"),
  description: z.string().max(150).optional(),
  category: z.string().min(1, "Category is required").max(50),
  needWantSave: z.enum(["need", "want", "save"]).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
}).omit({ id: true, createdAt: true })

export const selectTransactionSchema = createSelectSchema(transactions, {
  type: z.enum(["expense", "income"]),
  needWantSave: z.enum(["need", "want", "save"]).nullable(),
})

// useful for route param validation
export const transactionIdSchema = z.object({
  id: z.uuid(),
})

export type InsertTransaction = z.infer<typeof insertTransactionSchema>
export type SelectTransaction = z.infer<typeof selectTransactionSchema>