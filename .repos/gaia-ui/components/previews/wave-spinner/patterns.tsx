"use client";

import { WaveSpinner } from "@/registry/new-york/ui/wave-spinner";

export default function WaveSpinnerPatterns() {
  const patterns = [
    { name: "3×3 Grid", pattern: "square3x3" as const },
    { name: "2×2 Grid", pattern: "square2x2" as const },
    { name: "4×4 Grid", pattern: "square4x4" as const },
    { name: "Line", pattern: "line" as const },
    { name: "Diamond", pattern: "diamond" as const },
    { name: "Cross", pattern: "cross" as const },
    { name: "Circle", pattern: "circle" as const },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-10 p-8">
      {patterns.map(({ name, pattern }) => (
        <div key={pattern} className="flex flex-col items-center gap-3">
          <WaveSpinner pattern={pattern} size="lg" />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}
