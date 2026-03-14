"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ReportsTable } from "@/components/dashboard/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GeneratedReport, ReportActivity, UserRole } from "@/lib/types";
import { approveReport, createReportDraft, rejectReport } from "@/app/(platform)/reports/actions";

const reportTypes = ["coa", "batch", "qc", "sample"] as const;
const reportFormats = ["pdf", "csv"] as const;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ReportWorkflow({
  role,
  initialReports,
  initialActivity
}: {
  role: UserRole;
  initialReports: GeneratedReport[];
  initialActivity: ReportActivity[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reports, setReports] = useState<GeneratedReport[]>(initialReports);
  const [activity, setActivity] = useState<ReportActivity[]>(initialActivity);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<(typeof reportTypes)[number]>("coa");
  const [format, setFormat] = useState<(typeof reportFormats)[number]>("pdf");
  const [audience, setAudience] = useState("Internal QA");
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const draftReports = useMemo(() => reports.filter((report) => report.status === "draft"), [reports]);
  const actionableDrafts = useMemo(
    () => draftReports.filter((report) => uuidRegex.test(report.id)),
    [draftReports]
  );
  const releasedReports = useMemo(() => reports.filter((report) => report.status === "released"), [reports]);
  const rejectedReports = useMemo(() => reports.filter((report) => report.status === "rejected"), [reports]);

  useEffect(() => {
    setReports(initialReports);
    setActivity(initialActivity);
  }, [initialReports, initialActivity]);

  async function handleCreateDraft() {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    try {
      setErrorMessage(null);
      await createReportDraft({
        title: trimmed,
        type,
        format,
        audience: audience.trim() || "Internal QA"
      });
      setTitle("");
      startTransition(() => router.refresh());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create report.");
    }
  }

  async function handleApprove(id: string) {
    try {
      setErrorMessage(null);
      await approveReport(id);
      startTransition(() => router.refresh());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to approve report.");
    }
  }

  async function handleReject(id: string) {
    const reason = rejectionReasons[id]?.trim() ?? "";
    if (!reason) {
      setErrorMessage("Add a rejection reason before rejecting.");
      return;
    }
    try {
      setErrorMessage(null);
      await rejectReport(id, reason);
      setRejectionReasons((prev) => ({ ...prev, [id]: "" }));
      startTransition(() => router.refresh());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to reject report.");
    }
  }

  if (role === "client") {
    return (
      <DataTableCard title="Released reports" description="Reports available for download">
        <ReportsTable rows={reports.filter((report) => report.status === "released")} />
      </DataTableCard>
    );
  }

  return (
    <div className="space-y-6">
      {role === "scientist_technician" ? (
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Create report data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
            <Input
              placeholder="Report title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Type (coa, qc)"
                value={type}
                onChange={(event) =>
                  setType((event.target.value as (typeof reportTypes)[number]) || "coa")
                }
              />
              <Input
                placeholder="Format (pdf, csv)"
                value={format}
                onChange={(event) =>
                  setFormat((event.target.value as (typeof reportFormats)[number]) || "pdf")
                }
              />
              <Input
                placeholder="Audience"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateDraft} disabled={!title.trim() || isPending}>
                Create draft
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {role === "qa_qc_manager" ? (
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Approve or reject drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
            {actionableDrafts.length === 0 ? (
              <p className="text-sm text-slate-600">No drafts awaiting approval.</p>
            ) : (
              actionableDrafts.map((report) => {
                const actionable = true;
                return (
                <div
                  key={report.id}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">{report.title}</div>
                    <div className="text-xs text-slate-500">
                      {report.type.toUpperCase()} · {report.format.toUpperCase()} · {report.audience}
                    </div>
                    <Input
                      className="mt-2"
                      placeholder="Rejection reason (required to reject)"
                      value={rejectionReasons[report.id] ?? ""}
                      onChange={(event) =>
                        setRejectionReasons((prev) => ({ ...prev, [report.id]: event.target.value }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(report.id)} disabled={isPending || !actionable}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(report.id)} disabled={isPending || !actionable}>
                      Reject
                    </Button>
                  </div>
                </div>
              )})
            )}
          </CardContent>
        </Card>
      ) : null}

      {role === "lab_manager" ? (
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Workflow monitoring</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Drafts</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{draftReports.length}</div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Released</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{releasedReports.length}</div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Rejected</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{rejectedReports.length}</div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {role === "admin" ? (
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>System audit trail</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              {activity.slice(0, 6).map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-4">
                  <span>
                    {entry.actor}: {entry.action}
                    {entry.detail ? (
                      <span className="block text-xs text-slate-500">{entry.detail}</span>
                    ) : null}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(entry.occurredAt).toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <DataTableCard title="Report history" description="All reports and current status">
        <ReportsTable rows={reports} />
      </DataTableCard>
    </div>
  );
}
