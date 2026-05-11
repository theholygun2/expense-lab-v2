import type { auth } from "@/lib/auth"

export type AuthenticatedEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}
