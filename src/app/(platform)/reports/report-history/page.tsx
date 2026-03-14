import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { ReportsTable } from "@/components/dashboard/tables";
import { generatedReports } from "@/lib/demo-data";

export default function ReportHistoryPage() {
  return (
    <ModulePage
      eyebrow="Report history"
      title="Archive of delivered exports"
      description="Browse past report releases, their status, and intended audience."
    >
      <DataTableCard title="Historical exports" description="Delivered reports with release metadata">
        <ReportsTable rows={generatedReports} />
      </DataTableCard>
    </ModulePage>
  );
}
