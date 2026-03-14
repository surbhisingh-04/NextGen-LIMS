import { DataTableCard } from "@/components/dashboard/data-table-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { QualityTable } from "@/components/dashboard/tables";
import { qualityEvents } from "@/lib/demo-data";

const qcMetrics = [
  {
    label: "Results Pending Review",
    value: "11",
    trend: "+2",
    detail: "Test outcomes awaiting QA or QC disposition"
  },
  {
    label: "Deviation Reports",
    value: "6",
    trend: "-1",
    detail: "Open investigations requiring quality follow-through"
  },
  {
    label: "Control Alerts",
    value: "2",
    trend: "0",
    detail: "QC controls outside preferred operating range"
  }
];

export default function QcDashboardPage() {
  return (
    <ModulePage
      eyebrow="QA / QC dashboard"
      title="Review results and manage quality signals"
      description="A focused workspace for reviewing results, handling deviations, and keeping quality decisions on track."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {qcMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <DataTableCard title="Deviation reports" description="Quality records currently driving action">
        <QualityTable rows={qualityEvents} />
      </DataTableCard>
    </ModulePage>
  );
}
