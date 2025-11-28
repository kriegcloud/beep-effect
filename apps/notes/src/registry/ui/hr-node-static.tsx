import { cn } from "@beep/notes/lib/utils";

import { SlateElement, type SlateElementProps } from "platejs/static";

export function HrElementStatic(props: SlateElementProps) {
  return (
    <SlateElement className="mb-1 py-2" {...props}>
      <div contentEditable={false}>
        <hr className={cn("h-0.5 cursor-pointer rounded-sm border-none bg-muted bg-clip-content")} />
      </div>
      {props.children}
    </SlateElement>
  );
}
