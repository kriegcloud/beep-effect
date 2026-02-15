"use client";

import { WaveSpinner } from "@/registry/new-york/ui/wave-spinner";

export default function WaveSpinnerAnimations() {
  const animations = [
    { name: "Diagonal TL", animation: "diagonalTL" as const },
    { name: "Diagonal TR", animation: "diagonalTR" as const },
    { name: "Diagonal BL", animation: "diagonalBL" as const },
    { name: "Diagonal BR", animation: "diagonalBR" as const },
    { name: "Ripple", animation: "ripple" as const },
    { name: "Horizontal", animation: "horizontal" as const },
    { name: "Vertical", animation: "vertical" as const },
    { name: "Spiral", animation: "spiral" as const },
  ];

  return (
    <div className="grid grid-cols-4 gap-8 p-8">
      {animations.map(({ name, animation }) => (
        <div key={animation} className="flex flex-col items-center gap-3">
          <WaveSpinner animation={animation} size="lg" color="primary" />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}
