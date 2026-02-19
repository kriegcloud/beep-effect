import { cn } from "@beep/notes/lib/utils";

import type { TMentionElement } from "platejs";

import { IS_APPLE } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";
import * as React from "react";

export function MentionElementStatic({
  prefix,
  ...props
}: SlateElementProps<TMentionElement> & {
  readonly prefix?: undefined | string;
}) {
  const element = props.element;

  const firstChild = element.children[0];

  return (
    <SlateElement
      {...props}
      className={cn(
        "inline-block cursor-pointer rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium",
        firstChild && "bold" in firstChild && firstChild.bold === true && "font-bold",
        firstChild && "italic" in firstChild && firstChild.italic === true && "italic",
        firstChild && "underline" in firstChild && firstChild.underline === true && "underline"
      )}
      attributes={{
        ...props.attributes,
        "data-slate-value": element.value,
      }}
    >
      {IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <React.Fragment>
          {props.children}
          {prefix}
          {element.value}
        </React.Fragment>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <React.Fragment>
          {prefix}
          {element.value}
          {props.children}
        </React.Fragment>
      )}
    </SlateElement>
  );
}
