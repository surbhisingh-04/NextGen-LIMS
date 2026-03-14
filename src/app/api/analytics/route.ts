import { NextResponse } from "next/server";

import {
  dashboardMetrics,
  forecastTrend,
  knowledgeGraphRelations,
  predictiveForecasts,
  throughputData,
  turnaroundData
} from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({
    metrics: dashboardMetrics,
    throughput: throughputData,
    turnaround: turnaroundData,
    predictiveForecasts,
    forecastTrend,
    knowledgeGraphRelations
  });
}
