"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MockTest } from "@/lib/types";
import { SKILLS } from "@/lib/types";
import { SKILL_COLORS, SKILL_LABELS } from "@/lib/band";
import { formatMonthShort } from "@/lib/date";

export function SkillLineChart({ tests }: { tests: MockTest[] }) {
  const data = tests.map((t) => ({
    month: formatMonthShort(t.date),
    listening: t.listening,
    reading: t.reading,
    writing: t.writing,
    speaking: t.speaking,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <defs>
            {SKILLS.map((skill) => (
              <linearGradient
                key={skill}
                id={`fill-${skill}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={SKILL_COLORS[skill]}
                  stopOpacity={0.1}
                />
                <stop
                  offset="100%"
                  stopColor={SKILL_COLORS[skill]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
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
            formatter={(value: number, name: string) => [
              value.toFixed(1),
              SKILL_LABELS[name],
            ]}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">
                {SKILL_LABELS[value]}
              </span>
            )}
          />
          {SKILLS.map((skill) => (
            <Area
              key={skill}
              type="monotone"
              dataKey={skill}
              stroke={SKILL_COLORS[skill]}
              strokeWidth={2}
              fill={`url(#fill-${skill})`}
              dot={{ r: 3, strokeWidth: 0, fill: SKILL_COLORS[skill] }}
              activeDot={{ r: 5 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
