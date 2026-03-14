import { DataTableCard } from "@/components/dashboard/data-table-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { ReportsTable, SamplesTable } from "@/components/dashboard/tables";
import { generatedReports, samples } from "@/lib/demo-data";

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

export default function ClientDashboardPage() {
  return (
    <ModulePage
      eyebrow="Client dashboard"
      title="Submit samples, follow progress, and access released reports"
      description="Clients land in a dedicated external workspace with sample submission, sample status, reports, notifications, and account settings tailored to their organization."
    >
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
          <ReportsTable rows={generatedReports.filter((report) => report.audience === "Client portal")} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
