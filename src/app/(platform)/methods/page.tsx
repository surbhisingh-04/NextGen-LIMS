import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { DocumentsTable, TestMethodsTable } from "@/components/dashboard/tables";
import { documents, testMethods } from "@/lib/demo-data";

export default function MethodsPage() {
  return (
    <ModulePage
      eyebrow="Test method management"
      title="Maintain approved analytical methods with ownership and version control"
      description="The blueprint called for a centralized method repository. This workspace brings method status, versions, and controlled references together."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Method library" description="Approved, draft, and retired methods by technique">
          <TestMethodsTable rows={testMethods} />
        </DataTableCard>
        <DataTableCard title="Controlled references" description="Documents backing active methods and procedural changes">
          <DocumentsTable rows={documents} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
