"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { submitTechnicianResult } from "@/app/(platform)/workflow-actions";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { TestDefinitionsTable } from "@/components/dashboard/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TestDefinition } from "@/lib/types";

export function TechnicianWorkbench({ assignments }: { assignments: TestDefinition[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    try {
      setMessage(null);
      setErrorMessage(null);
      await submitTechnicianResult({
        testDefinitionId: String(formData.get("testDefinitionId") ?? ""),
        methodName: String(formData.get("methodName") ?? ""),
        resultValue: String(formData.get("resultValue") ?? ""),
        specification: String(formData.get("specification") ?? "")
      });
      setMessage("Result submitted and routed to QA/QC review.");
      startTransition(() => router.refresh());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit result.");
    }
  }

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataTableCard title="Assigned tests" description="Current assignments routed into the technician queue">
          <TestDefinitionsTable rows={assignments} />
        </DataTableCard>
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Enter test result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-sm text-slate-600">No assigned tests are waiting for result entry.</p>
            ) : (
              assignments.slice(0, 3).map((assignment) => (
                <form
                  key={assignment.id}
                  action={handleSubmit}
                  className="space-y-3 rounded-2xl border border-border bg-white/70 p-4"
                >
                  <input type="hidden" name="testDefinitionId" value={assignment.id} />
                  <div>
                    <div className="font-medium text-slate-900">{assignment.sampleCode}</div>
                    <div className="text-xs text-slate-500">{assignment.testName}</div>
                  </div>
                  <input
                    name="methodName"
                    defaultValue={assignment.testName}
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                  />
                  <input
                    name="resultValue"
                    placeholder="Result value"
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                  />
                  <input
                    name="specification"
                    placeholder="Specification / acceptance criteria"
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                    defaultValue={assignment.validationRule}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isPending}>
                      Submit to QA/QC
                    </Button>
                  </div>
                </form>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
