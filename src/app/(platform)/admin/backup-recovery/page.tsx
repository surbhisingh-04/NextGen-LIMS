import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { BackupSnapshotsTable, NotificationsTable } from "@/components/dashboard/tables";
import { backupSnapshots, notifications } from "@/lib/demo-data";

export default function BackupRecoveryPage() {
  return (
    <ModulePage
      eyebrow="Backup and recovery"
      title="Track recovery readiness, backup cadence, and resiliency exceptions"
      description="The blueprint called backup and disaster recovery a must-have, so this module makes resilience status explicit inside the platform."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Backup posture" description="Environment-level backup health and recovery objectives">
          <BackupSnapshotsTable rows={backupSnapshots} />
        </DataTableCard>
        <DataTableCard title="Operational alerts" description="Notifications that support recovery escalation and service awareness">
          <NotificationsTable rows={notifications} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
