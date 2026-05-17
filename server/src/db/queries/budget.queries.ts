import { db } from "../../db"
import { budgets } from "../../db/schema"
import { eq, desc, and, sql } from "drizzle-orm"
import type { GetBudgetsParams } from "../../sharedTypes"
import { type InferInsertModel } from "drizzle-orm"

export const getBudgetsByUserId = async (
  userId: string,
  filters: GetBudgetsParams = { limit: 12, offset: 0 }
) => {
  const { year, limit, offset } = filters

  const conditions = [eq(budgets.userId, userId)]

  if (year)
    conditions.push(
      sql`date_part('year', ${budgets.periodStart}::date) = ${year}`
    )

  return await db
    .select()
    .from(budgets)
    .where(and(...conditions))
    .orderBy(desc(budgets.periodStart))
    .limit(limit)
    .offset(offset)
}

export const getBudgetById = async (id: string, userId: string) => {
  const [budget] = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
  return budget ?? null
}

// get the active budget for a user based on current date
export const getActiveBudget = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const [budget] = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        sql`${budgets.periodStart}::date <= ${today}::date`,
        sql`${budgets.periodEnd}::date >= ${today}::date`
      )
    )
  return budget ?? null
}


// Drizzle's raw insert type — includes ALL columns
type BudgetInsertDb = InferInsertModel<typeof budgets>

// InsertBudget = what frontend sends (no computed fields)
// BudgetInsertDb = what goes into the DB (all fields required)

export const createBudget = async (data: BudgetInsertDb) => {
  const [budget] = await db.insert(budgets).values(data).returning()
  return budget
}

export const updateBudget = async (
  id: string,
  userId: string,
  data: Partial<BudgetInsertDb>
) => {
  const [budget] = await db
    .update(budgets)
    .set(data)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
    .returning()
  return budget ?? null
}

export const deleteBudget = async (id: string, userId: string) => {
  const [budget] = await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
    .returning()
  return budget ?? null
}