import { createMiddleware } from "hono/factory"
import { auth } from "@/lib/auth"
import { type AuthenticatedEnv } from "@/types"

export const authMiddleware = createMiddleware<AuthenticatedEnv>(
  async (c, next) => {
    let session
    try {
      session = await auth.api.getSession({ headers: c.req.raw.headers })
    } catch (e) {
      console.error("Auth API Error:", e)
      return c.json({ error: "Internal Server Error" }, 500)
    }

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    c.set("user", session.user)
    c.set("session", session.session)
    return next()
  }
)
