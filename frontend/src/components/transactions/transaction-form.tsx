"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories"
import { api } from "@/lib/api"

// import schema + type from server
import { createTransactionSchema } from "../../../../server/src/sharedTypes"
import type { CreateTransaction } from "../../../../server/src/sharedTypes"

interface TransactionFormProps {
  onSuccess: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const queryClient = useQueryClient()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const form = useForm<CreateTransaction>({
    resolver: standardSchemaResolver(createTransactionSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "",
      type: "expense",
      category: "",
      description: "",
      needWantSave: null,
    },
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form

  // Watchers
  const currentType = watch("type")
  const currentDate = watch("date")
  const currentCategory = watch("category")
  const currentAllocation = watch("needWantSave")

  const mutation = useMutation({
    mutationFn: async (values: CreateTransaction) => {
      const r = await api.transactions.$post({ json: values })
      if (!r.ok) throw new Error("Failed to create transaction")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      toast.success("Transaksi berhasil ditambahkan")
      reset()
      onSuccess()
    },
    onError: () => {
      toast.error("Gagal menambahkan transaksi")
    },
  })

  function onSubmit(values: CreateTransaction) {
    mutation.mutate(values)
  }

  const categoryOptions =
    currentType === "income"
      ? Object.entries(INCOME_CATEGORIES)
      : Object.entries(CATEGORIES)

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-5">
          
          {/* Row 1: Tipe & Tanggal (Side-by-Side) */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="tx-type">Tipe</FieldLabel>
              <Select
                value={currentType}
                onValueChange={(v) => {
                  setValue("type", v as "expense" | "income")
                  setValue("category", "")
                  setValue("needWantSave", null)
                }}
              >
                <SelectTrigger id="tx-type">
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
              {errors.type?.message && (
                <p className="text-[0.8rem] font-medium text-destructive">{errors.type.message}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="tx-date">Tanggal</FieldLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="tx-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal px-3",
                      !currentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                    <span className="truncate">
                      {currentDate ? format(new Date(currentDate), "dd MMM yyyy") : "Pilih"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={currentDate ? new Date(currentDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setValue("date", format(date, "yyyy-MM-dd"))
                        setCalendarOpen(false)
                      }
                    }}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
              {errors.date?.message && (
                <p className="text-[0.8rem] font-medium text-destructive">{errors.date.message}</p>
              )}
            </Field>
          </div>

          {/* Row 2: Jumlah (Rp) - Full Width */}
          <Field>
            <FieldLabel htmlFor="tx-amount">Jumlah (Rp)</FieldLabel>
            <Input
              id="tx-amount"
              type="number"
              placeholder="Contoh: 50000"
              {...register("amount")}
            />
            {errors.amount?.message && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.amount.message}</p>
            )}
          </Field>

          {/* Row 3: Kategori & Anggaran (Side-by-Side if Expense) */}
          <div className={cn("grid gap-4", currentType === "expense" ? "grid-cols-2" : "grid-cols-1")}>
            <Field>
              <FieldLabel htmlFor="tx-category">Kategori</FieldLabel>
              <Select
                value={currentCategory}
                onValueChange={(v) => setValue("category", v)}
              >
                <SelectTrigger id="tx-category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {categoryOptions.map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category?.message && (
                <p className="text-[0.8rem] font-medium text-destructive">{errors.category.message}</p>
              )}
            </Field>

            {currentType === "expense" && (
              <Field>
                <FieldLabel htmlFor="tx-budget">Anggaran</FieldLabel>
                <Select
                  value={currentAllocation ?? ""}
                  onValueChange={(v) => setValue("needWantSave", v as any)}
                >
                  <SelectTrigger id="tx-budget">
                    <SelectValue placeholder="Alokasi" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="need">Kebutuhan</SelectItem>
                    <SelectItem value="want">Keinginan</SelectItem>
                    <SelectItem value="save">Tabungan</SelectItem>
                  </SelectContent>
                </Select>
                {errors.needWantSave?.message && (
                  <p className="text-[0.8rem] font-medium text-destructive">{errors.needWantSave.message}</p>
                )}
              </Field>
            )}
          </div>

          {/* Row 4: Deskripsi - Full Width */}
          <Field>
            <FieldLabel htmlFor="tx-description">
              Deskripsi <span className="text-muted-foreground font-normal">(opsional)</span>
            </FieldLabel>
            <Input
              id="tx-description"
              placeholder="Catatan tambahan..."
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.description.message}</p>
            )}
          </Field>

          {/* Row 5: Submit Button */}
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Transaksi"
              )}
            </Button>
          </div>

        </FieldGroup>
      </form>
    </div>
  )
}