import { PieChart, Pie, Sector, type PieLabelRenderProps, type PieSectorShapeProps } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatRp } from "@/lib/format"

const chartConfig = {
  need: { label: "Kebutuhan", color: "#185FA5" },
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

const RADIAN = Math.PI / 180

// renders % label inside each slice
const renderLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: PieLabelRenderProps) => {
  if (!percent || (percent * 100) < 5) return null // skip tiny slices
  const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5
  const x = Number(cx) + radius * Math.cos(-(midAngle ?? 0) * RADIAN)
  const y = Number(cy) + radius * Math.sin(-(midAngle ?? 0) * RADIAN)
  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// uses shape prop for per-slice colors — no Cell needed
const ColoredSlice = (props: PieSectorShapeProps) => (
  <Sector {...props} fill={COLORS[(props as any).key] ?? "#888"} />
)

export function SpendingDonut({ needsSpent, wantsSpent, savingsSpent }: SpendingDonutProps) {
  const data = [
  { key: "need", label: "Kebutuhan", spent: needsSpent, fill: COLORS.need },
  { key: "want", label: "Keinginan", spent: wantsSpent, fill: COLORS.want },
  { key: "save", label: "Tabungan",  spent: savingsSpent, fill: COLORS.save },
].filter((d) => d.spent > 0)

  const total = data.reduce((s, d) => s + d.spent, 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pengeluaran periode ini</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Belum ada transaksi
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Pengeluaran periode ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="spent"
              nameKey="key"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
              labelLine={false}
              label={renderLabel}
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

        {/* custom legend with values */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map((d) => (
            <span key={d.key} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-sm"
                style={{ background: COLORS[d.key] }}
              />
              {d.label} · {formatRp(d.spent)}
            </span>
          ))}
        </div>

        {/* total */}
        <p className="text-center">
          Total · {formatRp(total)}
        </p>
      </CardContent>
    </Card>
  )
}