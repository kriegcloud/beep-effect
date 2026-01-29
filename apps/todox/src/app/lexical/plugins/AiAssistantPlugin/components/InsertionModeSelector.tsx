"use client";

import { cn } from "@beep/todox/lib/utils";
import type { InsertionMode } from "../types";

interface InsertionModeSelectorProps {
  mode: InsertionMode;
  onModeChange: (mode: InsertionMode) => void;
}

const INSERTION_MODES: ReadonlyArray<{
  readonly value: InsertionMode;
  readonly label: string;
  readonly description: string;
}> = [
  { value: "replace", label: "Replace", description: "Replace selected text" },
  { value: "inline", label: "Inline", description: "Insert after selection" },
  { value: "below", label: "Below", description: "Insert in new paragraph" },
];

export function InsertionModeSelector({ mode, onModeChange }: InsertionModeSelectorProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">Insertion Mode</span>
      <div className="flex gap-1">
        {INSERTION_MODES.map((insertionMode) => (
          <button
            key={insertionMode.value}
            type="button"
            title={insertionMode.description}
            onClick={() => onModeChange(insertionMode.value)}
            className={cn(
              "px-3 py-1 text-sm rounded border transition-colors",
              mode === insertionMode.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-border"
            )}
          >
            {insertionMode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
