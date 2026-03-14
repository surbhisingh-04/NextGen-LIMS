import { DataTableCard } from "@/components/dashboard/data-table-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { SamplesTable } from "@/components/dashboard/tables";
import { getDashboardData } from "@/lib/queries";

export default async function LabDashboardPage() {
  const data = await getDashboardData();

  return (
    <ModulePage
      eyebrow="Lab manager dashboard"
      title="Coordinate operations, staffing, and laboratory throughput"
      description="This workspace is focused on sample flow, technician coverage, inventory readiness, and lab performance so managers can keep release commitments on track."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.metrics.slice(0, 3).map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <DataTableCard title="Pipeline watchlist" description="Samples currently shaping lab priorities">
        <SamplesTable rows={data.samples} />
      </DataTableCard>
    </ModulePage>
  );
}
