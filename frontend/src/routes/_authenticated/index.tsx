import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  activeBudgetQueryOptions,
  budgetTransactionsQueryOptions,
  budgetsQueryOptions,
  budgetByIdQueryOptions,
} from "@/lib/queries"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { SpendingDonut } from "@/components/dashboard/spending-donut"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
})

function formatPeriodLabel(start: string, end: string) {
  const s = new Date(start).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
  const e = new Date(end).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return `${s} – ${e}`
}

function DashboardPage() {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)

  // always fetch active budget — used as default and to seed the switcher
  const { data: activeBudget, isPending: activePending } = useQuery(activeBudgetQueryOptions)

  // fetch all budgets for the period switcher dropdown
  const { data: allBudgets } = useQuery(budgetsQueryOptions)

  // if user selected a past period, fetch that budget — otherwise use active
  const { data: selectedBudget } = useQuery(
    budgetByIdQueryOptions(selectedBudgetId ?? "")
  )

  const budget = selectedBudgetId ? selectedBudget : activeBudget

  const { data: transactions = [], isPending: txPending } = useQuery(
    budgetTransactionsQueryOptions(
      budget?.periodStart ?? "",
      budget?.periodEnd ?? ""
    )
  )

  if (activePending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Memuat dashboard...
      </div>
    )
  }

  if (!activeBudget && !selectedBudgetId) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada anggaran aktif. Buat anggaran untuk periode ini.
        </p>
        <Button size="sm" asChild>
          <Link to="/settings">Buat Anggaran</Link>
        </Button>
      </div>
    )
  }

  if (!budget) return null

  // ── calculations ─────────────────────────────────────────────────────────
  const expenses = transactions.filter((t) => t.type === "expense")

  const needsSpent = expenses
    .filter((t) => t.needWantSave === "need")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const wantsSpent = expenses
    .filter((t) => t.needWantSave === "want")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const savingsSpent = expenses
    .filter((t) => t.needWantSave === "save")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const isViewingPast = !!selectedBudgetId

  return (
    <div className="space-y-6">
      {/* Period switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          {isViewingPast && (
            <p className="text-xs text-muted-foreground">Melihat periode lalu</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isViewingPast && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSelectedBudgetId(null)}
            >
              Kembali ke aktif
            </Button>
          )}
          <Select
            value={selectedBudgetId ?? activeBudget?.id ?? ""}
            onValueChange={(v) => {
              if (v === activeBudget?.id) {
                setSelectedBudgetId(null)
              } else {
                setSelectedBudgetId(v)
              }
            }}
          >
            <SelectTrigger className="h-8 w-[200px] text-xs">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {allBudgets?.map((b) => (
                <SelectItem key={b.id} value={b.id} className="text-xs">
                  {b.id === activeBudget?.id ? "● " : ""}
                  {formatPeriodLabel(b.periodStart, b.periodEnd)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {txPending ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Memuat data periode...
        </div>
      ) : (
        <>
          <BudgetOverview
            salaryAmount={budget.salaryAmount}
            needsAmount={budget.needsAmount}
            wantsAmount={budget.wantsAmount}
            savingsAmount={budget.savingsAmount}
            needsSpent={needsSpent}
            wantsSpent={wantsSpent}
            savingsSpent={savingsSpent}
            periodStart={budget.periodStart}
            periodEnd={budget.periodEnd}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <SpendingDonut
              needsSpent={needsSpent}
              wantsSpent={wantsSpent}
              savingsSpent={savingsSpent}
              needsBudget={parseFloat(budget.needsAmount)}
              wantsBudget={parseFloat(budget.wantsAmount)}
              savingsBudget={parseFloat(budget.savingsAmount)}
            />
            <CategoryBreakdown transactions={transactions} />
          </div>

          <RecentTransactions transactions={transactions} />
        </>
      )}
    </div>
  )
}