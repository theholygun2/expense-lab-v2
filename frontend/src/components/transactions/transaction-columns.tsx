import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

// mirrors SelectTransaction from server
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
  food: "Makanan",
  transport: "Transport",
  bills: "Tagihan",
  entertainment: "Hiburan",
  shopping: "Belanja",
  savings: "Tabungan",
  investment: "Investasi",
  paycheck: "Gaji",
  freelance: "Freelance",
  health: "Kesehatan",
  self_improvement: "Pengembangan Diri",
  tithe: "Persembahan",
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
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.getValue("category") as string
      return <span className="text-sm">{categoryLabels[cat] ?? cat}</span>
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="max-w-[180px] truncate text-sm text-muted-foreground">
        {row.getValue("description") ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === "income" ? "default" : "destructive"}>
          {type === "income" ? "Income" : "Expense"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "needWantSave",
    header: "Budget",
    cell: ({ row }) => {
      const val = row.getValue("needWantSave") as string | null
      if (!val) return <span className="text-muted-foreground">—</span>
      return <Badge variant="outline">{needWantSaveLabels[val] ?? val}</Badge>
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.original.type
      const amount = Number(row.getValue("amount"))
      return (
        <span className={`font-mono text-sm font-medium ${type === "income" ? "text-green-600 dark:text-green-400" : ""}`}>
          {type === "income" ? "+" : "-"}Rp{amount.toLocaleString("id-ID")}
        </span>
      )
    },
  },
]