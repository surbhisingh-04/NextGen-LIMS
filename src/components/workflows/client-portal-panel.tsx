"use client";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { NotificationsTable, ReportsTable } from "@/components/dashboard/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedReport, NotificationItem, PortalRequest } from "@/lib/types";

export function ClientPortalPanel({
  requests,
  notifications,
  reports
}: {
  requests: PortalRequest[];
  notifications: NotificationItem[];
  reports: GeneratedReport[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Submit samples</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Send a new sample into the portal and hand it off to the lab intake workflow.
          </CardContent>
        </Card>
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Check status</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Track whether your request is submitted, in review, or completed from the same workspace.
          </CardContent>
        </Card>
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Get reports</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Once QA/QC approves the sample, the final report appears below and can be downloaded instantly.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTableCard title="Latest updates" description="Portal notifications and workflow messages sent to your account">
          <NotificationsTable rows={notifications} />
        </DataTableCard>
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Download final reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-sm text-slate-600">No released reports are available yet.</p>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-slate-900">{report.title}</div>
                    <div className="text-xs text-slate-500">
                      {report.type.toUpperCase()} · {report.format.toUpperCase()} · {new Date(report.generatedAt).toLocaleDateString("en-US")}
                    </div>
                  </div>
                  <a
                    href={`/api/reports/${report.id}/download`}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    Download
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <DataTableCard title="Released reports" description="Client-visible report history">
        <ReportsTable rows={reports} />
      </DataTableCard>
    </div>
  );
}
