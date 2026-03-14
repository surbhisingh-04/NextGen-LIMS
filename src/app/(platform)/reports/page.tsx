import { ModulePage } from "@/components/dashboard/module-page";
import { generatedReports } from "@/lib/demo-data";
import { getAuthContext } from "@/lib/auth";
import { ReportWorkflow } from "@/components/reports/report-workflow";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { GeneratedReport, ReportActivity } from "@/lib/types";

export default async function ReportsPage() {
  const authContext = await getAuthContext();
  const fallbackReports = generatedReports;
  const fallbackActivity: ReportActivity[] = [];
  let reports: GeneratedReport[] = fallbackReports;
  let activity: ReportActivity[] = fallbackActivity;

  if (hasSupabaseEnv) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const [{ data: reportRows }, { data: activityRows }] = await Promise.all([
        supabase
          .from("generated_reports")
          .select("id, title, report_type, file_format, generated_at, status")
          .order("generated_at", { ascending: false })
          .limit(50),
        supabase
          .from("report_activity")
          .select("id, action, actor_name, detail, created_at")
          .order("created_at", { ascending: false })
          .limit(20)
      ]);

      reports =
        reportRows?.map((row) => ({
          id: row.id,
          title: row.title,
          type: row.report_type,
          format: row.file_format,
          generatedAt: row.generated_at,
          status: row.status,
          audience: "Internal QA"
        })) ?? fallbackReports;

      activity =
        activityRows?.map((row) => ({
          id: row.id,
          action: row.action,
          actor: row.actor_name,
          detail: row.detail,
          occurredAt: row.created_at
        })) ?? fallbackActivity;
    }
  }

  return (
    <ModulePage
      eyebrow="Reporting"
      title="Generate and review reports"
      description="Create basic CSV/PDF exports and review recent releases in one place."
    >
      {authContext.role ? (
        <ReportWorkflow
          role={authContext.role}
          initialReports={reports}
          initialActivity={activity}
        />
      ) : null}
    </ModulePage>
  );
}
