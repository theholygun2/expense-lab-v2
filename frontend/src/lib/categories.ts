// src/lib/categories.ts — single source of truth
export const CATEGORIES = {
  food: "Makanan",
  bills: "Tagihan",
  transport: "Transportasi",
  self_improvement: "Pengembangan Diri",
  family: "Keluarga",
  discipleship: "Pemuridan",
  tithe: "Persembahan",
  self_care: "Perawatan Diri",
  shopping: "Belanja",
  other: "Lainnya",
} as const

export type CategoryKey = keyof typeof CATEGORIES

// for income
export const INCOME_CATEGORIES = {
  paycheck: "Gaji",
  freelance: "Freelance",
  gift: "Hadiah",
  other_income: "Lainnya",
} as const

export type IncomeCategoryKey = keyof typeof INCOME_CATEGORIES

// flip the object to look up by Indonesian label
export const categoryFromLabel = Object.fromEntries(
  Object.entries(CATEGORIES).map(([k, v]) => [v, k])
) as Record<string, CategoryKey>

// usage on import
const dbKey = categoryFromLabel["Makanan"] // → "food"