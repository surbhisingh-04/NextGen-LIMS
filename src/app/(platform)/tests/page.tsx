import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModuleLinkGrid } from "@/components/dashboard/module-link-grid";
import { ModulePage } from "@/components/dashboard/module-page";
import { TestDefinitionsTable } from "@/components/dashboard/tables";
import { testDefinitions } from "@/lib/demo-data";

const testModules = [
  {
    title: "Test management",
    description: "Configure test definitions, assignments, and validation rules.",
    href: "/testing/test-management"
  },
  {
    title: "Result entry",
    description: "Capture and review test outcomes.",
    href: "/testing/result-entry"
  }
];

export default function TestsPage() {
  return (
    <ModulePage
      eyebrow="Tests"
      title="Structured test execution and validation"
      description="This route rounds out the platform route tree and points users into the primary testing workflows."
    >
      <ModuleLinkGrid items={testModules} />
      <DataTableCard title="Assigned tests" description="Active tests currently in execution or review">
        <TestDefinitionsTable rows={testDefinitions} />
      </DataTableCard>
    </ModulePage>
  );
}
