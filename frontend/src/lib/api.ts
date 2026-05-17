import { hc } from "hono/client"
import type { AppType } from "../../../server/src/app"

const client = hc<AppType>("/")
export const api = client.api