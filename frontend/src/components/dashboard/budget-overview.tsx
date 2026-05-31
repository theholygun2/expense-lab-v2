import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, Wallet, PiggyBank } from "lucide-react"

type BudgetOverviewProps = {
  salaryAmount: string
  needsAmount: string
  wantsAmount: string
  savingsAmount: string
  needsSpent: number
  wantsSpent: number
  savingsSpent: number
  periodStart: string
  periodEnd: string
}

function formatRp(amount: number) {
  return `Rp${amount.toLocaleString("id-ID")}`
}

function StatCard({
  label,
  budget,
  spent,
  icon: Icon,
}: {
  label: string
  budget: number
  spent: number
  icon: React.ElementType
}) {
  const remaining = budget - spent
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const isOver = spent > budget

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          <Icon size={15} className="text-muted-foreground" />
        </div>
        <p className="text-xl font-semibold">
          {formatRp(Math.max(remaining, 0))}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          sisa dari {formatRp(budget)}
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              isOver
                ? "bg-destructive"
                : pct > 80
                ? "bg-amber-500"
                : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {isOver
            ? `lewat ${formatRp(spent - budget)}`
            : `${pct.toFixed(0)}% terpakai`}
        </p>
      </CardContent>
    </Card>
  )
}

export function BudgetOverview({
  salaryAmount,
  needsAmount,
  wantsAmount,
  savingsAmount,
  needsSpent,
  wantsSpent,
  savingsSpent,
  periodStart,
  periodEnd,
}: BudgetOverviewProps) {
  const salary = parseFloat(salaryAmount)
  const needs = parseFloat(needsAmount)
  const wants = parseFloat(wantsAmount)
  const savings = parseFloat(savingsAmount)
  const totalSpent = needsSpent + wantsSpent + savingsSpent

  const startDate = new Date(periodStart).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
  const endDate = new Date(periodEnd).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium ">
            Periode {startDate} – {endDate}
          </h2>
          <p className="text-xs text-muted-foreground">
            Gaji {formatRp(salary)} · Total keluar {formatRp(totalSpent)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Kebutuhan"
          budget={needs}
          spent={needsSpent}
          icon={Wallet}
        />
        <StatCard
          label="Keinginan"
          budget={wants}
          spent={wantsSpent}
          icon={TrendingDown}
        />
        <StatCard
          label="Tabungan"
          budget={savings}
          spent={savingsSpent}
          icon={PiggyBank}
        />
      </div>
    </div>
  )
}