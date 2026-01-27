"use client";

import { Label } from "@beep/todox/components/ui/label";
import { Switch as ShadcnSwitch } from "@beep/todox/components/ui/switch";
import type * as React from "react";
import type { JSX } from "react";
import { useId } from "react";

export default function Switch({
  checked,
  onClick,
  text,
  id,
}: Readonly<{
  readonly checked: boolean;
  readonly id?: undefined | string;
  readonly onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  readonly text: string;
}>): JSX.Element {
  const generatedId = useId();
  const buttonId = id || generatedId;

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <Label htmlFor={buttonId} className="text-sm cursor-pointer">
        {text}
      </Label>
      <ShadcnSwitch
        id={buttonId}
        checked={checked}
        onCheckedChange={() => {
          // Create a synthetic mouse event to maintain API compatibility
          onClick({} as React.MouseEvent<HTMLButtonElement, MouseEvent>);
        }}
      />
    </div>
  );
}
