import { ModulePage } from "@/components/dashboard/module-page";
import { ActivityLogTable } from "@/components/dashboard/tables";
import { activityLogs } from "@/lib/demo-data";

export default function AuditLogsPage() {
  return (
    <ModulePage
      eyebrow="Audit logs"
      title="Trace administrative actions"
      description="Maintain tamper-resistant logs for platform configuration, workflow, and auth events."
    >
      <ActivityLogTable rows={activityLogs} />
    </ModulePage>
  );
}
