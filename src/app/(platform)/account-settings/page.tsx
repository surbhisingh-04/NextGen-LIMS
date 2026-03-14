import { updatePasswordAction } from "@/app/actions";
import { ModulePage } from "@/components/dashboard/module-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AccountSettingsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <ModulePage
      eyebrow="Account settings"
      title="Manage your profile and security"
      description="Update profile preferences and manage your password in one place."
    >
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/85">
          <CardHeader>
            <CardTitle>Organization profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Company name, billing contacts, and sample submission defaults are maintained here.</p>
            <p>Profile data is created during client signup and can be extended with CRM or ERP synchronization later.</p>
          </CardContent>
        </Card>
        <Card className="bg-white/85">
          <CardHeader>
            <CardTitle>Access preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Notification channels, contact phone numbers, and report-delivery preferences are managed here.</p>
            <p>Email and password authentication remains the only supported sign-in method for all client users.</p>
          </CardContent>
        </Card>
        <Card className="bg-white/85 lg:col-span-2">
          <CardHeader>
            <CardTitle>Update password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Use this form to set a new password for your account.
            </p>
            <form action={updatePasswordAction} className="grid gap-3 md:grid-cols-2">
              <Input name="password" placeholder="New password" type="password" required minLength={8} />
              <Input
                name="confirmPassword"
                placeholder="Confirm password"
                type="password"
                required
                minLength={8}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Save password</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  );
}
