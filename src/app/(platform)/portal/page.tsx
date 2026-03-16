import Link from "next/link";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { Button } from "@/components/ui/button";
import { PortalRequestsTable, ReportsTable } from "@/components/dashboard/tables";
import { ClientPortalPanel } from "@/components/workflows/client-portal-panel";
import { getClientPortalRequests, getClientReports, getUserNotifications } from "@/lib/queries";

export default async function PortalPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const [portalRequests, reports, notifications] = await Promise.all([
    getClientPortalRequests(),
    getClientReports(),
    getUserNotifications()
  ]);

  return (
    <ModulePage
      eyebrow="Client portal"
      title="Support external sample submissions, status checks, and report access"
      description="The client portal capability is now a first-class module for external collaboration rather than only being implied by user roles."
    >
      <div className="space-y-4">
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
        <div className="flex justify-end">
          <Link href="/samples/sample-submission">
            <Button>Submit New Sample</Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Portal requests" description="Recent client submissions, reviews, and download activity">
          <PortalRequestsTable rows={portalRequests} />
        </DataTableCard>
        <DataTableCard title="Client-facing reports" description="Released report packages exposed through the portal">
          <ReportsTable rows={reports.filter((report) => report.audience === "Client portal")} />
        </DataTableCard>
      </div>
      <ClientPortalPanel
        requests={portalRequests}
        notifications={notifications}
        reports={reports.filter((report) => report.audience === "Client portal")}
      />
    </ModulePage>
  );
}
