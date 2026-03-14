import { DataTableCard } from "@/components/dashboard/data-table-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { SamplesTable } from "@/components/dashboard/tables";
import { samples, testResults } from "@/lib/demo-data";

const technicianMetrics = [
  {
    label: "Assigned Today",
    value: "12",
    trend: "+3",
    detail: "Samples routed to the current technician queue"
  },
  {
    label: "Pending Results",
    value: "7",
    trend: "-2",
    detail: "Entries still waiting to be completed and submitted"
  },
  {
    label: "Overdue Samples",
    value: "2",
    trend: "-1",
    detail: "Assignments approaching or exceeding planned turnaround"
  }
];

export default function TechnicianDashboardPage() {
  const assignedSamples = samples.filter((sample) => sample.owner === "A. Patel" || sample.owner === "M. Lewis");
  const pendingResults = testResults.filter((result) => result.status !== "pass");

  return (
    <ModulePage
      eyebrow="Technician dashboard"
      title="Work today's assignments, test execution, and result entry"
      description="Technicians get a focused operational view that highlights assigned samples and outstanding result entry without exposing administrative controls."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {technicianMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <DataTableCard
        title="Assigned samples"
        description={`Current work routed into the technician queue (pending results: ${pendingResults.length}).`}
      >
        <SamplesTable rows={assignedSamples} />
      </DataTableCard>
    </ModulePage>
  );
}
