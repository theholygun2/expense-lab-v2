import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories"

export type Transaction = {
  id: string
  date: string
  amount: string
  type: string
  description: string | null
  category: string
  needWantSave: string | null
  createdAt: string
}

const categoryLabels: Record<string, string> = {
  ...CATEGORIES,
  ...INCOME_CATEGORIES,
}

const needWantSaveLabels: Record<string, string> = {
  need: "Kebutuhan",
  want: "Keinginan",
  save: "Tabungan",
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tanggal
        <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return (
        <span className="text-sm text-muted-foreground tabular-nums">
          {date.toLocaleDateString("id-ID", { 
            day: "numeric", 
            month: "short", 
            year: "numeric" 
          })}
        </span>
      )
    },
  },
  {
    // Combined Category & Description into a structural cell block
    accessorKey: "category",
    header: "Transaksi",
    cell: ({ row }) => {
      const cat = row.getValue("category") as string
      const desc = row.original.description
      
      return (
        <div className="flex flex-col gap-0.5 max-w-[220px]">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {categoryLabels[cat] ?? cat}
          </span>
          {desc && (
            <span className="truncate text-xs text-muted-foreground">
              {desc}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "needWantSave",
    header: "Alokasi",
    cell: ({ row }) => {
      const val = row.getValue("needWantSave") as string | null
      if (!val) return <span className="text-xs text-muted-foreground/50">—</span>
      
      const badgeStyles: Record<string, string> = {
        need: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400",
        want: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",
        save: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400",
      }

      return (
        <Badge 
          variant="outline" 
          className={`font-medium shadow-none transition-none text-[11px] px-2 py-0.5 ${badgeStyles[val] ?? ""}`}
        >
          {needWantSaveLabels[val] ?? val}
        </Badge>
      )
    },
  },
  {
    accessorKey: "amount",
    // Header right-aligned to match numbers
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="-mr-3 h-8 font-medium inline-flex justify-end"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jumlah
          <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const type = row.original.type
      const amount = Number(row.getValue("amount"))
      const isIncome = type === "income"

      return (
        <div className="text-right tabular-nums">
          <span 
            className={`text-sm font-bold tracking-tight ${
              isIncome 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-foreground"
            }`}
          >
            {isIncome ? "+" : "-"}Rp{amount.toLocaleString("id-ID")}
          </span>
        </div>
      )
    },
  },
]