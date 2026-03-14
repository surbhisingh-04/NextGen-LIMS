import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { AutomationRulesTable, WorkflowTable } from "@/components/dashboard/tables";
import { automationRules, workflowStages } from "@/lib/demo-data";

export default function WorkflowsPage() {
  return (
    <ModulePage
      eyebrow="Workflow orchestration"
      title="Basic workflow automation"
      description="Route samples, track stages, and automate simple handoffs."
    >
      <DataTableCard
        title="Workflow stage matrix"
        description="Current SLA load and automation coverage across the release process"
      >
        <WorkflowTable rows={workflowStages} />
      </DataTableCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard
          title="Automation rules"
          description="Configurable routing, escalation, and archive actions"
        >
          <AutomationRulesTable rows={automationRules} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
