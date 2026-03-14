import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { TestResultsTable } from "@/components/dashboard/tables";
import { testResults } from "@/lib/demo-data";

export default function ResultEntryPage() {
  return (
    <ModulePage
      eyebrow="Result entry"
      title="Capture and review test outcomes"
      description="Enter numeric values or attachments, then route results for QC review and release."
    >
      <DataTableCard
        title="Results in review"
        description="CQ review queue showing analyst, method, and current status"
      >
        <TestResultsTable rows={testResults} />
      </DataTableCard>
    </ModulePage>
  );
}
