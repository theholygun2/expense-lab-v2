import { db } from "@/db"
import * as schema from "@/db/schema"
import { seed } from "drizzle-seed"

// ── use your real user id from better-auth ────────────────────────────────
const TEST_USER_ID = "6ilq4x5tseaQaBoxhRgy0XiPCMHYgnRc"

async function main() {
  await seed(db, { transactions: schema.transactions }).refine((f) => ({
    transactions: {
      count: 20,
      columns: {
        userId: f.default({ defaultValue: TEST_USER_ID }),
        type: f.valuesFromArray({ values: ["expense", "income"] }),
        amount: f.valuesFromArray({
          values: ["50000", "70000", "150000", "200000", "500000", "1000000"],
        }),
        category: f.valuesFromArray({
          values: [
            "food",
            "transport",
            "bills",
            "shopping",
            "personal_development",
            "offerings",
            "self_care",
            "salary",
          ],
        }),
        needWantSave: f.valuesFromArray({ values: ["need", "want", "save"] }),
        description: f.valuesFromArray({
          values: [
            "Makan siang",
            "Bensin",
            "Netflix",
            "Gaji",
            "Tabungan",
            "Belanja online",
            undefined,
          ],
        }),
      },
    },
  }))

  console.log("✅ seeded 20 transactions")
  process.exit(0)
}

main().catch((e) => {
  console.error("❌ seed failed:", e)
  process.exit(1)
})
