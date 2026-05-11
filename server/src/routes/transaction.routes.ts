import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { authMiddleware } from "@/middlewares/auth.middleware"
import { transactionIdSchema } from "@/db/schema/transactions"
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsSchema,
} from "@/sharedTypes"
import {
  getTransactionsByUserId,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/db/queries"
import type { AuthenticatedEnv } from "@/types"

export const transactionsRoute = new Hono<AuthenticatedEnv>()
  .use(authMiddleware)

  // GET /transactions?type=expense&month=2026-04&category=food
  .get("/", zValidator("query", getTransactionsSchema), async (c) => {
    const user = c.get("user")
    const filters = c.req.valid("query")
    try {
      const result = await getTransactionsByUserId(user.id, filters)
      return c.json(result)
    } catch {
      return c.json({ error: "Failed to fetch transactions" }, 500)
    }
  })

  // GET /transactions/:id
  .get("/:id", zValidator("param", transactionIdSchema), async (c) => {
    const user = c.get("user")
    const { id } = c.req.valid("param")
    try {
      const transaction = await getTransactionById(id, user.id)
      if (!transaction) return c.json({ error: "Not found" }, 404)
      return c.json(transaction)
    } catch {
      return c.json({ error: "Failed to fetch transaction" }, 500)
    }
  })

  // POST /transactions
  .post("/", zValidator("json", createTransactionSchema), async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    try {
      const transaction = await createTransaction({
        ...body,
        userId: user.id, // attach from session, never from client
      })
      return c.json(transaction, 201)
    } catch {
      return c.json({ error: "Failed to create transaction" }, 500)
    }
  })

  // PATCH /transactions/:id
  .patch(
    "/:id",
    zValidator("param", transactionIdSchema),
    zValidator("json", updateTransactionSchema),
    async (c) => {
      const user = c.get("user")
      const { id } = c.req.valid("param")
      const body = c.req.valid("json")
      try {
        const transaction = await updateTransaction(id, user.id, body)
        if (!transaction) return c.json({ error: "Not found" }, 404)
        return c.json(transaction)
      } catch {
        return c.json({ error: "Failed to update transaction" }, 500)
      }
    }
  )

  // DELETE /transactions/:id
  .delete("/:id", zValidator("param", transactionIdSchema), async (c) => {
    const user = c.get("user")
    const { id } = c.req.valid("param")
    try {
      const transaction = await deleteTransaction(id, user.id)
      if (!transaction) return c.json({ error: "Not found" }, 404)
      return c.json({ success: true })
    } catch {
      return c.json({ error: "Failed to delete transaction" }, 500)
    }
  })
