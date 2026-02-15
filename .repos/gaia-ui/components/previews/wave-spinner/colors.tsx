"use client";

import { WaveSpinner } from "@/registry/new-york/ui/wave-spinner";

export default function WaveSpinnerColors() {
  const colors = [
    { name: "Primary", color: "primary" as const },
    { name: "Success", color: "success" as const },
    { name: "Warning", color: "warning" as const },
    { name: "Danger", color: "danger" as const },
    { name: "Purple", color: "purple" as const },
    { name: "Cyan", color: "cyan" as const },
    { name: "Rose", color: "rose" as const },
    { name: "Indigo", color: "indigo" as const },
    { name: "Emerald", color: "emerald" as const },
    { name: "Muted", color: "muted" as const },
  ];

  return (
    <div className="grid grid-cols-5 gap-8 p-8">
      {colors.map(({ name, color }) => (
        <div key={color} className="flex flex-col items-center gap-3">
          <WaveSpinner color={color} size="lg" />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}
