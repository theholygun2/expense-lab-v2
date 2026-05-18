import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { sessionQueryOptions } from "@/lib/queries"

const Component = () => {
  const { session } = Route.useRouteContext()

  if (!session) {
    return null // beforeLoad handles the redirect, this is just safety
  }

  return <Outlet />
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(sessionQueryOptions)
    if (!session) throw redirect({ to: "/login" })
    return { session }
  },
  component: Component,
})