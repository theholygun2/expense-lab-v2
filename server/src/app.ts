import { Hono } from 'hono';
import { auth } from './lib/auth';
import { logger } from 'hono/logger';
import { transactionRoute } from './routes/transaction.routes';
import { budgetRoute } from './routes/budget.routes';

// 1. Initialize the app with the base path right away
const app = new Hono().basePath("/api");

// 2. Use global logger WITHOUT the "*" path string
app.use(logger());

// 3. Chain your routes on a clean slate
const router = app
  .on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw))
  .route('/transactions', transactionRoute)
  .route('/budgets', budgetRoute);

export type AppType = typeof router;
export default app;