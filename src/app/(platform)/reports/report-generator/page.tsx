import { ModulePage } from "@/components/dashboard/module-page";
import { ReportGeneratorForm } from "@/components/reports/report-generator-form";

export default function ReportGeneratorPage() {
  return (
    <ModulePage
      eyebrow="Report generator"
      title="Draft a new report"
      description="Select the audience, template, and filters before exporting the PDF or CSV."
    >
      <ReportGeneratorForm />
    </ModulePage>
  );
}
