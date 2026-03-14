import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { BatchRecordsTable, SamplesTable } from "@/components/dashboard/tables";
import { batchRecords, samples } from "@/lib/demo-data";

export default function BatchesPage() {
  return (
    <ModulePage
      eyebrow="Batch management"
      title="Track batch genealogy and release traceability from sample to disposition"
      description="Forward and backward batch traceability is now represented explicitly, rather than being implied only through sample detail pages."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Batch genealogy" description="Trace release status, sample coverage, and manufacturing lineage">
          <BatchRecordsTable rows={batchRecords} />
        </DataTableCard>
        <DataTableCard title="Linked release samples" description="Samples contributing evidence to batch disposition">
          <SamplesTable rows={samples} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
