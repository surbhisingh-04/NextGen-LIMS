import Link from "next/link";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { Button } from "@/components/ui/button";
import { CustodyTable, SampleLifecycleTable, SamplesTable } from "@/components/dashboard/tables";
import { custodyEvents, sampleLifecycleEvents, samples } from "@/lib/demo-data";
import { getAuthContext } from "@/lib/auth";
import { getClientSamples } from "@/lib/queries";

export default async function SamplesPage() {
  const authContext = await getAuthContext();
  const isClient = authContext.role === "client";
  const rows = isClient ? await getClientSamples() : samples;

  return (
    <ModulePage
      eyebrow={isClient ? "Client samples" : "Sample lifecycle"}
      title={isClient ? "Submit and track your samples" : "Track every sample from receipt to disposition"}
      description={
        isClient
          ? "Submit a new sample request, follow its status, and access the latest client-visible updates from one place."
          : "Manage intake, chain-of-custody, due dates, assignments, and review status for manufacturing release, stability, and environmental monitoring programs."
      }
    >
      {isClient ? (
        <div className="flex flex-wrap gap-3">
          <Link href="/samples/sample-submission">
            <Button>Submit New Sample</Button>
          </Link>
          <Link href="/portal">
            <Button variant="outline">View Portal Requests</Button>
          </Link>
        </div>
      ) : null}
      <DataTableCard
        title={isClient ? "My submitted samples" : "Active sample queue"}
        description={
          isClient
            ? "Recent client submissions and the latest visible status in the lab workflow"
            : "Prioritized sample view with workflow and turnaround context"
        }
      >
        <SamplesTable rows={rows} />
      </DataTableCard>
      {!isClient ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <DataTableCard
            title="Sample lifecycle"
            description="Submission through archive or disposal with timestamped ownership"
          >
            <SampleLifecycleTable rows={sampleLifecycleEvents} />
          </DataTableCard>
          <DataTableCard
            title="Chain of custody"
            description="Barcode-ready transfer log across labs, stores, and review checkpoints"
          >
            <CustodyTable rows={custodyEvents} />
          </DataTableCard>
        </div>
      ) : null}
    </ModulePage>
  );
}
