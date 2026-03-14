import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { NotificationsTable } from "@/components/dashboard/tables";
import { Card, CardContent } from "@/components/ui/card";
import { notifications } from "@/lib/demo-data";

const notificationFlows = [
  "Sample received",
  "Test completed",
  "QC failure",
  "Inventory alerts",
  "Workflow updates"
];

export default function NotificationsPage() {
  return (
    <ModulePage
      eyebrow="Notification system"
      title="Coordinate lab work through email and in-app notification flows"
      description="Notify analysts, reviewers, managers, and clients when sample events, test milestones, QC exceptions, inventory thresholds, or workflow transitions require attention."
    >
      <div className="grid gap-4 md:grid-cols-5">
        {notificationFlows.map((flow) => (
          <Card key={flow} className="bg-white/80">
            <CardContent className="p-5 text-sm font-medium text-slate-700">{flow}</CardContent>
          </Card>
        ))}
      </div>
      <DataTableCard
        title="Notification queue"
        description="Delivery state across email and in-app channels"
      >
        <NotificationsTable rows={notifications} />
      </DataTableCard>
    </ModulePage>
  );
}
