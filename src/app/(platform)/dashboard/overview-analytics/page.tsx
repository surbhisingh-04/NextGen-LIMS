import { ModulePage } from "@/components/dashboard/module-page";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ThroughputChart, TurnaroundChart } from "@/components/dashboard/charts";
import { getDashboardData } from "@/lib/queries";

export default async function OverviewAnalyticsPage() {
  const data = await getDashboardData();

  return (
    <ModulePage
      eyebrow="Dashboard analytics"
      title="Live throughput, SLA, and compliance scoring"
      description="Visualize sample velocity, turnaround risk, and platform health from a single analytics surface."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <ThroughputChart data={data.throughputData} />
        <TurnaroundChart data={data.turnaroundData} />
      </div>
    </ModulePage>
  );
}
