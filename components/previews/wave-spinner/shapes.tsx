"use client";

import { WaveSpinner } from "@/registry/new-york/ui/wave-spinner";

export default function WaveSpinnerShapes() {
  const shapes = [
    { name: "Square", shape: "square" as const },
    { name: "Rounded", shape: "rounded" as const },
    { name: "Circle", shape: "circle" as const },
  ];

  return (
    <div className="flex items-center justify-center gap-12 p-8">
      {shapes.map(({ name, shape }) => (
        <div key={shape} className="flex flex-col items-center gap-3">
          <WaveSpinner dotShape={shape} size="xl" color="primary" />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}
