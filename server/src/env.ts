import { z } from "zod"

const EnvSchema = z.object({
  PORT: z.string().regex(/^\d+$/).default("3000").transform(Number),
  DATABASE_URL: z.string(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  REDIS_URL: z.string(),
  CLIENT_URL: z.url()
})

export const env = EnvSchema.parse(process.env)