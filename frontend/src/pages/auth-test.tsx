import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Mail,
  ExternalLink,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { type AppType } from "../../../server/src/app"
import { hc } from "hono/client"
import type { Auth } from "node_modules/better-auth/dist/types/auth.d.mts"
const client = hc<AppType>("/api")

// Google Icon Component - Standard Google Colors kept for brand recognition
const GoogleIcon = () => (
  <svg
    className="mr-2"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
  >
    <path
      fill="#EA4335"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.43-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#4285F4"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export function AuthTest() {
  const { data: session, isPending, error } = authClient.useSession()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      })
    } catch (err) {
      console.error("Login failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    await authClient.signOut()
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 font-sans text-foreground md:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header & Status Label */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Auth Debugger</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">
              Session:
            </span>
            {isPending ? (
              <Badge variant="outline" className="animate-pulse">
                Checking...
              </Badge>
            ) : session ? (
              <Badge variant="default" className="gap-1">
                <ShieldCheck size={12} /> Authenticated
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <ShieldAlert size={12} /> Unauthenticated
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="auth">Actions</TabsTrigger>
            <TabsTrigger value="data" disabled={!session}>
              Raw Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auth">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>OAuth Testing</CardTitle>
                <CardDescription>
                  {session
                    ? "Verify your current credentials or terminate the session."
                    : "Connect your Google account to test the Better-Auth flow."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!session ? (
                  <Button
                    variant="outline"
                    className="h-12 w-full text-base font-semibold transition-all"
                    onClick={handleGoogleLogin}
                    disabled={loading || isPending}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Sign in with Google
                  </Button>
                ) : (
                  <div className="flex items-center space-x-4 rounded-lg border bg-muted/30 p-4">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary p-2">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="text-primary-foreground" size={20} />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="mb-1 truncate text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Active User
                      </p>
                      <p className="mb-1 truncate text-sm leading-none font-medium">
                        {session.user.name || "Anonymous User"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    <span className="bg-card px-3">Session Control</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={session ? "destructive" : "secondary"}
                    className="w-full"
                    disabled={!session || loading}
                    onClick={handleLogout}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Log Out
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 border-t bg-muted/10 pt-4">
                <div className="flex w-full items-center justify-between text-[11px] font-medium tracking-tighter text-muted-foreground uppercase">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> Google Provider
                  </span>
                  <span className="flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground">
                    Docs <ExternalLink size={10} />
                  </span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-sm">
                  authClient.session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border bg-secondary p-4">
                  <pre className="font-mono text-[10px] leading-relaxed text-secondary-foreground">
                    {JSON.stringify(
                      session || { message: "No active session" },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-xs text-destructive">
            <ShieldAlert className="mt-0.5 shrink-0" size={16} />
            <div>
              <p className="font-bold">Auth Client Error</p>
              <p className="opacity-90">
                {error.message || "Could not reach authentication server."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthTest
