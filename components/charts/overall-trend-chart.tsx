"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MockTest } from "@/lib/types";
import { formatMonthShort } from "@/lib/date";

/** Overall band trajectory across a student's mock exams. */
export function OverallTrendChart({ tests }: { tests: MockTest[] }) {
  const data = tests.map((t) => ({
    month: formatMonthShort(t.date),
    overall: t.overall,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="fill-overall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-border"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            dy={6}
          />
          <YAxis
            domain={[4, 9]}
            ticks={[4, 5, 6, 7, 8, 9]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
          />
          <Tooltip
            cursor={{ stroke: "#2563EB", strokeOpacity: 0.2 }}
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              fontSize: 12,
              color: "hsl(var(--popover-foreground))",
              boxShadow:
                "0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px -8px rgba(15, 23, 42, 0.09)",
            }}
            formatter={(value: number) => [value.toFixed(1), "Общий балл"]}
          />
          <Area
            type="monotone"
            dataKey="overall"
            stroke="#2563EB"
            strokeWidth={2.5}
            fill="url(#fill-overall)"
            dot={{ r: 3, strokeWidth: 0, fill: "#2563EB" }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
