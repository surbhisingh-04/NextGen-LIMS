import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { DataExchangeTable, InstrumentImportsTable } from "@/components/dashboard/tables";
import { dataExchangeJobs, instrumentImports } from "@/lib/demo-data";

export default function DataExchangePage() {
  return (
    <ModulePage
      eyebrow="Data import / export"
      title="Move data cleanly between instruments, portals, and enterprise systems"
      description="This page captures the dedicated import/export requirement with operational job visibility beyond instrument parsing alone."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Exchange jobs" description="Tracked imports and exports across operational interfaces">
          <DataExchangeTable rows={dataExchangeJobs} />
        </DataTableCard>
        <DataTableCard title="Instrument payloads" description="Connected analyzer feeds contributing to exchange pipelines">
          <InstrumentImportsTable rows={instrumentImports} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
