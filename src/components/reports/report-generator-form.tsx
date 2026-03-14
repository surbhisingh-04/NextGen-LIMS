"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ReportGeneratorForm() {
  const [reportName, setReportName] = useState("");
  const [template, setTemplate] = useState("");
  const [audience, setAudience] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message?: string }>({
    type: "idle"
  });

  const canGenerate = useMemo(
    () => reportName.trim().length > 0 && template.trim().length > 0 && audience.trim().length > 0,
    [reportName, template, audience]
  );

  function toCsvValue(value: string) {
    if (value.includes('"') || value.includes(",") || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  function handleGenerate() {
    if (!canGenerate) {
      setStatus({
        type: "error",
        message: "Add a report name, template, and audience before generating."
      });
      return;
    }

    const generatedAt = new Date().toISOString();
    const rows = [
      ["Report Name", "Template", "Audience", "Generated At"],
      [reportName.trim(), template.trim(), audience.trim(), generatedAt]
    ];
    const csv = rows.map((row) => row.map(toCsvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const fileSafeName =
      reportName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || "report";
    const downloadName = `${fileSafeName}-${generatedAt.slice(0, 10)}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setStatus({
      type: "success",
      message: `Report generated. Downloaded ${downloadName}.`
    });
  }

  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Configure export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Report name"
          value={reportName}
          onChange={(event) => setReportName(event.target.value)}
        />
        <Input
          placeholder="Template (e.g., CoA, QC Trend)"
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
        />
        <Input
          placeholder="Audience (e.g., Client portal, QA)"
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
        />
        {status.type !== "idle" ? (
          <p className={status.type === "error" ? "text-sm text-rose-600" : "text-sm text-emerald-600"}>
            {status.message}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={!canGenerate}>
            Generate report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
