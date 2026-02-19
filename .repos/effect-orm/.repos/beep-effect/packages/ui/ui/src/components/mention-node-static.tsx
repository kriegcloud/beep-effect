import { cn } from "@beep/ui-core/utils";

import type { TMentionElement } from "platejs";
import { KEYS } from "platejs";
import type { SlateElementProps } from "platejs/static";
import { SlateElement } from "platejs/static";

export function MentionElementStatic(
  props: SlateElementProps<TMentionElement> & {
    readonly prefix?: undefined | string;
  }
) {
  const { prefix } = props;
  const element = props.element;

  return (
    <SlateElement
      {...props}
      className={cn(
        // Argument type "inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline font-medium text-sm" is not assignable to parameter type ClassValue
        "inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline font-medium text-sm",
        element.children[0]?.[KEYS.bold] === true && "font-bold",
        element.children[0]?.[KEYS.italic] === true && "italic",
        element.children[0]?.[KEYS.underline] === true && "underline"
      )}
      attributes={{
        ...props.attributes,
        "data-slate-value": element.value,
      }}
    >
      {props.children}
      {prefix}
      {element.value}
    </SlateElement>
  );
}
