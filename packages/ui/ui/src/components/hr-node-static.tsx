import { cn } from "@beep/ui-core/utils";

import type { SlateElementProps } from "platejs/static";

import { SlateElement } from "platejs/static";

export function HrElementStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr className={cn("h-0.5 rounded-sm border-none bg-muted bg-clip-content")} />
      </div>
      {props.children}
    </SlateElement>
  );
}
