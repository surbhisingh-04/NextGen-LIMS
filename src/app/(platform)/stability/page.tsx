import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { SamplesTable, StabilityStudiesTable } from "@/components/dashboard/tables";
import { samples, stabilityStudies } from "@/lib/demo-data";

export default function StabilityPage() {
  return (
    <ModulePage
      eyebrow="Stability program"
      title="Automate stability study pulls, storage conditions, and pull-point review"
      description="This closes the stability management feature from the blueprint with dedicated scheduling and study tracking visibility."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Study schedule" description="Protocol-driven pull points and storage conditions">
          <StabilityStudiesTable rows={stabilityStudies} />
        </DataTableCard>
        <DataTableCard title="Study-linked samples" description="Samples currently supporting active stability intervals">
          <SamplesTable rows={samples.filter((sample) => sample.workflow === "Stability Study")} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
