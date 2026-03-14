import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthHashHandler } from "@/components/auth/auth-hash-handler";
import { getAuthContext } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getRoleDashboardPath } from "@/lib/rbac";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authContext = await getAuthContext();

  if (authContext.isAuthenticated && authContext.role) {
    redirect(getRoleDashboardPath(authContext.role));
  }

  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="mx-auto flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-white/95">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Login to NextGen LIMS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthHashHandler />
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}
          <form action={loginAction} className="space-y-4">
            <Input name="email" placeholder="Email" type="email" required autoComplete="email" />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
            />
            <Button className="w-full" type="submit" disabled={!hasSupabaseEnv}>
              Sign in
            </Button>
          </form>
          <p className="text-center text-xs text-slate-500">
            External client?{" "}
            <Link href="/signup" className="text-slate-900 underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
