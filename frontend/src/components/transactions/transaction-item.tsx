import {
  Utensils, Zap, Car, BookOpen, Users, Heart, Church,
  Sparkles, ShoppingBag, MoreHorizontal, Wallet, TrendingUp,
  Gift, CircleDollarSign, HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories"

export type TransactionRow = {
  id: string
  date: string
  amount: string
  type: string
  category: string
  description: string | null
  needWantSave: string | null
}

// category → lucide icon + bg color
const CATEGORY_META: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  food:             { icon: Utensils,          bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600 dark:text-orange-400" },
  bills:            { icon: Zap,               bg: "bg-yellow-100 dark:bg-yellow-900/30", color: "text-yellow-600 dark:text-yellow-400" },
  transport:        { icon: Car,               bg: "bg-blue-100 dark:bg-blue-900/30",     color: "text-blue-600 dark:text-blue-400" },
  self_improvement: { icon: BookOpen,          bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-600 dark:text-purple-400" },
  family:           { icon: Users,             bg: "bg-pink-100 dark:bg-pink-900/30",     color: "text-pink-600 dark:text-pink-400" },
  discipleship:     { icon: Heart,             bg: "bg-red-100 dark:bg-red-900/30",       color: "text-red-600 dark:text-red-400" },
  tithe:            { icon: Church,            bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" },
  self_care:        { icon: Sparkles,          bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30", color: "text-fuchsia-600 dark:text-fuchsia-400" },
  shopping:         { icon: ShoppingBag,       bg: "bg-indigo-100 dark:bg-indigo-900/30", color: "text-indigo-600 dark:text-indigo-400" },
  other:            { icon: HelpCircle,        bg: "bg-gray-100 dark:bg-gray-800",        color: "text-gray-500" },
  paycheck:         { icon: Wallet,            bg: "bg-green-100 dark:bg-green-900/30",   color: "text-green-600 dark:text-green-400" },
  freelance:        { icon: TrendingUp,        bg: "bg-teal-100 dark:bg-teal-900/30",     color: "text-teal-600 dark:text-teal-400" },
  gift:             { icon: Gift,              bg: "bg-rose-100 dark:bg-rose-900/30",     color: "text-rose-600 dark:text-rose-400" },
  other_income:     { icon: CircleDollarSign,  bg: "bg-gray-100 dark:bg-gray-800",        color: "text-gray-500" },
}

function formatDate(dateStr: string) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const d = new Date(dateStr)

  if (d.toDateString() === today.toDateString()) return "Hari ini"
  if (d.toDateString() === yesterday.toDateString()) return "Kemarin"
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function getCategoryLabel(category: string, type: string) {
  if (type === "income") return INCOME_CATEGORIES[category as keyof typeof INCOME_CATEGORIES] ?? category
  return CATEGORIES[category as keyof typeof CATEGORIES] ?? category
}

interface TransactionItemProps {
  transaction: TransactionRow
  showMenu?: boolean
  onEdit?: (t: TransactionRow) => void
  onDelete?: (t: TransactionRow) => void
  isLast?: boolean
}

export function TransactionItem({
  transaction: t,
  showMenu = false,
  onEdit,
  onDelete,
  isLast = false,
}: TransactionItemProps) {
  const meta = CATEGORY_META[t.category] ?? CATEGORY_META.other
  const Icon = meta.icon
  const label = getCategoryLabel(t.category, t.type)
  const isIncome = t.type === "income"

  return (
    <div className={`flex items-center gap-3 py-3 ${!isLast ? "border-b" : ""}`}>
      {/* Icon */}
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
        <Icon size={16} className={meta.color} />
      </div>

      {/* Label + subtitle */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {t.description && t.description.trim() ? t.description : label}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {t.description && t.description.trim() ? label : ""}
          {t.description && t.description.trim() ? " · " : ""}
          {formatDate(t.date)}
        </p>
      </div>

      {/* Amount */}
      <span className={`font-bold ${isIncome ? "text-green-600 dark:text-green-400" : ""}`}>
        {isIncome ? "+" : "-"}Rp{Number(t.amount).toLocaleString("id-ID")}
      </span>

      {/* Actions menu */}
      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 flex-shrink-0 p-0">
              <MoreHorizontal size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(t)}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete?.(t)}
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}