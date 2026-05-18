import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { transactionsQueryOptions } from "@/lib/queries"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionFilters, type TransactionFilters as Filters } from "@/components/transactions/transaction-filters"

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
})

// default to current month
function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function TransactionsPage() {
  const [filters, setFilters] = useState<Filters>({
    month: getCurrentMonth(),
  })

  const { data, isPending } = useQuery(
    transactionsQueryOptions(filters)
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {data?.length ?? 0} transactions
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Filters */}
      <TransactionFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <TransactionTable data={data ?? []} isLoading={isPending} />
    </div>
  )
}