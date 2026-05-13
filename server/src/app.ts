import { Hono } from "hono"
import { logger } from "hono/logger"
import { auth } from "@/lib/auth"
import { transactionsRoute } from "@/routes/transaction.routes"
import { budgetRoute } from "@/routes/budget.routes"

const app = new Hono().basePath("/api")

const router = app
  .use("*", logger())
  .on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
  .route("/transactions", transactionsRoute)
  .route("/budgets", budgetRoute)

export type AppType = typeof router
export default app
