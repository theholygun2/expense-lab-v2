// src/lib/format.ts
export function formatRp(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`
  if (v >= 1_000) return `Rp${(v / 1_000).toFixed(0)}rb`
  return `Rp${v}`
}