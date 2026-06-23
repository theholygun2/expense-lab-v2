"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories"
import { api } from "@/lib/api"
import { createTransactionSchema } from "../../../../server/src/sharedTypes"
import type { CreateTransaction } from "../../../../server/src/sharedTypes"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORY_TO_ALLOCATION: Record<string, "need" | "want" | "save"> = {
  food: "need", transport: "need", health: "need",
  bills: "need", groceries: "need", rent: "need", utilities: "need",
  shopping: "want", entertainment: "want", dining: "want",
  travel: "want", hobbies: "want",
  education: "save", investment: "save", insurance: "save", emergency: "save",
}

const ALLOC_OPTIONS = [
  { value: "need" as const, label: "Kebutuhan", active: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300" },
  { value: "want" as const, label: "Keinginan", active: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  { value: "save" as const, label: "Tabungan",  active: "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatRupiah(raw: string) {
  const digits = raw.replace(/\D/g, "")
  return digits ? Number(digits).toLocaleString("id-ID") : ""
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [displayAmount, setDisplayAmount] = useState("")
  const [autoFilled, setAutoFilled] = useState(false)

  const { handleSubmit, formState: { errors }, watch, setValue, reset, register } =
    useForm<CreateTransaction>({
      resolver: standardSchemaResolver(createTransactionSchema),
      defaultValues: {
        date: format(new Date(), "yyyy-MM-dd"),
        amount: "", type: "expense", category: "", description: "", needWantSave: null,
      },
    })

  const type       = watch("type")
  const date       = watch("date")
  const category   = watch("category")
  const allocation = watch("needWantSave") as "need" | "want" | "save" | null

  const mutation = useMutation({
    mutationFn: async (values: CreateTransaction) => {
      const r = await api.transactions.$post({ json: values })
      if (!r.ok) throw new Error()
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      toast.success("Transaksi berhasil ditambahkan")
      reset(); setDisplayAmount(""); setAutoFilled(false); onSuccess()
    },
    onError: () => toast.error("Gagal menambahkan transaksi"),
  })

  const handleTypeChange = useCallback((t: "expense" | "income") => {
    setValue("type", t); setValue("category", ""); setValue("needWantSave", null); setAutoFilled(false)
  }, [setValue])

  const handleCategoryChange = useCallback((cat: string) => {
    setValue("category", cat)
    if (type === "expense") {
      const mapped = CATEGORY_TO_ALLOCATION[cat] ?? null
      setValue("needWantSave", mapped); setAutoFilled(!!mapped)
    }
  }, [setValue, type])

  const handleAllocChange = useCallback((val: "need" | "want" | "save") => {
    setValue("needWantSave", allocation === val ? null : val); setAutoFilled(false)
  }, [setValue, allocation])

  const handleAmountInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRupiah(e.target.value)
    setDisplayAmount(formatted)
    setValue("amount", formatted.replace(/\./g, ""))
  }, [setValue])

  const categoryOptions = Object.entries(type === "income" ? INCOME_CATEGORIES : CATEGORIES)

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <FieldGroup className="space-y-5">

          {/* Type switcher */}
          <Field>
            <FieldLabel>Tipe transaksi</FieldLabel>
            <div className="flex rounded-xl border border-border bg-muted p-1 gap-1">
              {(["expense", "income"] as const).map((t) => (
                <button key={t} type="button" onClick={() => handleTypeChange(t)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150",
                    type === t
                      ? cn("bg-background shadow-sm border border-border", t === "expense" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")
                      : "text-muted-foreground hover:text-foreground"
                  )}>
                  {t === "expense" ? "↑ Pengeluaran" : "↓ Pemasukan"}
                </button>
              ))}
            </div>
            {errors.type?.message && <p className="text-[0.8rem] font-medium text-destructive">{errors.type.message}</p>}
          </Field>

          {/* Date + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="tx-date">Tanggal</FieldLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button id="tx-date" variant="outline"
                    className={cn("w-full justify-start text-left font-normal px-3", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                    <span className="truncate">{date ? format(new Date(date), "dd MMM yyyy") : "Pilih"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single"
                    selected={date ? new Date(date) : undefined}
                    onSelect={(d) => { if (d) { setValue("date", format(d, "yyyy-MM-dd")); setCalendarOpen(false) } }}
                    disabled={(d) => d > new Date()}
                  />
                </PopoverContent>
              </Popover>
              {errors.date?.message && <p className="text-[0.8rem] font-medium text-destructive">{errors.date.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="tx-amount">Jumlah</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">Rp</span>
                <Input id="tx-amount" inputMode="numeric" placeholder="0"
                  value={displayAmount} onChange={handleAmountInput}
                  className="pl-9 font-medium tabular-nums" />
              </div>
              {errors.amount?.message && <p className="text-[0.8rem] font-medium text-destructive">{errors.amount.message}</p>}
            </Field>
          </div>

          {/* Category */}
          <Field>
            <FieldLabel htmlFor="tx-category">Kategori</FieldLabel>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="tx-category"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent position="popper">
                {categoryOptions.map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category?.message && <p className="text-[0.8rem] font-medium text-destructive">{errors.category.message}</p>}
          </Field>

          {/* Allocation chips — expense only */}
          {type === "expense" && (
            <Field>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel className="mb-0">Anggaran</FieldLabel>
                {autoFilled && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    <Zap className="h-3 w-3" /> diisi otomatis
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {ALLOC_OPTIONS.map(({ value, label, active }) => (
                  <button key={value} type="button" onClick={() => handleAllocChange(value)}
                    className={cn(
                      "flex-1 rounded-md border py-2 text-sm font-medium transition-all duration-150",
                      allocation === value ? active : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}>
                    {label}
                  </button>
                ))}
              </div>
              {errors.needWantSave?.message && <p className="text-[0.8rem] font-medium text-destructive">{errors.needWantSave.message}</p>}
            </Field>
          )}

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="tx-description">
              Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Input id="tx-description" placeholder="Catatan tambahan..." {...register("description")} />
            {errors.description?.message && <p className="text-[0.8rem] font-medium text-destructive">{errors.description.message}</p>}
          </Field>

          {/* Submit */}
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                : "Simpan Transaksi"}
            </Button>
          </div>

        </FieldGroup>
      </form>
    </div>
  )
}