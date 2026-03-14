import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { QcControlChart } from "@/components/dashboard/charts";
import { qcChartData, qcSamples } from "@/lib/demo-data";
import { QcSamplesTable } from "@/components/dashboard/tables";

export default function ControlChartsPage() {
  return (
    <ModulePage
      eyebrow="Control charts"
      title="Statistical process control"
      description="Monitor control samples, warning thresholds, and trending deviations."
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <QcControlChart data={qcChartData} />
        <DataTableCard title="Control samples" description="Status of QC runs">
          <QcSamplesTable rows={qcSamples} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
