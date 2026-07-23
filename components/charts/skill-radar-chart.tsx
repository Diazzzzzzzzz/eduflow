"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { MockTest } from "@/lib/types";
import { SKILLS } from "@/lib/types";
import { SKILL_LABELS } from "@/lib/band";

export function SkillRadarChart({
  latest,
  target,
  heightClass = "h-72",
}: {
  latest: MockTest;
  target: number;
  heightClass?: string;
}) {
  const data = SKILLS.map((skill) => ({
    skill: SKILL_LABELS[skill],
    current: latest[skill],
    target,
  }));

  return (
    <div className={`${heightClass} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="currentColor" className="text-border" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 12, fill: "#94A3B8" }}
          />
          <PolarRadiusAxis
            domain={[0, 9]}
            tickCount={4}
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={false}
          />
          <Tooltip
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
              name === "current" ? "Текущий" : "Цель",
            ]}
          />
          <Radar
            name="target"
            dataKey="target"
            stroke="#94A3B8"
            strokeDasharray="4 4"
            fill="transparent"
          />
          <Radar
            name="current"
            dataKey="current"
            stroke="#2563EB"
            strokeWidth={2}
            fill="#2563EB"
            fillOpacity={0.14}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
