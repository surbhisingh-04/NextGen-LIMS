import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { SamplesTable } from "@/components/dashboard/tables";
import { samples } from "@/lib/demo-data";

export default function SampleListPage() {
  return (
    <ModulePage
      eyebrow="Sample intake"
      title="Queue and timelines"
      description="Prioritized view of every open sample, status, and turnaround expectation."
    >
      <DataTableCard title="Sample queue" description="Active intake with workflow and due date context">
        <SamplesTable rows={samples} />
      </DataTableCard>
    </ModulePage>
  );
}
