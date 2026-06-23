import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { TransactionItem, type TransactionRow } from "../transactions/transaction-item"

export function RecentTransactions({ transactions }: { transactions: TransactionRow[] }) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm">Transaksi terakhir</CardTitle>
          <CardDescription className="text-xs">Aktivitas keuangan terbaru</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
          <Link to="/transactions">
            Lihat semua <ArrowRight size={12} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada transaksi
          </p>
        ) : (
          recent.map((t, i) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              isLast={i === recent.length - 1}
              showMenu={true}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}