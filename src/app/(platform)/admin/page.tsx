import { inviteUserAction } from "@/app/actions";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { ActivityLogTable, UsersTable } from "@/components/dashboard/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { activityLogs, users } from "@/lib/demo-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const inviteLink = typeof params.inviteLink === "string" ? params.inviteLink : undefined;
  const inviteError = typeof params.inviteError === "string" ? params.inviteError : undefined;

  return (
    <ModulePage
      eyebrow="Administration"
      title="Manage users and audit activity"
      description="Keep user access, roles, and audit trails in a single place."
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
      {inviteLink ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="font-semibold">Invite link</div>
          {inviteError ? (
            <div className="mt-1 text-xs text-amber-800">Email error: {inviteError}</div>
          ) : null}
          <code className="mt-2 block break-all rounded-xl bg-white/70 p-3 text-xs text-slate-800">
            {inviteLink}
          </code>
        </div>
      ) : null}
      <Card className="bg-white/85">
        <CardHeader>
          <CardTitle>Invite internal user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Admins create technician, lab manager, and QA/QC accounts here. Supabase sends an
            invitation email, the user creates a password from that link, and then later signs
            in through the shared login screen.
          </p>
          <form action={inviteUserAction} className="grid gap-3 md:grid-cols-2">
            <Input name="fullName" placeholder="Full name" required />
            <Input name="email" placeholder="Work email" type="email" required />
            <select
              name="role"
              required
              className="h-14 rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500"
              defaultValue="scientist_technician"
            >
              <option value="scientist_technician">Technician</option>
              <option value="qa_qc_manager">QA / QC Manager</option>
              <option value="lab_manager">Lab Manager</option>
            </select>
            <Button type="submit" disabled={!hasSupabaseAdminEnv}>
              Send invite
            </Button>
          </form>
          {!hasSupabaseAdminEnv ? (
            <p className="text-sm text-slate-500">
              Add a real `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` to activate admin invitations.
            </p>
          ) : null}
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Active users" description="Current internal and portal user roster">
          <UsersTable rows={users} />
        </DataTableCard>
        <DataTableCard title="Recent admin activity" description="Security, access, and system events">
          <ActivityLogTable rows={activityLogs} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
