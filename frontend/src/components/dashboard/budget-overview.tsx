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
  const pctRemaining = budget > 0 ? Math.max((remaining / budget) * 100, 0) : 0
  const isOver = spent > budget

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm">
      <CardContent className="p-4">
        {/* 1. Header: Category & Visual Identifier */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
            {label}
          </span>
          <div className={`p-1.5 rounded-md ${isOver ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
            <Icon size={16} />
          </div>
        </div>

        {/* 2. Primary Focal Point: What is left */}
        <div className="space-y-0.5">
          <span className="text-xs font-medium text-muted-foreground block">Sisa Anggaran</span>
          <p className={`text-2xl font-black tracking-tight ${isOver ? 'text-destructive line-through opacity-70' : 'text-foreground'}`}>
            {formatRp(Math.max(remaining, 0))}
          </p>
        </div>

        {/* 3. The Health Bar Anchor */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pctRemaining === 0
                ? "" 
                : pctRemaining < 20
                ? "bg-destructive" 
                : pctRemaining < 50
                ? "bg-amber-500"   
                : "bg-emerald-500" // Emerald stands out better as "healthy" than primary blue/zinc
            }`}
            style={{ width: `${pctRemaining}%` }}
          />
        </div>

        {/* 4. Contextual Breakdown: Spent vs Initial Budget */}
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-medium">Terpakai</span>
            <span className={`font-semibold ${isOver ? 'text-destructive' : 'text-foreground/90'}`}>
              {formatRp(spent)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block text-[10px] uppercase font-medium">Awal</span>
            <span className="font-bold">
              {formatRp(budget)}
            </span>
          </div>
        </div>

        {/* 5. Dynamic Warning Badge if Overspent */}
        {isOver && (
          <div className="mt-2.5 rounded bg-destructive/10 px-2 py-1 text-center text-[11px] font-medium text-destructive">
            Overspent {formatRp(spent - budget)}
          </div>
        )}
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
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Periode {startDate} – {endDate}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gaji {formatRp(salary)} · Total Keluar <span className="font-medium text-foreground">{formatRp(totalSpent)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Kebutuhan" budget={needs} spent={needsSpent} icon={Wallet} />
        <StatCard label="Keinginan" budget={wants} spent={wantsSpent} icon={TrendingDown} />
        <StatCard label="Tabungan" budget={savings} spent={savingsSpent} icon={PiggyBank} />
      </div>
    </div>
  )
}