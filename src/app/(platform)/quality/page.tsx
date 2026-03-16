import { ModuleLinkGrid } from "@/components/dashboard/module-link-grid";
import { ModulePage } from "@/components/dashboard/module-page";
import { QcReviewPanel } from "@/components/workflows/qc-review-panel";
import { getDashboardData, getQcReviewResults } from "@/lib/queries";

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

export default async function QualityPage() {
  const [data, reviewResults] = await Promise.all([getDashboardData(), getQcReviewResults()]);

  return (
    <ModulePage
      eyebrow="Quality"
      title="Review quality events and compliance actions in one place"
      description="This route completes the platform tree for quality-focused navigation and keeps event visibility centralized."
    >
      <ModuleLinkGrid items={qualityModules} />
      <QcReviewPanel reviewResults={reviewResults} qualityEvents={data.qualityEvents} />
    </ModulePage>
  );
}
