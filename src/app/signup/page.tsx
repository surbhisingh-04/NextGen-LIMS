import Link from "next/link";
import { redirect } from "next/navigation";

import { signupAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthContext } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getRoleDashboardPath } from "@/lib/rbac";

export default async function SignupPage({
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
          <CardTitle className="text-2xl font-semibold">Create a client account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}
          <form action={signupAction} className="space-y-4">
            <Input name="fullName" placeholder="Full name" required autoComplete="name" />
            <Input name="company" placeholder="Company" required autoComplete="organization" />
            <Input name="phone" placeholder="Phone" required autoComplete="tel" />
            <Input name="email" placeholder="Email" type="email" required autoComplete="email" />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Button className="w-full" type="submit" disabled={!hasSupabaseEnv}>
              Sign up
            </Button>
          </form>
          <p className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-slate-900 underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
