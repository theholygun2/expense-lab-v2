import { queryOptions } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { authClient } from "./auth-client"

// ── Transactions ───────────────────────────────────────────────────────────

export const transactionsQueryOptions = (filters = {}) => queryOptions({
  queryKey: ["transactions", filters],
  queryFn: async () => {
    const r = await api.transactions.$get({ query: filters })
    if (!r.ok) throw new Error("Failed to fetch transactions")
    return r.json()
  },
})

export const transactionQueryOptions = (id: string) => queryOptions({
  queryKey: ["transactions", id],
  queryFn: async () => {
    const r = await api.transactions[":id"].$get({ param: { id } })
    if (!r.ok) throw new Error("Failed to fetch transaction")
    return r.json()
  },
  enabled: !!id,
})

// ── Budgets ────────────────────────────────────────────────────────────────

export const budgetTransactionsQueryOptions = (periodStart: string, periodEnd: string) =>
  queryOptions({
    queryKey: ["transactions", { dateFrom: periodStart, dateTo: periodEnd }],
    queryFn: async () => {
      const r = await api.transactions.$get({
        query: { dateFrom: periodStart, dateTo: periodEnd, limit: "500" },
      })
      if (!r.ok) throw new Error("Failed to fetch transactions")
      return r.json()
    },
    enabled: !!periodStart && !!periodEnd,
  })

export const budgetsQueryOptions = queryOptions({
  queryKey: ["budgets"],
  queryFn: async () => {
    const r = await api.budgets.$get({ query: {} })
    if (!r.ok) throw new Error("Failed to fetch budgets")
    return r.json()
  },
})

export const activeBudgetQueryOptions = queryOptions({
  queryKey: ["budgets", "active"],
  queryFn: async () => {
    const r = await api.budgets.active.$get()
    if (!r.ok) throw new Error("No active budget")
    return r.json()
  },
})

export const budgetByIdQueryOptions = (id: string) => queryOptions({
  queryKey: ["budgets", id],
  queryFn: async () => {
    const r = await api.budgets[":id"].$get({ param: { id } })
    if (!r.ok) throw new Error("Failed to fetch budget")
    return r.json()
  },
  enabled: !!id,
})

// src/lib/queries.ts
export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const { data } = await authClient.getSession()
    return data
  },
  staleTime: 1000 * 60 * 5, // 5 min
})