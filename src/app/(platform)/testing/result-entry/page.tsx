import { ModulePage } from "@/components/dashboard/module-page";
import { TechnicianWorkbench } from "@/components/workflows/technician-workbench";
import { getTechnicianAssignments } from "@/lib/queries";

export default async function ResultEntryPage() {
  const assignments = await getTechnicianAssignments();

  return (
    <ModulePage
      eyebrow="Result entry"
      title="Capture and review test outcomes"
      description="Enter numeric values or attachments, then route results for QC review and release."
    >
      <TechnicianWorkbench assignments={assignments} />
    </ModulePage>
  );
}
