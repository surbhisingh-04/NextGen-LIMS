import { ForecastChart } from "@/components/dashboard/charts";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { PredictiveForecastsTable } from "@/components/dashboard/tables";
import { dashboardMetrics, forecastTrend, predictiveForecasts } from "@/lib/demo-data";

export default function PredictiveAnalyticsPage() {
  return (
    <ModulePage
      eyebrow="Innovative feature"
      title="Predictive analytics for capacity, turnaround, and resource allocation"
      description="This is one of the only two innovative modules retained by request. It focuses on forecasting demand, turnaround pressure, and staffing or instrument rebalancing actions."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.slice(0, 4).map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ForecastChart data={forecastTrend} />
        <DataTableCard title="Forecast actions" description="Predicted operational shifts and recommended interventions">
          <PredictiveForecastsTable rows={predictiveForecasts} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
