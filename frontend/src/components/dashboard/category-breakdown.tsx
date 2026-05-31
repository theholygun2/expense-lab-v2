import { PieChart, Pie } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { CATEGORIES } from "@/lib/categories"
import { formatRp } from "@/lib/format"

type Transaction = {
  type: string
  category: string
  amount: string
  needWantSave: string | null
}

type CategoryBreakdownProps = {
  transactions: Transaction[]
}

const CHART_COLORS = [
  "#185FA5", "#1D9E75", "#BA7517", "#A32D2D",
  "#533AB7", "#0F6E56", "#854F0B", "#3B6D11",
]

export function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const expenses = transactions.filter((t) => t.type === "expense")

  const grouped = expenses.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + parseFloat(t.amount)
    return acc
  }, {})

  const data = Object.entries(grouped)
    .map(([cat, total], i) => ({
      key: cat,
      name: CATEGORIES[cat as keyof typeof CATEGORIES] ?? cat,
      value: total,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const chartConfig = Object.fromEntries(
    data.map((d) => [d.key, { label: d.name, color: d.fill }])
  ) satisfies ChartConfig

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Kategori terbesar</CardTitle>
        </CardHeader>
        <CardContent className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Belum ada data
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Kategori terbesar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
              isAnimationActive={true}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatRp(Number(value))}
                />
              }
            />
          </PieChart>
        </ChartContainer>

        {/* custom legend — shows value inline, wraps naturally */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
  {data.map((d) => (
    <div key={d.key} className="flex items-center gap-1.5 min-w-0">
      <span
        className="h-2 w-2 shrink-0 rounded-sm"
        style={{ background: d.fill }}
      />
      <span className="truncate">{d.name}</span>
      <span className="ml-auto pl-2 font-medium tabular-nums">{formatRp(d.value)}</span>
    </div>
  ))}
</div>
      </CardContent>
    </Card>
  )
}