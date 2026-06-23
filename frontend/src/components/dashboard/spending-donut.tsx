import { PieChart, Pie, Cell, Label } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatRp } from "@/lib/format"

const chartConfig = {
  need: { label: "Kebutuhan", color: "#185FA5" }, // Back to your reliable blues
  want: { label: "Keinginan", color: "#1D9E75" },
  save: { label: "Tabungan",  color: "#BA7517" },
} satisfies ChartConfig

const COLORS: Record<string, string> = {
  need: "#185FA5",
  want: "#1D9E75",
  save: "#BA7517",
}

type SpendingDonutProps = {
  needsSpent: number
  wantsSpent: number
  savingsSpent: number
  needsBudget: number
  wantsBudget: number
  savingsBudget: number
}

export function SpendingDonut({ needsSpent, wantsSpent, savingsSpent }: SpendingDonutProps) {
  const data = [
    { key: "need", label: "Kebutuhan", spent: needsSpent },
    { key: "want", label: "Keinginan", spent: wantsSpent },
    { key: "save", label: "Tabungan",  spent: savingsSpent },
  ].filter((d) => d.spent > 0)

  const total = data.reduce((s, d) => s + d.spent, 0)

  if (data.length === 0) {
    return (
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pengeluaran Periode Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          Belum ada transaksi
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/60 shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pengeluaran Periode Ini
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {/* The Unified Chart Wrapper */}
        <div className="mx-auto aspect-square max-h-[200px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    hideLabel 
                    formatter={(value) => formatRp(Number(value))}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="spent"
                nameKey="key"
                innerRadius="68%" // Thinner ring feels more modern and leaves room for text
                outerRadius="88%"
                paddingAngle={4}
                isAnimationActive={true}
              >
                {data.map((entry) => (
                  <Cell key={`cell-${entry.key}`} fill={COLORS[entry.key]} className="stroke-background" strokeWidth={2} />
                ))}
                
                {/* The Center Anchor Text */}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-lg font-black tracking-tight"
                          >
                            {formatRp(total)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-muted-foreground text-[10px] font-bold uppercase tracking-wider"
                          >
                            Total Keluar
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        {/* Clean, Modular Ledger Legends */}
        <div className="mt-2 space-y-1.5 border-t border-border/40 pt-3">
          {data.map((d) => {
            const percentage = total > 0 ? (d.spent / total) * 100 : 0
            return (
              <div key={d.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: COLORS[d.key] }}
                  />
                  <span className="font-medium text-foreground/80">{d.label}</span>
                  <span className="text-muted-foreground/60 tabular-nums">({percentage.toFixed(0)}%)</span>
                </div>
                <span className="font-bold text-foreground tabular-nums">
                  {formatRp(d.spent)}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}