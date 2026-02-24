"use client";

import { cn } from "@beep/notes/lib/utils";

import { PlateElement, type PlateElementProps, useFocused, useSelected } from "platejs/react";

export function HrElement(props: PlateElementProps) {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement className="mb-1 py-2" {...props}>
      <div contentEditable={false}>
        <hr
          className={cn(
            "h-0.5 cursor-pointer rounded-sm border-none bg-muted bg-clip-content",
            selected && focused && "ring-2 ring-ring ring-offset-2"
          )}
        />
      </div>
      {props.children}
    </PlateElement>
  );
}
