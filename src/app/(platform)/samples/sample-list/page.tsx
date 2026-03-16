import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { SamplesTable } from "@/components/dashboard/tables";
import { getClientSamples } from "@/lib/queries";

export default async function SampleListPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const rows = await getClientSamples();

  return (
    <ModulePage
      eyebrow="Sample intake"
      title="Queue and timelines"
      description="Prioritized view of every open sample, status, and turnaround expectation."
    >
      <div className="space-y-4">
        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
      </div>
      <DataTableCard title="Sample queue" description="Active intake with workflow and due date context">
        <SamplesTable rows={rows} />
      </DataTableCard>
    </ModulePage>
  );
}
