import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { authMiddleware } from "../middlewares/auth.middleware"
import { budgetIdSchema } from "../db/schema/budgets"
import {
  createBudgetSchema,
  updateBudgetSchema,
  getBudgetsSchema,
} from "../sharedTypes"
import {
  getBudgetsByUserId,
  getBudgetById,
  getActiveBudget,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../db/queries/budget.queries"
import type { AuthenticatedEnv } from "../types"

// helper — calculates the 50/30/20 splits server-side
const calculateSplits = (salaryAmount: string) => {
  const salary = parseFloat(salaryAmount)
  return {
    needsAmount: (salary * 0.5).toFixed(2),
    wantsAmount: (salary * 0.3).toFixed(2),
    savingsAmount: (salary * 0.2).toFixed(2),
  }
}

export const budgetRoute = new Hono<AuthenticatedEnv>()
  .use(authMiddleware)

  // GET /budgets — all budgets for the user, optionally filtered by year
  .get("/", zValidator("query", getBudgetsSchema), async (c) => {
    const user = c.get("user")
    const filters = c.req.valid("query")
    try {
      const result = await getBudgetsByUserId(user.id, filters)
      return c.json(result)
    } catch {
      return c.json({ error: "Failed to fetch budgets" }, 500)
    }
  })

  // GET /budgets/active — current active budget based on today's date
  .get("/active", async (c) => {
    const user = c.get("user")
    try {
      const budget = await getActiveBudget(user.id)
      if (!budget) return c.json({ error: "No active budget found" }, 404)
      return c.json(budget)
    } catch {
      return c.json({ error: "Failed to fetch active budget" }, 500)
    }
  })

  // GET /budgets/:id
  .get("/:id", zValidator("param", budgetIdSchema), async (c) => {
    const user = c.get("user")
    const { id } = c.req.valid("param")
    try {
      const budget = await getBudgetById(id, user.id)
      if (!budget) return c.json({ error: "Not found" }, 404)
      return c.json(budget)
    } catch {
      return c.json({ error: "Failed to fetch budget" }, 500)
    }
  })

  // POST /budgets — frontend sends salary + period, server calculates splits
  .post("/", zValidator("json", createBudgetSchema), async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    try {
      const budget = await createBudget({
        ...body,
        userId: user.id,
        ...calculateSplits(body.salaryAmount),
      })
      return c.json(budget, 201)
    } catch (e: any) {
      console.error("Insert budget error:", e)// Drizzle wraps the Neon error in e.cause
      if (e?.cause?.code === "23505") {
        return c.json({ error: "A budget for this period already exists" }, 409)
      }
      return c.json({ error: "Failed to create budget" }, 500)
    }
  })

  // PATCH /budgets/:id — recalculates splits if salary changes
  .patch(
    "/:id",
    zValidator("param", budgetIdSchema),
    zValidator("json", updateBudgetSchema),
    async (c) => {
      const user = c.get("user")
      const { id } = c.req.valid("param")
      const body = c.req.valid("json")
      try {
        const updates = {
          ...body,
          // recalculate splits if salary is being updated
          ...(body.salaryAmount ? calculateSplits(body.salaryAmount) : {}),
        }
        const budget = await updateBudget(id, user.id, updates)
        if (!budget) return c.json({ error: "Not found" }, 404)
        return c.json(budget)
      } catch (e) {
        console.error("PATCH budget error:", e)
        return c.json({ error: "Failed to update budget" }, 500)
      }
    }
  )

  // DELETE /budgets/:id
  .delete("/:id", zValidator("param", budgetIdSchema), async (c) => {
    const user = c.get("user")
    const { id } = c.req.valid("param")
    try {
      const budget = await deleteBudget(id, user.id)
      if (!budget) return c.json({ error: "Not found" }, 404)
      return c.json({ success: true })
    } catch (e) {
      console.error("DELETE budget error:", e)
      return c.json({ error: "Failed to delete budget" }, 500)
    }
  })