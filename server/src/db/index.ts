import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../db/schema"
import { env } from "../env"

const sql = neon(env.DATABASE_URL)

// 3. Initialize Drizzle (The "ORM")
// We pass the schema here so 'db.query' becomes available and typed
export const db = drizzle(sql, { schema, casing: "snake_case" })
