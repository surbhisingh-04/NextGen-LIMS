import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { ScheduleTable, WorkflowTaskTable } from "@/components/dashboard/tables";
import { scheduleItems, workflowTasks } from "@/lib/demo-data";

export default function SchedulingPage() {
  return (
    <ModulePage
      eyebrow="Laboratory scheduling"
      title="Plan equipment, analyst, and study capacity before bottlenecks hit"
      description="This workspace addresses the scheduling feature from the blueprint with explicit resource planning and conflict visibility."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Resource calendar" description="Planned and active laboratory bookings">
          <ScheduleTable rows={scheduleItems} />
        </DataTableCard>
        <DataTableCard title="Downstream workflow impact" description="Tasks affected by upcoming capacity pressure">
          <WorkflowTaskTable rows={workflowTasks} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
