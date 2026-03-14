import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { TestDefinitionsTable } from "@/components/dashboard/tables";
import { testDefinitions } from "@/lib/demo-data";

export default function TestManagementPage() {
  return (
    <ModulePage
      eyebrow="Test management"
      title="Assign and govern laboratory testing"
      description="Define execution steps, ownership, and validation expectations before analysts begin work."
    >
      <DataTableCard
        title="Test definitions"
        description="Worksheet and instrument-driven test assignments with validation rules"
      >
        <TestDefinitionsTable rows={testDefinitions} />
      </DataTableCard>
    </ModulePage>
  );
}
