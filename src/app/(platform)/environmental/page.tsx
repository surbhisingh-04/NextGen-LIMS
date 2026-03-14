import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { EnvironmentalReadingsTable, QcSamplesTable } from "@/components/dashboard/tables";
import { environmentalReadings, qcSamples } from "@/lib/demo-data";

export default function EnvironmentalPage() {
  return (
    <ModulePage
      eyebrow="Environmental monitoring"
      title="Monitor room conditions, particle trends, and contamination-relevant signals"
      description="Environmental monitoring is now captured as its own feature with real-time readings and links to quality control review."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Environmental readings" description="Temperature, humidity, particle, and microbial checkpoints">
          <EnvironmentalReadingsTable rows={environmentalReadings} />
        </DataTableCard>
        <DataTableCard title="Impact on QC" description="Quality controls that need attention when environment drifts">
          <QcSamplesTable rows={qcSamples} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
