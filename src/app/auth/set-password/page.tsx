import Link from "next/link";
import { redirect } from "next/navigation";

import { setPasswordAction } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthContext } from "@/lib/auth";
import { getRoleDashboardPath } from "@/lib/rbac";

export default async function SetPasswordPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authContext = await getAuthContext();

  if (authContext.isAuthenticated && authContext.role === "client") {
    redirect(getRoleDashboardPath(authContext.role));
  }

  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="mx-auto flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-white/95">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Create your password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            You accepted an internal user invitation. Set your password once here, then future access happens through the shared login page with your email and password.
          </div>
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}
          {authContext.isAuthenticated ? (
            <form action={setPasswordAction} className="space-y-4">
              <Input
                name="password"
                placeholder="Create password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <Input
                name="confirmPassword"
                placeholder="Confirm password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <Button className="w-full" type="submit">
                Save password
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Open this page from the invitation email so Supabase can verify the invite first. If the link has expired, ask an administrator to resend your invitation.
              </div>
              <Link href="/login" className={buttonVariants({ className: "w-full" })}>
                Back to login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
