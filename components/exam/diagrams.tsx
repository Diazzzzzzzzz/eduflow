"use client";

import * as React from "react";

/**
 * Diagrams for `labelling` groups.
 *
 * Content references a diagram by id and the engine looks it up here, so exam
 * content never carries raw markup — an uploaded test cannot inject SVG.
 */

function Callout({
  x,
  y,
  n,
}: {
  x: number;
  y: number;
  n: number;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={12}
        className="fill-primary"
        stroke="white"
        strokeWidth={2}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        className="fill-white"
        style={{ fontSize: 11, fontWeight: 700 }}
      >
        {n}
      </text>
    </g>
  );
}

function StreetCanyon() {
  return (
    <svg
      viewBox="0 0 440 280"
      className="h-auto w-full"
      role="img"
      aria-label="Cross-section of a street between two tall buildings, showing sunlight entering the gap, reflecting between the walls, striking the dark road, and heat leaving the walls after sunset."
    >
      {/* Sky */}
      <rect x="0" y="0" width="440" height="280" className="fill-secondary" />

      {/* Sun */}
      <circle cx="48" cy="42" r="16" className="fill-warning" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={48 + Math.cos(r) * 21}
            y1={42 + Math.sin(r) * 21}
            x2={48 + Math.cos(r) * 27}
            y2={42 + Math.sin(r) * 27}
            className="stroke-warning"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}

      {/* Buildings */}
      <rect x="40" y="80" width="120" height="160" className="fill-muted-foreground/30" />
      <rect x="280" y="80" width="120" height="160" className="fill-muted-foreground/30" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1].map((col) => (
          <React.Fragment key={`${row}-${col}`}>
            <rect
              x={60 + col * 55}
              y={98 + row * 36}
              width="30"
              height="22"
              className="fill-background/70"
            />
            <rect
              x={300 + col * 55}
              y={98 + row * 36}
              width="30"
              height="22"
              className="fill-background/70"
            />
          </React.Fragment>
        ))
      )}

      {/* Road */}
      <rect x="160" y="228" width="120" height="12" className="fill-foreground/80" />
      <rect x="40" y="240" width="360" height="10" className="fill-muted-foreground/40" />

      {/* Sky gap indicator (20) */}
      <line
        x1="160"
        y1="72"
        x2="280"
        y2="72"
        className="stroke-primary"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      <line x1="160" y1="64" x2="160" y2="80" className="stroke-primary" strokeWidth={2} />
      <line x1="280" y1="64" x2="280" y2="80" className="stroke-primary" strokeWidth={2} />
      <Callout x={220} y={48} n={20} />

      {/* Reflected rays (21) */}
      <path
        d="M120 74 L250 150 L170 190 L245 224"
        fill="none"
        className="stroke-warning"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd="url(#arrow)"
      />
      <Callout x={196} y={139} n={21} />

      {/* Road surface (22) */}
      <Callout x={220} y={258} n={22} />
      <line
        x1="220"
        y1="246"
        x2="220"
        y2="236"
        className="stroke-primary"
        strokeWidth={2}
      />

      {/* Heat leaving the wall (23) */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M292 ${150 + i * 24} q 8 -8 16 0 q 8 8 16 0`}
          fill="none"
          className="stroke-destructive"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
      <Callout x={352} y={174} n={23} />

      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-warning" />
        </marker>
      </defs>
    </svg>
  );
}

const REGISTRY: Record<string, React.FC> = {
  "street-canyon": StreetCanyon,
};

export function ExamDiagramView({ id }: { id: string }) {
  const Component = REGISTRY[id];
  if (!Component) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Схема недоступна
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border bg-card p-2">
      <Component />
    </div>
  );
}
