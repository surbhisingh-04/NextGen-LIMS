import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { CustodyTable, SampleLifecycleTable, SamplesTable } from "@/components/dashboard/tables";
import { custodyEvents, sampleLifecycleEvents, samples } from "@/lib/demo-data";

export default function SamplesPage() {
  return (
    <ModulePage
      eyebrow="Sample lifecycle"
      title="Track every sample from receipt to disposition"
      description="Manage intake, chain-of-custody, due dates, assignments, and review status for manufacturing release, stability, and environmental monitoring programs."
    >
      <DataTableCard
        title="Active sample queue"
        description="Prioritized sample view with workflow and turnaround context"
      >
        <SamplesTable rows={samples} />
      </DataTableCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard
          title="Sample lifecycle"
          description="Submission through archive or disposal with timestamped ownership"
        >
          <SampleLifecycleTable rows={sampleLifecycleEvents} />
        </DataTableCard>
        <DataTableCard
          title="Chain of custody"
          description="Barcode-ready transfer log across labs, stores, and review checkpoints"
        >
          <CustodyTable rows={custodyEvents} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
