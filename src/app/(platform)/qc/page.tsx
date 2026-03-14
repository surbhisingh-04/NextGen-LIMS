import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModuleLinkGrid } from "@/components/dashboard/module-link-grid";
import { ModulePage } from "@/components/dashboard/module-page";
import { QcSamplesTable, QualityTable } from "@/components/dashboard/tables";
import { qcSamples, qualityEvents } from "@/lib/demo-data";

const qualityModules = [
  {
    title: "QC monitoring",
    description: "Track deviations, CAPAs, and out-of-specification investigations.",
    href: "/qc/qc-monitoring"
  },
  {
    title: "Control charts",
    description: "Monitor statistical drift and control sample behavior over time.",
    href: "/qc/control-charts"
  },
  {
    title: "Compliance",
    description: "Review regulatory frameworks, inspection packs, and evidence readiness.",
    href: "/compliance"
  },
  {
    title: "Workflow orchestration",
    description: "Coordinate review gates, escalations, and approval tasks.",
    href: "/workflows"
  }
];

export default function QcPage() {
  return (
    <ModulePage
      eyebrow="Quality control"
      title="Maintain product quality, method control, and inspection readiness"
      description="QC sample management, control charts, investigations, compliance, and review workflows are surfaced together here for a complete quality operating view."
    >
      <ModuleLinkGrid items={qualityModules} />
      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="QC sample status" description="Controls and system suitability samples awaiting review">
          <QcSamplesTable rows={qcSamples} />
        </DataTableCard>
        <DataTableCard title="Quality events" description="Deviation and OOS records currently driving action">
          <QualityTable rows={qualityEvents} />
        </DataTableCard>
      </div>
    </ModulePage>
  );
}
