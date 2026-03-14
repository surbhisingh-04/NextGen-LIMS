import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModuleLinkGrid } from "@/components/dashboard/module-link-grid";
import { ModulePage } from "@/components/dashboard/module-page";
import { PredictiveForecastsTable } from "@/components/dashboard/tables";
import { predictiveForecasts } from "@/lib/demo-data";

const analyticsModules = [
  {
    title: "Overview analytics",
    description: "Throughput, turnaround, and release KPI visibility.",
    href: "/dashboard/overview-analytics"
  },
  {
    title: "Predictive analytics",
    description: "Forecast capacity, turnaround risk, and resource constraints.",
    href: "/analytics/predictive"
  },
  {
    title: "Knowledge graph",
    description: "Explore semantic links across samples, methods, results, and regulations.",
    href: "/analytics/knowledge-graph"
  }
];

export default function AnalyticsPage() {
  return (
    <ModulePage
      eyebrow="Analytics"
      title="Operational analytics with focused innovation modules"
      description="Only the two requested innovative capabilities are included here: Predictive Analytics and Knowledge Graph, alongside the baseline KPI views."
    >
      <ModuleLinkGrid items={analyticsModules} />
      <DataTableCard title="Forecast watchlist" description="High-priority predictive signals for lab leadership">
        <PredictiveForecastsTable rows={predictiveForecasts} />
      </DataTableCard>
    </ModulePage>
  );
}
