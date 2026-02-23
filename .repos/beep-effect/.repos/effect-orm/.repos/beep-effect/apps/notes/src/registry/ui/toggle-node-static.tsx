import { ChevronRightIcon } from "lucide-react";
import { SlateElement, type SlateElementProps } from "platejs/static";

export function ToggleElementStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props} className="mb-1 pl-6">
      <div>
        <span
          className="absolute top-0.5 left-0 flex cursor-pointer items-center justify-center rounded-sm p-px transition-bg-ease select-none hover:bg-slate-200"
          contentEditable={false}
        >
          <ChevronRightIcon className="rotate-0 transition-transform duration-75" />
        </span>
        {props.children}
      </div>
    </SlateElement>
  );
}
