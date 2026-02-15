"use client";

import { WaveSpinner } from "@/registry/new-york/ui/wave-spinner";

export default function WaveSpinnerCustom() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <WaveSpinner
            color="#ff6b6b"
            size="lg"
            pattern="diamond"
            dotShape="circle"
          />
          <span className="text-xs text-muted-foreground">Coral Diamond</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <WaveSpinner
            color="linear-gradient(45deg, #00bbff, #a855f7)"
            size="lg"
            pattern="circle"
            duration={1.2}
          />
          <span className="text-xs text-muted-foreground">Gradient Circle</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <WaveSpinner
            color="#ffd93d"
            size="lg"
            pattern="cross"
            animation="ripple"
            dotShape="rounded"
          />
          <span className="text-xs text-muted-foreground">Yellow Cross</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <WaveSpinner
            color="#4ecdc4"
            size="lg"
            pattern="square4x4"
            animation="spiral"
            duration={1}
          />
          <span className="text-xs text-muted-foreground">Teal Spiral 4×4</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <WaveSpinner
            color="#ff9f43"
            size="lg"
            pattern="line"
            animation="horizontal"
            dotShape="circle"
          />
          <span className="text-xs text-muted-foreground">Orange Line</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <WaveSpinner
            color="#5f27cd"
            size="lg"
            pattern="square2x2"
            animation="ripple"
            dotShape="rounded"
          />
          <span className="text-xs text-muted-foreground">Purple 2×2</span>
        </div>
      </div>
    </div>
  );
}
