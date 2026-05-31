import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatRp } from "@/lib/format"
import { api } from "@/lib/api"
import { createBudgetSchema } from "../../../../server/src/sharedTypes"
import type { CreateBudget, Budget } from "../../../../server/src/sharedTypes"

interface BudgetDialogProps {
  trigger: React.ReactNode
  budget?: Budget        // if provided = edit mode
  onSuccess?: () => void
}

export function BudgetDialog({ trigger, budget, onSuccess }: BudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const queryClient = useQueryClient()
  const isEdit = !!budget

  const form = useForm<CreateBudget>({
    resolver: standardSchemaResolver(createBudgetSchema),
    defaultValues: {
      salaryAmount: budget?.salaryAmount ?? "",
      periodStart: budget?.periodStart ?? format(new Date(), "yyyy-MM-dd"),
      periodEnd: budget?.periodEnd ?? "",
    },
  })

  const salaryRaw = form.watch("salaryAmount")
  const salary = parseFloat(salaryRaw) || 0

  // reset form when dialog opens with new budget data
  useEffect(() => {
    if (open) {
      form.reset({
        salaryAmount: budget?.salaryAmount ?? "",
        periodStart: budget?.periodStart ?? format(new Date(), "yyyy-MM-dd"),
        periodEnd: budget?.periodEnd ?? "",
      })
    }
  }, [open, budget])

  const mutation = useMutation({
    mutationFn: async (values: CreateBudget) => {
      if (isEdit && budget) {
        const r = await api.budgets[":id"].$patch({
          param: { id: budget.id },
          json: values,
        })
        if (!r.ok) throw new Error("Failed to update budget")
        return r.json()
      } else {
        const r = await api.budgets.$post({ json: values })
        if (!r.ok) {
          const err = await r.json() as { error: string }
          throw new Error(err.error ?? "Failed to create budget")
        }
        return r.json()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.success(isEdit ? "Anggaran diperbarui" : "Anggaran berhasil dibuat")
      setOpen(false)
      onSuccess?.()
    },
    onError: (e: Error) => {
      toast.error(e.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Anggaran" : "Buat Anggaran"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">

          {/* Salary */}
          <Controller
            control={form.control}
            name="salaryAmount"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="salary">Gaji (Rp)</FieldLabel>
                <Input
                  {...field}
                  id="salary"
                  placeholder="6327000"
                  inputMode="numeric"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive">{fieldState.error.message}</p>
                )}
              </Field>
            )}
          />

          {/* Period start */}
          <Controller
            control={form.control}
            name="periodStart"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="periodStart">Periode mulai</FieldLabel>
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="periodStart"
                      variant="outline"
                      aria-invalid={fieldState.invalid}
                      className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), "dd MMMM yyyy") : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(d) => { if (d) { field.onChange(format(d, "yyyy-MM-dd")); setStartOpen(false) } }}
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.error && (
                  <p className="text-xs text-destructive">{fieldState.error.message}</p>
                )}
              </Field>
            )}
          />

          {/* Period end */}
          <Controller
            control={form.control}
            name="periodEnd"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="periodEnd">Periode selesai</FieldLabel>
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="periodEnd"
                      variant="outline"
                      aria-invalid={fieldState.invalid}
                      className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), "dd MMMM yyyy") : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(d) => { if (d) { field.onChange(format(d, "yyyy-MM-dd")); setEndOpen(false) } }}
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.error && (
                  <p className="text-xs text-destructive">{fieldState.error.message}</p>
                )}
              </Field>
            )}
          />

          {/* Live splits preview */}
          {salary > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5 rounded-md bg-muted px-3 py-2.5">
                <p className="text-xs font-medium text-muted-foreground mb-2">Kalkulasi otomatis</p>
                {[
                  { label: "Kebutuhan 50%", amount: salary * 0.5 },
                  { label: "Keinginan 30%", amount: salary * 0.3 },
                  { label: "Tabungan 20%",  amount: salary * 0.2 },
                ].map(({ label, amount }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono font-medium">{formatRp(amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Simpan Perubahan" : "Buat Anggaran"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}