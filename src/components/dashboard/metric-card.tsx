import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "@/lib/types";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <Card className="overflow-hidden bg-white/75">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-3 font-display text-3xl font-semibold text-slate-950">{metric.value}</p>
          </div>
          <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 text-sm font-medium text-emerald-700">{metric.trend}</div>
        <div className="mt-1 text-sm text-slate-500">{metric.detail}</div>
      </CardContent>
    </Card>
  );
}
