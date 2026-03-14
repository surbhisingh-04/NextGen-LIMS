import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { DocumentsTable, NotebookEntriesTable } from "@/components/dashboard/tables";
import { documents, notebookEntries } from "@/lib/demo-data";

export default function NotebooksPage() {
  return (
    <ModulePage
      eyebrow="Electronic lab notebook"
      title="Capture experiments, observations, and result context in a controlled ELN workspace"
      description="This page closes the ELN gap from the blueprint by exposing experiment records alongside the controlled references analysts rely on."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Notebook records" description="Versioned experiment and observation entries tied to sample work">
          <NotebookEntriesTable rows={notebookEntries} />
        </DataTableCard>
        <DataTableCard title="Linked controlled documents" description="SOPs and test procedures commonly referenced from ELN entries">
          <DocumentsTable rows={documents} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
