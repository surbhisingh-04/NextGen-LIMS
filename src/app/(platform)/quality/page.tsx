import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModuleLinkGrid } from "@/components/dashboard/module-link-grid";
import { ModulePage } from "@/components/dashboard/module-page";
import { QualityTable } from "@/components/dashboard/tables";
import { qualityEvents } from "@/lib/demo-data";

const qualityModules = [
  {
    title: "QC monitoring",
    description: "Monitor deviations, OOS, and investigation queues.",
    href: "/qc/qc-monitoring"
  },
  {
    title: "Compliance",
    description: "Review regulatory frameworks and inspection readiness.",
    href: "/compliance"
  }
];

export default function QualityPage() {
  return (
    <ModulePage
      eyebrow="Quality"
      title="Review quality events and compliance actions in one place"
      description="This route completes the platform tree for quality-focused navigation and keeps event visibility centralized."
    >
      <ModuleLinkGrid items={qualityModules} />
      <DataTableCard title="Open quality events" description="Deviation, OOS, and CAPA records currently in play">
        <QualityTable rows={qualityEvents} />
      </DataTableCard>
    </ModulePage>
  );
}
