import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { budgetsQueryOptions, activeBudgetQueryOptions } from "@/lib/queries"
import { BudgetDialog } from "@/components/settings/budget-dialog"
import { api } from "@/lib/api"
import { formatRp } from "@/lib/format"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: session } = authClient.useSession()
  const { data: budgets = [], isPending } = useQuery(budgetsQueryOptions)
  const { data: activeBudget } = useQuery(activeBudgetQueryOptions)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await api.budgets[":id"].$delete({ param: { id } })
      if (!r.ok) throw new Error("Failed to delete budget")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.success("Anggaran dihapus")
    },
    onError: () => toast.error("Gagal menghapus anggaran"),
  })

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  function formatPeriod(start: string, end: string) {
    const s = new Date(start).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    const e = new Date(end).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    return `${s} – ${e}`
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-semibold">Pengaturan</h1>

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session?.user.image ?? ""} alt={session?.user.name ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session?.user.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{session?.user.email ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Budgets ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">Anggaran</CardTitle>
          <BudgetDialog
            trigger={
              <Button size="sm" className="h-7 gap-1 text-xs">
                <Plus className="h-3 w-3" />
                Buat
              </Button>
            }
          />
        </CardHeader>
        <CardContent className="space-y-0">
          {isPending ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Memuat...</p>
          ) : budgets.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Belum ada anggaran. Buat anggaran pertamamu.
            </p>
          ) : (
              budgets.map((budget, i) => {
                const isActive = budget.id === activeBudget?.id
                return (
                <div key={budget.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatPeriod(budget.periodStart, budget.periodEnd)}
                        </span>
                        {isActive && (
                          <Badge className="h-4 px-1.5 text-[10px]">aktif</Badge>
                        )}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatRp(parseFloat(budget.salaryAmount))}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <BudgetDialog
                        budget={budget}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus anggaran?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Periode {formatPeriod(budget.periodStart, budget.periodEnd)} akan dihapus permanen.
                              Transaksi tidak terpengaruh.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMutation.mutate(budget.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {i < budgets.length - 1 && <Separator />}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}