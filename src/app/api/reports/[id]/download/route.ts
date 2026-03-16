import { NextResponse } from "next/server";

import { generatedReports } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!hasSupabaseEnv) {
    const report = generatedReports.find((entry) => entry.id === id);

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const body = [
      `Report: ${report.title}`,
      `Type: ${report.type}`,
      `Format: ${report.format}`,
      `Status: ${report.status}`,
      `Generated: ${report.generatedAt}`
    ].join("\n");

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${report.title.replaceAll(" ", "-").toLowerCase()}.txt"`
      }
    });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data: report, error } = await supabase
    .from("generated_reports")
    .select("id, title, report_type, file_format, status, generated_at, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (error || !report) {
    return NextResponse.json({ error: error?.message ?? "Report not found." }, { status: 404 });
  }

  const extension = report.file_format === "csv" ? "csv" : "txt";
  const contentType = report.file_format === "csv" ? "text/csv; charset=utf-8" : "text/plain; charset=utf-8";
  const fileBody =
    report.file_format === "csv"
      ? `title,type,status,generated_at\n"${report.title}","${report.report_type}","${report.status}","${report.generated_at}"\n`
      : [
          `Report: ${report.title}`,
          `Type: ${report.report_type}`,
          `Status: ${report.status}`,
          `Generated: ${report.generated_at}`,
          `Storage path: ${report.storage_path ?? "Not attached"}`
        ].join("\n");

  return new NextResponse(fileBody, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${report.title.replaceAll(" ", "-").toLowerCase()}.${extension}"`
    }
  });
}
