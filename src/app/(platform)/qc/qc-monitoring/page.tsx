import { DataTableCard } from "@/components/dashboard/data-table-card";
import { QcControlChart } from "@/components/dashboard/charts";
import { ModulePage } from "@/components/dashboard/module-page";
import { QualityTable } from "@/components/dashboard/tables";
import { qcChartData, qualityEvents } from "@/lib/demo-data";

export default function QcMonitoringPage() {
  return (
    <ModulePage
      eyebrow="QC monitoring"
      title="Track control limits and quality events"
      description="Surface warning indicators alongside deviation and OOS activity."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <QcControlChart data={qcChartData} />
        <DataTableCard title="Open events" description="Deviations, CAPAs, and investigations">
          <QualityTable rows={qualityEvents} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
