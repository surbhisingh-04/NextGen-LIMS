import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { BillingTable, ReportsTable } from "@/components/dashboard/tables";
import { billingRecords, generatedReports } from "@/lib/demo-data";

export default function BillingPage() {
  return (
    <ModulePage
      eyebrow="Cost tracking and billing"
      title="Connect testing effort, deliverables, and invoice status for client programs"
      description="This closes the cost tracking and billing feature by linking service utilization to generated deliverables and invoice posture."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Billing status" description="Client invoices and test utilization summaries">
          <BillingTable rows={billingRecords} />
        </DataTableCard>
        <DataTableCard title="Billable deliverables" description="Released outputs supporting invoiceable work">
          <ReportsTable rows={generatedReports} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
