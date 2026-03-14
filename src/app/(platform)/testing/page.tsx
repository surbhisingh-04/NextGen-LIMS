import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { TestDefinitionsTable } from "@/components/dashboard/tables";
import { testDefinitions } from "@/lib/demo-data";

export default function TestingPage() {
  return (
    <ModulePage
      eyebrow="Testing operations"
      title="Capture validated test results"
      description="Use structured result entry with validation rules to keep core data clean."
    >
      <DataTableCard title="Active test queue" description="Assigned and validation-aware tests currently in execution">
        <TestDefinitionsTable rows={testDefinitions} />
      </DataTableCard>
    </ModulePage>
  );
}
