import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { DocumentsTable } from "@/components/dashboard/tables";
import { documents } from "@/lib/demo-data";

export default function DocumentsPage() {
  return (
    <ModulePage
      eyebrow="Document management"
      title="Store SOPs, test methods, certificates, and controlled lab documents"
      description="Use Supabase Storage-backed document control for versioned procedures, supplier certificates, and laboratory reference material."
    >
      <DataTableCard
        title="Controlled documents"
        description="Versioned records available to laboratory and QA teams"
      >
        <DocumentsTable rows={documents} />
      </DataTableCard>
    </ModulePage>
  );
}
