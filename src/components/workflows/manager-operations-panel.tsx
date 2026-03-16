"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { assignClientSubmission, updateInventoryLevels } from "@/app/(platform)/workflow-actions";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { InventoryTable } from "@/components/dashboard/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryItem, UserProfile } from "@/lib/types";

type SubmissionQueueItem = {
  id: string;
  sampleId?: string | null;
  clientName: string;
  sampleCode: string;
  batchNumber: string;
  priority: "low" | "medium" | "high" | "critical";
  notes: string;
  status: string;
  requestedAt: string;
};

export function ManagerOperationsPanel({
  submissions,
  technicians,
  laboratories,
  workflows,
  inventory
}: {
  submissions: SubmissionQueueItem[];
  technicians: UserProfile[];
  laboratories: string[];
  workflows: string[];
  inventory: InventoryItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inventoryDrafts, setInventoryDrafts] = useState<Record<string, { quantity: string; reorderLevel: string }>>(
    {}
  );

  async function handleAssign(formData: FormData) {
    try {
      setErrorMessage(null);
      setMessage(null);
      await assignClientSubmission({
        requestId: String(formData.get("requestId") ?? ""),
        technicianId: String(formData.get("technicianId") ?? ""),
        laboratoryName: String(formData.get("laboratoryName") ?? ""),
        workflowName: String(formData.get("workflowName") ?? ""),
        dueAt: String(formData.get("dueAt") ?? "")
      });
      setMessage("Submission reviewed and assigned to the lab team.");
      startTransition(() => router.refresh());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to assign submission.");
    }
  }

  async function handleInventorySave(itemId: string) {
    const draft = inventoryDrafts[itemId];
    const current = inventory.find((item) => item.id === itemId);

    if (!current) {
      return;
    }

    try {
      setErrorMessage(null);
      setMessage(null);
      await updateInventoryLevels({
        itemId,
        quantity: Number(draft?.quantity ?? current.quantity),
        reorderLevel: Number(draft?.reorderLevel ?? current.reorderLevel)
      });
      setMessage("Inventory thresholds updated.");
      startTransition(() => router.refresh());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update inventory.");
    }
  }

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Incoming client submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-600">No new portal submissions are waiting for review.</p>
            ) : (
              submissions.map((submission) => (
                <form
                  key={submission.id}
                  action={handleAssign}
                  className="space-y-3 rounded-2xl border border-border bg-white/70 p-4"
                >
                  <input type="hidden" name="requestId" value={submission.id} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-slate-900">{submission.clientName}</div>
                      <div className="text-xs text-slate-500">
                        {submission.sampleCode} · Batch {submission.batchNumber} · {submission.priority}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{new Date(submission.requestedAt).toLocaleString("en-US")}</div>
                  </div>
                  {submission.notes ? (
                    <p className="text-sm text-slate-600">{submission.notes}</p>
                  ) : null}
                  <div className="grid gap-3 md:grid-cols-4">
                    <select
                      name="technicianId"
                      defaultValue={technicians[0]?.id ?? ""}
                      className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                    >
                      {technicians.map((technician) => (
                        <option key={technician.id} value={technician.id}>
                          {technician.fullName}
                        </option>
                      ))}
                    </select>
                    <select
                      name="laboratoryName"
                      defaultValue={laboratories[0] ?? ""}
                      className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                    >
                      {laboratories.map((lab) => (
                        <option key={lab} value={lab}>
                          {lab}
                        </option>
                      ))}
                    </select>
                    <select
                      name="workflowName"
                      defaultValue={workflows[0] ?? ""}
                      className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                    >
                      {workflows.map((workflow) => (
                        <option key={workflow} value={workflow}>
                          {workflow}
                        </option>
                      ))}
                    </select>
                    <input
                      name="dueAt"
                      type="date"
                      className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isPending || technicians.length === 0}>
                      Review and Assign
                    </Button>
                  </div>
                </form>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Inventory controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventory.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {item.category} · {item.location}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    value={inventoryDrafts[item.id]?.quantity ?? String(item.quantity)}
                    onChange={(event) =>
                      setInventoryDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          quantity: event.target.value,
                          reorderLevel: prev[item.id]?.reorderLevel ?? String(item.reorderLevel)
                        }
                      }))
                    }
                    className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                  />
                  <input
                    value={inventoryDrafts[item.id]?.reorderLevel ?? String(item.reorderLevel)}
                    onChange={(event) =>
                      setInventoryDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          quantity: prev[item.id]?.quantity ?? String(item.quantity),
                          reorderLevel: event.target.value
                        }
                      }))
                    }
                    className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleInventorySave(item.id)} disabled={isPending}>
                    Update stock
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <DataTableCard title="Inventory watchlist" description="Current inventory values and reorder thresholds">
        <InventoryTable rows={inventory} />
      </DataTableCard>
    </div>
  );
}
