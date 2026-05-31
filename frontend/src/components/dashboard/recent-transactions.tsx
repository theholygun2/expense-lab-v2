import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories"
import { ArrowRight } from "lucide-react"

type Transaction = {
  id: string
  date: string
  amount: string
  type: string
  category: string
  description: string | null
  needWantSave: string | null
}

function getCategoryLabel(category: string, type: string) {
  if (type === "income") {
    return INCOME_CATEGORIES[category as keyof typeof INCOME_CATEGORIES] ?? category
  }
  return CATEGORIES[category as keyof typeof CATEGORIES] ?? category
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Transaksi terakhir</CardTitle>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
          <Link to="/transactions">
            Lihat semua <ArrowRight size={12} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-0">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada transaksi
          </p>
        ) : (
          recent.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center justify-between py-2.5 ${
                i < recent.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {getCategoryLabel(t.category, t.type)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t.description ?? "—"} ·{" "}
                  {new Date(t.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className={`text-sm font-medium ${
                    t.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : ""
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}Rp
                  {Number(t.amount).toLocaleString("id-ID")}
                </span>
                {t.needWantSave && (
                  <Badge variant="outline" className="h-4 px-1 text-[10px]">
                    {t.needWantSave === "need"
                      ? "kebutuhan"
                      : t.needWantSave === "want"
                      ? "keinginan"
                      : "tabungan"}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}