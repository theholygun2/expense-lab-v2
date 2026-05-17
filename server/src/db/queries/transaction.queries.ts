import { db } from "../../db"
import { transactions } from "../../db/schema"
import { eq, desc, and, sql } from "drizzle-orm"
import type { InsertTransaction } from "../../db/schema/transactions"
import type { GetTransactionsParams } from "../../sharedTypes"

export const getTransactionsByUserId = async (
  userId: string,
  filters: GetTransactionsParams = { limit: 100, offset: 0 }
) => {
  const { type, category, needWantSave, month, limit, offset } = filters

  const conditions = [eq(transactions.userId, userId)]

  if (type) conditions.push(eq(transactions.type, type))
  if (category) conditions.push(eq(transactions.category, category))
  if (needWantSave) conditions.push(eq(transactions.needWantSave, needWantSave))
  if (month)
    conditions.push(sql`to_char(${transactions.date}, 'YYYY-MM') = ${month}`)

  return await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.date))
    .limit(limit)
    .offset(offset)
}

export const getTransactionById = async (id: string, userId: string) => {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  return transaction ?? null
}

export const createTransaction = async (data: InsertTransaction) => {
  const [transaction] = await db
    .insert(transactions)
    .values(data)
    .returning()
  return transaction
}

export const updateTransaction = async (
  id: string,
  userId: string,
  data: Partial<InsertTransaction>
) => {
  const [transaction] = await db
    .update(transactions)
    .set(data)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()
  return transaction ?? null
}

export const deleteTransaction = async (id: string, userId: string) => {
  const [transaction] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()
  return transaction ?? null
}