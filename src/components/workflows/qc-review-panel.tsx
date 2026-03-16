"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { reviewQcResult } from "@/app/(platform)/workflow-actions";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { QualityTable, TestResultsTable } from "@/components/dashboard/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QualityEvent, TestResult } from "@/lib/types";

export function QcReviewPanel({
  reviewResults,
  qualityEvents
}: {
  reviewResults: TestResult[];
  qualityEvents: QualityEvent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  async function handleReview(resultId: string, decision: "approve" | "reject") {
    try {
      setMessage(null);
      setErrorMessage(null);
      await reviewQcResult({
        resultId,
        decision,
        reason: reasons[resultId] ?? ""
      });
      setMessage(decision === "approve" ? "Result approved and client report released." : "Result rejected and a quality event was logged.");
      startTransition(() => router.refresh());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to review result.");
    }
  }

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataTableCard title="Pending result review" description="Results waiting for QA/QC approval or rejection">
          <TestResultsTable rows={reviewResults} />
        </DataTableCard>
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Approve or reject</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewResults.length === 0 ? (
              <p className="text-sm text-slate-600">No test results are waiting for review.</p>
            ) : (
              reviewResults.map((result) => (
                <div key={result.id} className="rounded-2xl border border-border bg-white/70 p-4">
                  <div className="font-medium text-slate-900">{result.sampleCode}</div>
                  <div className="text-xs text-slate-500">
                    {result.method} · {result.analyst} · {new Date(result.completedAt).toLocaleString("en-US")}
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    Result: {result.result}
                    <br />
                    Specification: {result.specification}
                  </div>
                  <textarea
                    className="mt-3 min-h-24 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    placeholder="Reason required if rejecting"
                    value={reasons[result.id] ?? ""}
                    onChange={(event) =>
                      setReasons((prev) => ({
                        ...prev,
                        [result.id]: event.target.value
                      }))
                    }
                  />
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => handleReview(result.id, "approve")} disabled={isPending}>
                      Approve
                    </Button>
                    <Button variant="outline" onClick={() => handleReview(result.id, "reject")} disabled={isPending}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <DataTableCard title="Quality events" description="Deviations and investigations currently in play">
        <QualityTable rows={qualityEvents} />
      </DataTableCard>
    </div>
  );
}
