import Link from "next/link";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { Button } from "@/components/ui/button";
import { ReportsTable, SamplesTable } from "@/components/dashboard/tables";
import { getClientReports, getClientSamples } from "@/lib/queries";

const clientMetrics = [
  {
    label: "Submitted Samples",
    value: "18",
    trend: "+4",
    detail: "Samples sent into the portal this month"
  },
  {
    label: "Open Requests",
    value: "5",
    trend: "+1",
    detail: "Portal submissions or report requests still in progress"
  },
  {
    label: "Released Reports",
    value: "9",
    trend: "+2",
    detail: "Client-facing reports ready for download"
  }
];

export default async function ClientDashboardPage() {
  const [samples, reports] = await Promise.all([getClientSamples(), getClientReports()]);

  return (
    <ModulePage
      eyebrow="Client dashboard"
      title="Submit samples, follow progress, and access released reports"
      description="Clients land in a dedicated external workspace with sample submission, sample status, reports, notifications, and account settings tailored to their organization."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/samples/sample-submission">
          <Button>Submit New Sample</Button>
        </Link>
        <Link href="/portal">
          <Button variant="outline">Open Client Portal</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clientMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="My samples" description="Recent submissions and their current status">
          <SamplesTable rows={samples.slice(0, 3)} />
        </DataTableCard>
        <DataTableCard title="Released reports" description="Reports currently available to client users">
          <ReportsTable rows={reports.filter((report) => report.audience === "Client portal")} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
