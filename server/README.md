To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { z } from "zod";
import \* as schema from "@/db/schema";

// 1. Validate your Env
const EnvSchema = z.object({
DATABASE_URL: z.url(),
});

const ProcessEnv = EnvSchema.parse(process.env);

// 2. Initialize Neon SQL client (The "driver")
const sql = neon(ProcessEnv.DATABASE_URL);

// 3. Initialize Drizzle (The "ORM")
// We pass the schema here so 'db.query' becomes available and typed
export const db = drizzle(sql, { schema, casing: 'snake_case' });

bunx @better-auth/cli generate
