"use client";

import { WaveSpinner } from "@/registry/new-york/ui/wave-spinner";

export default function WaveSpinnerDefault() {
  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-3">
        <WaveSpinner size="sm" />
        <span className="text-xs text-muted-foreground">Small</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <WaveSpinner size="md" />
        <span className="text-xs text-muted-foreground">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <WaveSpinner size="lg" />
        <span className="text-xs text-muted-foreground">Large</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <WaveSpinner size="xl" />
        <span className="text-xs text-muted-foreground">Extra Large</span>
      </div>
    </div>
  );
}
