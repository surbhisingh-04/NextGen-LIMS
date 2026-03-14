import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { ComplianceTable } from "@/components/dashboard/tables";
import { complianceReports } from "@/lib/demo-data";

export default function CompliancePage() {
  return (
    <ModulePage
      eyebrow="Compliance reporting"
      title="Generate audit-ready records with full data integrity context"
      description="Support 21 CFR Part 11, Annex 11, ISO 17025, and internal QA programs with versioned reports, signatures, and inspection-ready evidence."
    >
      <DataTableCard
        title="Compliance reports"
        description="Published and draft outputs mapped to regulatory frameworks"
      >
        <ComplianceTable rows={complianceReports} />
      </DataTableCard>
    </ModulePage>
  );
}
