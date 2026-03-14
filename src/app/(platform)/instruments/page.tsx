import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { InstrumentImportsTable } from "@/components/dashboard/tables";
import { instrumentImports } from "@/lib/demo-data";

export default function InstrumentsPage() {
  return (
    <ModulePage
      eyebrow="Instrument integration"
      title="Ingest results from core instrument types"
      description="Support HPLC, GC-MS, and ICP-MS imports with basic CSV/API parsing and mapping."
    >
      <DataTableCard
        title="Instrument imports"
        description="CSV/API uploads with validation and sample mapping"
      >
        <InstrumentImportsTable rows={instrumentImports} />
      </DataTableCard>
    </ModulePage>
  );
}
