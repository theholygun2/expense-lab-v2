import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export type TransactionFilters = {
  month?: string
  type?: "expense" | "income"
  needWantSave?: "need" | "want" | "save"
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
}

// generate last 12 months for the month picker
function getMonthOptions() {
  const options = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    options.push({ value, label })
  }
  return options
}

const monthOptions = getMonthOptions()

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const hasFilters = filters.type || filters.needWantSave

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Month */}
      <Select
        value={filters.month ?? monthOptions[0].value}
        onValueChange={(v) => onChange({ ...filters, month: v })}
      >
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((m) => (
            <SelectItem key={m.value} value={m.value} className="text-xs">
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type */}
      <Select
        value={filters.type ?? "all"}
        onValueChange={(v) =>
          onChange({ ...filters, type: v === "all" ? undefined : (v as "expense" | "income") })
        }
      >
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All types</SelectItem>
          <SelectItem value="expense" className="text-xs">Expense</SelectItem>
          <SelectItem value="income" className="text-xs">Income</SelectItem>
        </SelectContent>
      </Select>

      {/* Need/Want/Save */}
      <Select
        value={filters.needWantSave ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            needWantSave: v === "all" ? undefined : (v as "need" | "want" | "save"),
          })
        }
      >
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="All budgets" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All budgets</SelectItem>
          <SelectItem value="need" className="text-xs">Kebutuhan</SelectItem>
          <SelectItem value="want" className="text-xs">Keinginan</SelectItem>
          <SelectItem value="save" className="text-xs">Tabungan</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={() => onChange({ month: filters.month })}
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}