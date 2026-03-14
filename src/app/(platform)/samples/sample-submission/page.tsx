import { ModulePage } from "@/components/dashboard/module-page";
import { RegisterSampleForm } from "@/components/dashboard/register-sample-form";

export default function SampleSubmissionPage() {
  return (
    <ModulePage
      eyebrow="Sample submission"
      title="Register a new sample"
      description="Capture chain-of-custody documents, due dates, and ownership before routing worklists."
    >
      <RegisterSampleForm />
    </ModulePage>
  );
}
