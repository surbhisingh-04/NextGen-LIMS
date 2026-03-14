import { inviteUserAction } from "@/app/actions";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActivityLogTable, UsersTable } from "@/components/dashboard/tables";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { activityLogs, users } from "@/lib/demo-data";

const authCapabilities = ["Email + Password"];

export default async function UserManagementPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <ModulePage
      eyebrow="User management"
      title="Control access and authentication"
      description="Assign role-based permissions, audit sign-ins, and review activity trends."
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
      <Card className="bg-white/85">
        <CardHeader>
          <CardTitle>Invite internal user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Admins create technician, lab manager, and QA/QC accounts here. Supabase sends an invitation email, the user creates a password from that link, and then later signs in through the shared login screen.
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
      <DataTableCard title="User directory" description="Role, status, and auth coverage">
        <UsersTable rows={users} />
      </DataTableCard>
      <div className="grid gap-4 md:grid-cols-3">
        {authCapabilities.map((item) => (
          <div key={item} className="rounded-[28px] border border-dashed border-border bg-white/80 p-5">
            <div className="text-sm uppercase tracking-[0.3em] text-slate-500">{item}</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">Provisioned</div>
          </div>
        ))}
      </div>
      <DataTableCard title="Admin audit" description="Recent security and access actions">
        <ActivityLogTable rows={activityLogs} />
      </DataTableCard>
    </ModulePage>
  );
}
