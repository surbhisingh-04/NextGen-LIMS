import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { PortalRequestsTable, ReportsTable } from "@/components/dashboard/tables";
import { generatedReports, portalRequests } from "@/lib/demo-data";

export default function PortalPage() {
  return (
    <ModulePage
      eyebrow="Client portal"
      title="Support external sample submissions, status checks, and report access"
      description="The client portal capability is now a first-class module for external collaboration rather than only being implied by user roles."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Portal requests" description="Recent client submissions, reviews, and download activity">
          <PortalRequestsTable rows={portalRequests} />
        </DataTableCard>
        <DataTableCard title="Client-facing reports" description="Released report packages exposed through the portal">
          <ReportsTable rows={generatedReports.filter((report) => report.audience === "Client portal")} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
