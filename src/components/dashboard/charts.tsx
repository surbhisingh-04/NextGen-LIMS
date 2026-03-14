"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForecastPoint, QcChartPoint, ThroughputPoint, TurnaroundPoint } from "@/lib/types";

export function ThroughputChart({ data }: { data: ThroughputPoint[] }) {
  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Weekly Throughput</CardTitle>
        <CardDescription>Registered samples versus approved releases</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="samples" fill="#0f766e" radius={[10, 10, 0, 0]} />
            <Bar dataKey="approvals" fill="#f59e0b" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TurnaroundChart({ data }: { data: TurnaroundPoint[] }) {
  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Turnaround by Stage</CardTitle>
        <CardDescription>SLA pressure points across the analytical workflow</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis dataKey="stage" type="category" tickLine={false} axisLine={false} width={100} />
            <Tooltip />
            <Bar dataKey="hours" radius={[0, 10, 10, 0]}>
              {data.map((point) => (
                <Cell
                  key={point.stage}
                  fill={point.hours > 10 ? "#ef4444" : point.hours > 6 ? "#f59e0b" : "#0f766e"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function QcControlChart({ data }: { data: QcChartPoint[] }) {
  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>QC Control Chart</CardTitle>
        <CardDescription>Monitor warning signals and out-of-spec drift over time</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="upperLimit" stroke="#ef4444" strokeDasharray="6 6" dot={false} />
            <Line type="monotone" dataKey="lowerLimit" stroke="#ef4444" strokeDasharray="6 6" dot={false} />
            <Line type="monotone" dataKey="mean" stroke="#0f172a" strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ForecastChart({ data }: { data: ForecastPoint[] }) {
  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Capacity Forecast</CardTitle>
        <CardDescription>Expected demand versus available lab capacity over the next five days</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="capacity" stroke="#0f766e" strokeWidth={3} />
            <Line type="monotone" dataKey="demand" stroke="#f59e0b" strokeWidth={3} />
            <Line type="monotone" dataKey="turnaround" stroke="#1e293b" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
